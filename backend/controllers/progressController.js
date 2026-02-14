const Progress = require("../models/Progress");
const Book = require("../models/Book");

// GET /api/progress — all progress records for current user
exports.getProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user.id })
      .populate("bookId", "title author")
      .sort({ date: -1 });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/progress/book/:bookId — progress for a specific book
exports.getProgressByBook = async (req, res) => {
  try {
    const progress = await Progress.find({
      userId: req.user.id,
      bookId: req.params.bookId,
    }).sort({ date: -1 });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/progress — log a new progress entry
exports.createProgress = async (req, res) => {
  try {
    const { bookId, date, pagesRead, timeSpent } = req.body;

    const progress = await Progress.create({
      userId: req.user.id,
      bookId,
      date: date || Date.now(),
      pagesRead,
      timeSpent,
    });

    // Update book progress (total pages read)
    const allProgress = await Progress.find({ userId: req.user.id, bookId });
    const totalPagesRead = allProgress.reduce((sum, p) => sum + p.pagesRead, 0);
    await Book.findByIdAndUpdate(bookId, { progress: totalPagesRead });

    res.status(201).json(progress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/progress/:id
exports.updateProgress = async (req, res) => {
  try {
    const progress = await Progress.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!progress) return res.status(404).json({ message: "Progress not found" });

    // Recalculate book progress
    const allProgress = await Progress.find({ userId: req.user.id, bookId: progress.bookId });
    const totalPagesRead = allProgress.reduce((sum, p) => sum + p.pagesRead, 0);
    await Book.findByIdAndUpdate(progress.bookId, { progress: totalPagesRead });

    res.json(progress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/progress/:id
exports.deleteProgress = async (req, res) => {
  try {
    const progress = await Progress.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!progress) return res.status(404).json({ message: "Progress not found" });

    // Recalculate book progress
    const allProgress = await Progress.find({ userId: req.user.id, bookId: progress.bookId });
    const totalPagesRead = allProgress.reduce((sum, p) => sum + p.pagesRead, 0);
    await Book.findByIdAndUpdate(progress.bookId, { progress: totalPagesRead });

    res.json({ message: "Progress deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
