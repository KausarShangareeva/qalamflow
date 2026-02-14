const Book = require("../models/Book");
const Progress = require("../models/Progress");
const Schedule = require("../models/Schedule");
const PaceOverride = require("../models/PaceOverride");

// ─── Difficulty multipliers ───────────────────────────────────────
// A harder book takes longer per page; multiplier > 1 = slower effective pace
const DIFFICULTY_MULTIPLIER = {
  beginner: 0.85,    // easier content → faster effective pace
  intermediate: 1.0, // baseline
  advanced: 1.3,     // dense content → slower effective pace
};

// ─── Pace thresholds (pages per active day, by level) ─────────────
const PACE_THRESHOLDS = {
  beginner:     { slow: 3, normal: 7,  fast: 15 },
  intermediate: { slow: 5, normal: 12, fast: 25 },
  advanced:     { slow: 8, normal: 18, fast: 35 },
};

// ─── Helpers ──────────────────────────────────────────────────────
function round(num) {
  return Math.round(num * 10) / 10;
}

function getPaceRating(level, avgPagesPerDay) {
  const t = PACE_THRESHOLDS[level] || PACE_THRESHOLDS.beginner;
  if (avgPagesPerDay < t.slow) return "slow";
  if (avgPagesPerDay < t.normal) return "normal";
  if (avgPagesPerDay < t.fast) return "fast";
  return "very_fast";
}

/**
 * Weighted average: recent 7 days count 2× more than older data.
 * Returns { weightedPagesPerDay, recentPagesPerDay, overallPagesPerDay }
 */
function computeWeightedPace(progressEntries) {
  if (progressEntries.length === 0) {
    return { weightedPagesPerDay: 0, recentPagesPerDay: 0, overallPagesPerDay: 0 };
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let recentPages = 0;
  let recentDays = new Set();
  let olderPages = 0;
  let olderDays = new Set();

  for (const entry of progressEntries) {
    const entryDate = new Date(entry.date);
    const dayKey = entryDate.toISOString().split("T")[0];
    if (entryDate >= sevenDaysAgo) {
      recentPages += entry.pagesRead;
      recentDays.add(dayKey);
    } else {
      olderPages += entry.pagesRead;
      olderDays.add(dayKey);
    }
  }

  const recentActiveDays = recentDays.size || 0;
  const olderActiveDays = olderDays.size || 0;
  const totalActiveDays = recentActiveDays + olderActiveDays;

  const overallPagesPerDay = totalActiveDays > 0
    ? (recentPages + olderPages) / totalActiveDays
    : 0;

  const recentPagesPerDay = recentActiveDays > 0
    ? recentPages / recentActiveDays
    : 0;

  // Weighted: if we have recent data, weight it 2:1 vs older
  let weightedPagesPerDay;
  if (recentActiveDays > 0 && olderActiveDays > 0) {
    const olderPPD = olderPages / olderActiveDays;
    weightedPagesPerDay = (recentPagesPerDay * 2 + olderPPD) / 3;
  } else if (recentActiveDays > 0) {
    weightedPagesPerDay = recentPagesPerDay;
  } else {
    weightedPagesPerDay = overallPagesPerDay;
  }

  return {
    weightedPagesPerDay: round(weightedPagesPerDay),
    recentPagesPerDay: round(recentPagesPerDay),
    overallPagesPerDay: round(overallPagesPerDay),
  };
}

/**
 * Compute study frequency from schedule: how many days/week this book is scheduled.
 * Falls back to actual study frequency from progress data.
 */
async function getStudyFrequency(userId, bookId, progressEntries) {
  // Check explicit schedule first
  const schedules = await Schedule.find({ userId, bookId });
  if (schedules.length > 0) {
    const uniqueScheduledDays = new Set(schedules.map((s) => s.dayOfWeek));
    return { daysPerWeek: uniqueScheduledDays.size, source: "schedule" };
  }

  // Fall back: compute from actual study pattern
  if (progressEntries.length >= 2) {
    const firstDate = new Date(progressEntries[0].date);
    const lastDate = new Date(progressEntries[progressEntries.length - 1].date);
    const totalWeeks = Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 7));
    const uniqueDays = new Set(
      progressEntries.map((p) => new Date(p.date).toISOString().split("T")[0])
    );
    return { daysPerWeek: round(uniqueDays.size / totalWeeks), source: "history" };
  }

  return { daysPerWeek: 3, source: "default" };
}

/**
 * Weekly progress breakdown: pages read per week (last 8 weeks).
 */
function getWeeklyBreakdown(progressEntries) {
  const weeks = [];
  const now = new Date();

  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i * 7 + now.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekLabel = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    let pages = 0;
    let time = 0;
    let sessions = 0;

    for (const entry of progressEntries) {
      const d = new Date(entry.date);
      if (d >= weekStart && d < weekEnd) {
        pages += entry.pagesRead;
        time += entry.timeSpent;
        sessions++;
      }
    }

    weeks.push({ weekLabel, pages, time, sessions });
  }

  return weeks;
}

// ─── GET /api/forecast/:bookId ────────────────────────────────────
exports.getBookForecast = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const book = await Book.findOne({ _id: bookId, userId });
    if (!book) return res.status(404).json({ message: "Book not found" });

    const progressEntries = await Progress.find({ userId, bookId }).sort({ date: 1 });
    const paceOverride = await PaceOverride.findOne({ userId, bookId });

    const pagesRemaining = Math.max(0, book.pages - book.progress);

    if (progressEntries.length === 0 && !paceOverride) {
      return res.json({
        book: { id: book._id, title: book.title, author: book.author, level: book.level },
        totalPages: book.pages,
        pagesRead: book.progress,
        pagesRemaining,
        averagePagesPerActiveDay: 0,
        averagePagesPerCalendarDay: 0,
        averageTimePerSession: 0,
        weightedPagesPerDay: 0,
        recentPagesPerDay: 0,
        estimatedDaysLeft: null,
        estimatedCompletionDate: null,
        paceRating: null,
        percentComplete: round((book.progress / book.pages) * 100),
        difficultyMultiplier: DIFFICULTY_MULTIPLIER[book.level] || 1.0,
        studyFrequency: { daysPerWeek: 0, source: "none" },
        paceOverride: null,
        weeklyBreakdown: [],
        message: "Not enough data to forecast. Start logging progress!",
      });
    }

    // Compute pace metrics
    const { weightedPagesPerDay, recentPagesPerDay, overallPagesPerDay } =
      computeWeightedPace(progressEntries);

    // Time stats
    const totalTimeSpent = progressEntries.reduce((sum, p) => sum + p.timeSpent, 0);
    const uniqueActiveDays = new Set(
      progressEntries.map((p) => new Date(p.date).toISOString().split("T")[0])
    );
    const activeDays = uniqueActiveDays.size || 1;
    const avgTimePerSession = totalTimeSpent / activeDays;

    // Calendar day span
    const firstDate = progressEntries.length > 0 ? new Date(progressEntries[0].date) : new Date();
    const lastDate = progressEntries.length > 0
      ? new Date(progressEntries[progressEntries.length - 1].date)
      : new Date();
    const daySpan = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1);
    const avgPagesPerCalendarDay = progressEntries.length > 0
      ? (progressEntries.reduce((s, p) => s + p.pagesRead, 0)) / daySpan
      : 0;

    // Study frequency from schedule
    const studyFrequency = await getStudyFrequency(userId, bookId, progressEntries);

    // Difficulty factor
    const difficultyMult = DIFFICULTY_MULTIPLIER[book.level] || 1.0;

    // Effective pace: use override if set, otherwise weighted pace adjusted by difficulty
    let effectivePace;
    if (paceOverride) {
      effectivePace = paceOverride.pagesPerDay;
    } else {
      // Weighted pace adjusted by difficulty (higher difficulty = lower effective pace)
      effectivePace = weightedPagesPerDay / difficultyMult;
    }

    // Estimate days left using study frequency
    let estimatedDaysLeft = null;
    let estimatedCompletionDate = null;

    if (effectivePace > 0 && pagesRemaining > 0) {
      // If we know study days per week, convert active-day pace to calendar days
      const daysPerWeek = studyFrequency.daysPerWeek;
      const studyDaysNeeded = Math.ceil(pagesRemaining / effectivePace);
      if (daysPerWeek > 0 && daysPerWeek < 7) {
        // Convert study days → calendar days
        estimatedDaysLeft = Math.ceil(studyDaysNeeded * (7 / daysPerWeek));
      } else {
        estimatedDaysLeft = studyDaysNeeded;
      }
      estimatedCompletionDate = new Date();
      estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedDaysLeft);
    }

    // Pace rating based on weighted pace
    const paceRating = getPaceRating(book.level, weightedPagesPerDay);

    // Weekly breakdown (last 8 weeks)
    const weeklyBreakdown = getWeeklyBreakdown(progressEntries);

    res.json({
      book: { id: book._id, title: book.title, author: book.author, level: book.level },
      totalPages: book.pages,
      pagesRead: book.progress,
      pagesRemaining,
      activeDays,
      calendarDays: daySpan,
      averagePagesPerActiveDay: round(overallPagesPerDay),
      averagePagesPerCalendarDay: round(avgPagesPerCalendarDay),
      averageTimePerSession: round(avgTimePerSession),
      weightedPagesPerDay,
      recentPagesPerDay,
      effectivePace: round(effectivePace),
      estimatedDaysLeft,
      estimatedCompletionDate,
      paceRating,
      percentComplete: round((book.progress / book.pages) * 100),
      difficultyMultiplier: difficultyMult,
      studyFrequency,
      paceOverride: paceOverride ? { pagesPerDay: paceOverride.pagesPerDay } : null,
      weeklyBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/forecast ────────────────────────────────────────────
exports.getOverallForecast = async (req, res) => {
  try {
    const userId = req.user.id;
    const books = await Book.find({ userId, status: "studying" });

    const forecasts = await Promise.all(
      books.map(async (book) => {
        const progressEntries = await Progress.find({ userId, bookId: book._id }).sort({ date: 1 });
        const paceOverride = await PaceOverride.findOne({ userId, bookId: book._id });
        const pagesRemaining = Math.max(0, book.pages - book.progress);

        if (progressEntries.length === 0 && !paceOverride) {
          return {
            bookId: book._id,
            title: book.title,
            pagesRemaining,
            estimatedDaysLeft: null,
            estimatedCompletionDate: null,
          };
        }

        const { weightedPagesPerDay } = computeWeightedPace(progressEntries);
        const difficultyMult = DIFFICULTY_MULTIPLIER[book.level] || 1.0;
        const studyFrequency = await getStudyFrequency(userId, book._id, progressEntries);

        let effectivePace;
        if (paceOverride) {
          effectivePace = paceOverride.pagesPerDay;
        } else {
          effectivePace = weightedPagesPerDay / difficultyMult;
        }

        let estimatedDaysLeft = null;
        let estimatedCompletionDate = null;

        if (effectivePace > 0 && pagesRemaining > 0) {
          const studyDaysNeeded = Math.ceil(pagesRemaining / effectivePace);
          const daysPerWeek = studyFrequency.daysPerWeek;
          if (daysPerWeek > 0 && daysPerWeek < 7) {
            estimatedDaysLeft = Math.ceil(studyDaysNeeded * (7 / daysPerWeek));
          } else {
            estimatedDaysLeft = studyDaysNeeded;
          }
          estimatedCompletionDate = new Date();
          estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedDaysLeft);
        }

        return {
          bookId: book._id,
          title: book.title,
          percentComplete: round((book.progress / book.pages) * 100),
          pagesRemaining,
          estimatedDaysLeft,
          estimatedCompletionDate,
        };
      })
    );

    res.json({ books: forecasts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── What-if: POST /api/forecast/:bookId/whatif ───────────────────
exports.getWhatIf = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { pagesPerDay } = req.body;
    const userId = req.user.id;

    if (!pagesPerDay || pagesPerDay <= 0) {
      return res.status(400).json({ message: "pagesPerDay must be a positive number" });
    }

    const book = await Book.findOne({ _id: bookId, userId });
    if (!book) return res.status(404).json({ message: "Book not found" });

    const pagesRemaining = Math.max(0, book.pages - book.progress);
    const progressEntries = await Progress.find({ userId, bookId }).sort({ date: 1 });
    const studyFrequency = await getStudyFrequency(userId, bookId, progressEntries);

    let estimatedDaysLeft = null;
    let estimatedCompletionDate = null;

    if (pagesPerDay > 0 && pagesRemaining > 0) {
      const studyDaysNeeded = Math.ceil(pagesRemaining / pagesPerDay);
      const daysPerWeek = studyFrequency.daysPerWeek;
      if (daysPerWeek > 0 && daysPerWeek < 7) {
        estimatedDaysLeft = Math.ceil(studyDaysNeeded * (7 / daysPerWeek));
      } else {
        estimatedDaysLeft = studyDaysNeeded;
      }
      estimatedCompletionDate = new Date();
      estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedDaysLeft);
    }

    res.json({
      pagesPerDay,
      pagesRemaining,
      estimatedDaysLeft,
      estimatedCompletionDate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Pace Override CRUD ───────────────────────────────────────────

// PUT /api/forecast/:bookId/pace-override
exports.setPaceOverride = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { pagesPerDay } = req.body;
    const userId = req.user.id;

    if (!pagesPerDay || pagesPerDay <= 0) {
      return res.status(400).json({ message: "pagesPerDay must be a positive number" });
    }

    const book = await Book.findOne({ _id: bookId, userId });
    if (!book) return res.status(404).json({ message: "Book not found" });

    const override = await PaceOverride.findOneAndUpdate(
      { userId, bookId },
      { pagesPerDay },
      { upsert: true, new: true }
    );

    res.json({ pagesPerDay: override.pagesPerDay });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/forecast/:bookId/pace-override
exports.deletePaceOverride = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    await PaceOverride.findOneAndDelete({ userId, bookId });
    res.json({ message: "Pace override removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
