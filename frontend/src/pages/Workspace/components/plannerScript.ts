import type { ScheduleEntry } from "../types";

export interface PlannerStep {
  key: string;
  question: string;
  options?: string[]; // если есть — кнопки; если нет — текстовый ввод
  condition?: (answers: Record<string, string>) => boolean;
  tip?: string; // доп. подсказка под вопросом
}

export interface PlannerCategory {
  id: string;
  label: string;
  planTitle: string;
  greeting: string;
  steps: PlannerStep[];
  generatePlan: (answers: Record<string, string>) => ScheduleEntry[];
  confirmMessage: (answers: Record<string, string>) => string;
}

// ─── Утилита: прибавить минуты к времени "HH:MM" ──────────
function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

// ─── Дни недели ────────────────────────────────────────────
const ALL_DAYS = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];
const WEEKDAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"];
const WEEKEND = ["Суббота", "Воскресенье"];

// ═══════════════════════════════════════════════════════════
// 📖 ХИФЗ (КОРАН) — Железный план
// ═══════════════════════════════════════════════════════════
const hifzCategory: PlannerCategory = {
  id: "hifz",
  label: "📖 Хифз (Коран)",
  planTitle: "План заучивания Корана",
  greeting: "Мир тебе, о Хафиз Корана!",

  steps: [
    {
      key: "progress",
      question: "Сколько джузов или страниц ты уже заучил на данный момент?",
      options: [
        "Только начинаю",
        "1 джуз",
        "2 джуза",
        "5 джузов +",
        "10 джузов +",
        "15 джузов +",
        "20 джузов +",
        "25 джузов +",
        "Хафиз Корана 🎓",
      ],
    },
    {
      key: "tempo",
      question: "В каком темпе ты хочешь двигаться?",
      // Для Хафиза этот вопрос не нужен — только мурааджа
      condition: (a) => !a.progress?.includes("Хафиз"),
      options: [
        "Полстраницы в день",
        "1 страницу в день",
        "2 страницы в день",
        "3 страницы в день",
      ],
    },
    {
      key: "speed",
      question: "Какова твоя текущая скорость заучивания одной страницы?",
      // Только если человек не Хафиз и не учит по полстраницы
      condition: (a) =>
        !a.progress?.includes("Хафиз") && !a.tempo?.includes("Полстраницы"),
      options: [
        "⚡️ Очень быстро (45–60 мин) — натренированная память",
        "📈 Средний темп (1–1.5 часа) — вдумчивое заучивание",
        "🐢 Тщательный подход (2 часа+) — разбираю каждое слово",
        "🔄 Поэтапно — учу по половине страницы в разные части дня",
      ],
    },
    {
      key: "speed_half",
      question:
        "Сколько времени уходит у тебя на заучивание половины страницы?",
      // Только для тех, кто учит по полстраницы
      condition: (a) => a.tempo?.includes("Полстраницы") ?? false,
      options: [
        "⚡️ Быстро (20–30 мин)",
        "📈 Средний темп (40–60 мин)",
        "🐢 Тщательно (1 час+)",
      ],
    },
    {
      key: "wakeup",
      question: "В котором часу ты обычно просыпаешься?",
      options: ["04:00", "05:00", "06:00", "07:00", "08:00"],
    },
  ],

  confirmMessage: (a) => {
    const tempo = a.tempo ?? "1 страницу в день";
    const speed = a.speed ?? a.speed_half ?? "";
    const progress = a.progress ?? "";
    const wakeup = a.wakeup ?? "06:00";
    const isHigh = tempo.includes("2") || tempo.includes("3");
    const isHafiz = progress.includes("Хафиз");
    const isHalf = tempo.includes("Полстраницы");

    // Длительность заучивания в зависимости от темпа и скорости
    const hifzDuration = isHalf
      ? speed.includes("Быстро")
        ? 25
        : speed.includes("Средний")
          ? 50
          : 70
      : speed.includes("Очень быстро")
        ? 60
        : speed.includes("Средний темп")
          ? 90
          : speed.includes("Тщательный")
            ? 120
            : speed.includes("Поэтапно")
              ? 60
              : 90;

    // Длительность мурааджа в зависимости от прогресса
    const muraajaDuration = isHafiz
      ? 120
      : progress.includes("25")
        ? 90
        : progress.includes("20")
          ? 75
          : progress.includes("15")
            ? 60
            : progress.includes("10")
              ? 45
              : progress.includes("5")
                ? 30
                : progress.includes("2")
                  ? 20
                  : progress.includes("1 джуз")
                    ? 15
                    : 0;

    const hifzStart = wakeup;
    const hifzEnd = addMinutes(hifzStart, hifzDuration);

    if (isHafiz) {
      return (
        `✅ МашаАллах, ты уже Хафиз! Вот план для поддержания Хифза:\n\n` +
        `🌙 02:00–04:00 — Вирд (ночное чтение)\n` +
        `🌅 ${wakeup}–${addMinutes(wakeup, 120)} — Мурааджа (утренний хизб)\n` +
        `🔁 10:00–11:30 — Мурааджа (дневной хизб)\n` +
        `🌙 19:00–21:00 — Вечерняя мурааджа\n\n` +
        `Применяем план на всю неделю?`
      );
    }

    return (
      `✅ Вот твой план Хифза (${tempo}):\n\n` +
      (isHigh ? `🌙 02:00–04:00 — Вирд (чтение 5 джузов)\n` : "") +
      `🌅 ${hifzStart}–${hifzEnd} — Заучивание новых аятов\n` +
      (isHalf || speed.includes("Поэтапно")
        ? `☀️ 14:00–${addMinutes("14:00", hifzDuration)} — Вторая часть страницы\n`
        : "") +
      `🌿 ${hifzEnd}–${addMinutes(hifzEnd, 30)} — Вирд\n` +
      (muraajaDuration > 0
        ? `🔁 10:00–${addMinutes("10:00", muraajaDuration)} — Мурааджа (${muraajaDuration} мин)\n`
        : "") +
      `🌙 19:00–21:00 — Ночная подготовка\n\n` +
      `Применяем план на всю неделю?`
    );
  },

  generatePlan: (answers) => {
    const tempo = answers.tempo ?? "1 страницу в день";
    const speed = answers.speed ?? answers.speed_half ?? "";
    const progress = answers.progress ?? "";
    const wakeup = answers.wakeup ?? "06:00";
    const isHigh = tempo.includes("2") || tempo.includes("3");
    const isHafiz = progress.includes("Хафиз");
    const isHalf = tempo.includes("Полстраницы");

    const hifzDuration = isHalf
      ? speed.includes("Быстро")
        ? 25
        : speed.includes("Средний")
          ? 50
          : 70
      : speed.includes("Очень быстро")
        ? 60
        : speed.includes("Средний темп")
          ? 90
          : speed.includes("Тщательный")
            ? 120
            : speed.includes("Поэтапно")
              ? 60
              : 90;

    // Чем больше выучено — тем больше времени нужно на мурааджа
    const muraajaDuration = isHafiz
      ? 120
      : progress.includes("25")
        ? 90
        : progress.includes("20")
          ? 75
          : progress.includes("15")
            ? 60
            : progress.includes("10")
              ? 45
              : progress.includes("5")
                ? 30
                : progress.includes("2")
                  ? 20
                  : progress.includes("1 джуз")
                    ? 15
                    : 0;

    const schedule: ScheduleEntry[] = [];

    if (isHafiz) {
      // Для Хафиза — только мурааджа, без заучивания
      ALL_DAYS.forEach((day) => {
        schedule.push({
          day,
          startTime: "02:00",
          course: "Вирд (ночное чтение)",
          duration: 120,
        });
        schedule.push({
          day,
          startTime: wakeup,
          course: "Мурааджа (утренний хизб)",
          duration: 120,
        });
        schedule.push({
          day,
          startTime: "10:00",
          course: "Мурааджа (дневной хизб)",
          duration: 90,
        });
        schedule.push({
          day,
          startTime: "19:00",
          course: "Вечерняя мурааджа",
          duration: 120,
        });
      });
      return schedule;
    }

    ALL_DAYS.forEach((day) => {
      if (isHigh) {
        schedule.push({
          day,
          startTime: "02:00",
          course: "Вирд (чтение 5 джузов)",
          duration: 120,
        });
      }
      schedule.push({
        day,
        startTime: wakeup,
        course: "Хифз Корана (новые аяты)",
        duration: hifzDuration,
      });
      schedule.push({
        day,
        startTime: addMinutes(wakeup, hifzDuration),
        course: "Вирд",
        duration: 30,
      });
      if (isHalf || speed.includes("Поэтапно")) {
        schedule.push({
          day,
          startTime: "14:00",
          course: "Хифз Корана (2-я часть)",
          duration: hifzDuration,
        });
      }
      if (muraajaDuration > 0) {
        schedule.push({
          day,
          startTime: "10:00",
          course: "Мурааджа",
          duration: muraajaDuration,
        });
      }
      schedule.push({
        day,
        startTime: "19:00",
        course: "Ночная подготовка",
        duration: 120,
      });
    });

    return schedule;
  },
};

// ═══════════════════════════════════════════════════════════
// 🌍 АРАБСКИЙ ЯЗЫК
// ═══════════════════════════════════════════════════════════
const arabicCategory: PlannerCategory = {
  id: "arabic",
  label: "🌍 Арабский язык",
  planTitle: "Путь арабского",
  greeting: "Мир тебе, о Арабист!",

  steps: [
    {
      key: "level",
      question: "Какой у тебя уровень арабского?",
      options: [
        "Полный ноль",
        "Знаю алфавит",
        "Начальный (A1–A2)",
        "Средний (B1–B2)",
        "Продвинутый (C1+)",
      ],
    },
    {
      key: "mode",
      question:
        "Ты учишься самостоятельно или у тебя есть фиксированные уроки с учителем?",
      options: ["С учителем (Telegram / центр)", "Самостоятельно"],
    },
    {
      key: "lessons",
      question:
        "Перечисли дни и время своих занятий с учителем\n(например: Понедельник 18:00, Среда 18:00)",
      condition: (a) => a.mode?.includes("учителем") ?? false,
    },
    {
      key: "resources",
      question: "Ты уже знаешь по какой программе заниматься?",
      options: ["Нет, предложи проверенные ресурсы 📚", "Да, знаю программу"],
      condition: (a) => a.mode?.includes("Самостоятельно") ?? false,
      tip: "📚 Рекомендуемые ресурсы:\n• @arabicwithus — Telegram-школа\n• Мединский курс (madinah.com)\n• YouTube: Arabic with Sam\n• Учебник Китаб аль-Асаси",
    },
    {
      key: "goal",
      question: "Какова твоя главная цель в изучении арабского?",
      options: [
        "Понимать Коран 📖",
        "Разговорный арабский 🗣️",
        "Чтение классических текстов 📜",
        "Всё сразу",
      ],
    },
    {
      key: "hours",
      question:
        "Сколько часов в день готов выделить на аудирование, чтение и письмо?",
      options: ["1 час", "2 часа", "3 часа", "4+ часа"],
    },
  ],

  confirmMessage: (a) => {
    const h = a.hours?.includes("1")
      ? 1
      : a.hours?.includes("2")
        ? 2
        : a.hours?.includes("3")
          ? 3
          : 4;
    const goal = a.goal ?? "";
    const lvl = a.level ?? "";

    // Акцент в зависимости от цели
    const focus = goal.includes("Коран")
      ? "Коранический словарный запас и грамматика"
      : goal.includes("Разговорный")
        ? "Разговорная практика и аудирование"
        : goal.includes("классических")
          ? "Классическая грамматика (нахв/сарф)"
          : "Грамматика + разговорная практика";

    // Начинающим — больше времени на алфавит и базу
    const grammarNote =
      lvl.includes("ноль") || lvl.includes("алфавит")
        ? "  (начинаем с алфавита и базовых слов)"
        : "";

    return (
      `✅ Отлично! Вот твоё расписание арабского:\n\n` +
      `🎯 Фокус: ${focus}\n\n` +
      `🌅 07:00–${h >= 2 ? "08:00" : "07:30"} — Грамматика${grammarNote}\n` +
      `🎧 17:00–18:00 — Аудирование\n` +
      (goal.includes("Разговорный") || goal.includes("Всё")
        ? `🗣️ 18:00–18:30 — Разговорная практика\n`
        : "") +
      (h >= 3 ? `✍️ 20:00–21:00 — Письмо\n` : "") +
      `\nВыходные — повторение + разговорная практика\n\nПрименяем?`
    );
  },

  generatePlan: (answers) => {
    const hours = answers.hours?.includes("1")
      ? 1
      : answers.hours?.includes("2")
        ? 2
        : answers.hours?.includes("3")
          ? 3
          : 4;
    const goal = answers.goal ?? "";
    const lvl = answers.level ?? "";
    const mode = answers.mode ?? "";
    const schedule: ScheduleEntry[] = [];

    // Название курса грамматики зависит от уровня
    const grammarCourse =
      lvl.includes("ноль") || lvl.includes("алфавит")
        ? "Арабский — алфавит и база"
        : lvl.includes("Средний") || lvl.includes("Продвинутый")
          ? "Арабский — нахв/сарф"
          : "Арабский — грамматика";

    // Аудирование/разговор зависит от цели
    const listeningCourse = goal.includes("Коран")
      ? "Арабский — Коранический словарь"
      : "Арабский — аудирование";

    WEEKDAYS.forEach((day) => {
      schedule.push({
        day,
        startTime: "07:00",
        course: grammarCourse,
        duration: hours >= 2 ? 60 : 30,
      });
      schedule.push({
        day,
        startTime: "17:00",
        course: listeningCourse,
        duration: 60,
      });

      // Разговорная практика — только если цель разговорный или "всё сразу"
      if (goal.includes("Разговорный") || goal.includes("Всё")) {
        schedule.push({
          day,
          startTime: "18:00",
          course: "Арабский — разговорная практика",
          duration: 30,
        });
      }

      if (hours >= 3) {
        schedule.push({
          day,
          startTime: "20:00",
          course: "Арабский — письмо",
          duration: 60,
        });
      }

      // Дополнительный час для 4+ часов
      if (hours >= 4) {
        schedule.push({
          day,
          startTime: "21:00",
          course: "Арабский — чтение текстов",
          duration: 60,
        });
      }
    });

    WEEKEND.forEach((day) => {
      schedule.push({
        day,
        startTime: "09:00",
        course: "Арабский — повторение",
        duration: 90,
      });

      // Выходные: для самостоятельных — разговорная практика, для учителя — подготовка к уроку
      if (mode.includes("учителем")) {
        schedule.push({
          day,
          startTime: "15:00",
          course: "Арабский — подготовка к уроку",
          duration: 60,
        });
      } else {
        schedule.push({
          day,
          startTime: "15:00",
          course: "Арабский — разговорная практика",
          duration: 60,
        });
      }
    });

    return schedule;
  },
};

// ═══════════════════════════════════════════════════════════
// 🎓 IELTS
// ═══════════════════════════════════════════════════════════
const ieltsCategory: PlannerCategory = {
  id: "ielts",
  label: "🎓 IELTS",
  planTitle: "Цель: IELTS",
  greeting: "Мир тебе, о будущий Scholar!",

  steps: [
    {
      key: "target",
      question: "Какой твой целевой балл?",
      options: ["6.0", "6.5", "7.0", "7.5", "8.0+"],
    },
    {
      key: "deadline",
      question: "Когда дата экзамена (сколько времени осталось)?",
      options: [
        "2–4 недели",
        "1–2 месяца",
        "3–6 месяцев",
        "Дата не определена",
      ],
    },
    {
      key: "weak",
      question: "Какой навык у тебя самый слабый?",
      options: ["Writing ✍️", "Speaking 🗣️", "Reading 📖", "Listening 🎧"],
    },
    {
      key: "strong",
      question: "Какой навык у тебя самый сильный?",
      options: ["Writing ✍️", "Speaking 🗣️", "Reading 📖", "Listening 🎧"],
    },
    {
      key: "daily_hours",
      question: "Сколько часов в день ты готов заниматься?",
      options: ["1–2 часа", "3–4 часа", "5+ часов"],
    },
  ],

  confirmMessage: (a) => {
    const weak = a.weak?.split(" ")[0] ?? "Writing";
    const strong = a.strong?.split(" ")[0] ?? "Reading";
    const target = a.target ?? "7.0";
    const deadline = a.deadline ?? "3–6 месяцев";
    const dailyHours = a.daily_hours ?? "3–4 часа";

    // Интенсивность зависит от дедлайна
    const intensity = deadline.includes("2–4 недели")
      ? "🔥 Интенсивный режим"
      : deadline.includes("1–2 месяца")
        ? "⚡️ Ускоренный режим"
        : "📈 Стандартный режим";

    // Слабый навык получает больше времени
    const weakExtra = `📌 Слабый навык (${weak}) — дополнительно 60 мин в выходные\n`;

    // При малом времени — фокус только на слабом навыке
    const focusNote = dailyHours.includes("1–2")
      ? `⚠️ При 1–2 часах в день фокусируемся прежде всего на ${weak}\n\n`
      : "";

    return (
      `✅ Отлично! Вот твой план IELTS (цель: ${target}, ${intensity}):\n\n` +
      focusNote +
      `🌅 Утро — восприятие:\n` +
      `  07:00–08:00 Listening\n` +
      `  08:00–09:00 Reading\n\n` +
      `🌆 Вечер — практика:\n` +
      `  18:00–19:00 Writing\n` +
      `  19:00–20:00 Speaking\n\n` +
      weakExtra +
      `💪 Сильный навык (${strong}) — поддерживаем в будни\n\n` +
      `Применяем?`
    );
  },

  generatePlan: (answers) => {
    const weak = answers.weak ?? "";
    const strong = answers.strong ?? "";
    const target = answers.target ?? "7.0";
    const deadline = answers.deadline ?? "";
    const dailyHours = answers.daily_hours ?? "";
    const schedule: ScheduleEntry[] = [];

    // Высокая цель (7.5+) — добавляем Vocabulary
    const needsVocab = target.includes("7.5") || target.includes("8.0");

    // Интенсивный режим при близком дедлайне
    const isIntensive =
      deadline.includes("2–4 недели") || deadline.includes("1–2 месяца");

    // Мало времени — сокращаем сессии
    const sessionLen = dailyHours.includes("1–2") ? 45 : 60;

    // Слабый навык получает удвоенное время в будни
    const weakDuration = dailyHours.includes("1–2")
      ? sessionLen
      : sessionLen + 30;

    const weakCourse = weak.includes("Writing")
      ? "IELTS — Writing (углублённо)"
      : weak.includes("Speaking")
        ? "IELTS — Speaking (практика)"
        : weak.includes("Reading")
          ? "IELTS — Reading (тренировка)"
          : "IELTS — Listening (интенсив)";

    const strongCourse = strong.includes("Writing")
      ? "IELTS — Writing (поддержка)"
      : strong.includes("Speaking")
        ? "IELTS — Speaking (поддержка)"
        : strong.includes("Reading")
          ? "IELTS — Reading (поддержка)"
          : "IELTS — Listening (поддержка)";

    WEEKDAYS.forEach((day) => {
      // Слабый навык — всегда первым и с увеличенным временем
      schedule.push({
        day,
        startTime: "07:00",
        course: weakCourse,
        duration: weakDuration,
      });
      schedule.push({
        day,
        startTime: "09:00",
        course: "IELTS — Listening",
        duration: sessionLen,
      });
      schedule.push({
        day,
        startTime: "17:00",
        course: "IELTS — Reading",
        duration: sessionLen,
      });
      schedule.push({
        day,
        startTime: "18:00",
        course: "IELTS — Writing",
        duration: sessionLen,
      });

      // Speaking — только если не слабый (иначе уже добавлен выше с увеличенным временем)
      if (!weak.includes("Speaking")) {
        schedule.push({
          day,
          startTime: "19:00",
          course: "IELTS — Speaking",
          duration: sessionLen,
        });
      }

      if (needsVocab) {
        schedule.push({
          day,
          startTime: "20:00",
          course: "IELTS — Vocabulary",
          duration: 30,
        });
      }

      // При интенсивном режиме — дополнительная сессия вечером
      if (isIntensive && !dailyHours.includes("1–2")) {
        schedule.push({
          day,
          startTime: "21:00",
          course: "IELTS — Mock Test Practice",
          duration: 45,
        });
      }
    });

    WEEKEND.forEach((day) => {
      // Выходные — углублённая работа над слабым навыком
      schedule.push({
        day,
        startTime: "10:00",
        course: weakCourse,
        duration: 120,
      });
      schedule.push({
        day,
        startTime: "13:00",
        course: strongCourse,
        duration: 60,
      });
      schedule.push({
        day,
        startTime: "15:00",
        course: "IELTS — Vocabulary & Grammar",
        duration: 60,
      });

      if (isIntensive) {
        schedule.push({
          day,
          startTime: "17:00",
          course: "IELTS — Full Mock Test",
          duration: 180,
        });
      }
    });

    return schedule;
  },
};

// ═══════════════════════════════════════════════════════════
// 🛠 ДРУГОЕ (Общее планирование)
// ═══════════════════════════════════════════════════════════
const otherCategory: PlannerCategory = {
  id: "other",
  label: "🛠 Другое",
  planTitle: "План недели",
  greeting: "Мир тебе, о целеустремлённый!",

  steps: [
    {
      key: "tasks",
      question: "Опиши свои главные задачи на неделю (что хочешь успеть?):",
    },
    {
      key: "priority",
      question: "Сколько у тебя приоритетных задач?",
      options: ["1 задача", "2 задачи", "3 задачи", "4+ задачи"],
    },
    {
      key: "free_time",
      question: "Когда у тебя обычно свободное время?",
      options: [
        "Утром (06:00–12:00)",
        "Днём (12:00–17:00)",
        "Вечером (17:00–22:00)",
        "Везде понемногу",
      ],
    },
    {
      key: "session_len",
      question: "Как долго ты можешь сосредоточенно работать без перерыва?",
      options: ["25 мин (Pomodoro)", "45 мин", "90 мин", "2+ часа"],
    },
  ],

  confirmMessage: (a) => {
    const ft = a.free_time ?? "Утром";
    const priority = a.priority ?? "1 задача";
    const sessionLen = a.session_len ?? "90 мин";

    const time = ft.includes("Утром")
      ? "07:00"
      : ft.includes("Днём")
        ? "13:00"
        : "18:00";

    // Длительность сессии
    const dur = sessionLen.includes("25")
      ? 25
      : sessionLen.includes("45")
        ? 45
        : sessionLen.includes("90")
          ? 90
          : 120;

    // Количество сессий зависит от числа задач
    const sessions = priority.includes("1")
      ? 1
      : priority.includes("2")
        ? 2
        : priority.includes("3")
          ? 3
          : 4;

    let schedule = "";
    for (let i = 0; i < sessions; i++) {
      const start = addMinutes(time, i * (dur + 15)); // 15 мин перерыв между сессиями
      const end = addMinutes(start, dur);
      schedule += `  ${start}–${end} — Задача ${i + 1}\n`;
    }

    return (
      `✅ Отлично! Составляю сбалансированный план:\n\n` +
      `⏱ Формат сессий: ${sessionLen}\n` +
      `📋 Задач в день: ${sessions}\n\n` +
      schedule +
      `🔁 21:00–21:30 — Повторение и планирование следующего дня\n\n` +
      `Применяем?`
    );
  },

  generatePlan: (answers) => {
    const ft = answers.free_time ?? "Утром";
    const priority = answers.priority ?? "1 задача";
    const sessionLen = answers.session_len ?? "90 мин";

    const mainTime = ft.includes("Утром")
      ? "07:00"
      : ft.includes("Днём")
        ? "13:00"
        : "18:00";
    const reviewTime = ft.includes("Вечером") ? "09:00" : "21:00";

    const dur = sessionLen.includes("25")
      ? 25
      : sessionLen.includes("45")
        ? 45
        : sessionLen.includes("90")
          ? 90
          : 120;

    const sessions = priority.includes("1")
      ? 1
      : priority.includes("2")
        ? 2
        : priority.includes("3")
          ? 3
          : 4;

    const schedule: ScheduleEntry[] = [];

    ALL_DAYS.forEach((day) => {
      for (let i = 0; i < sessions; i++) {
        const start = addMinutes(mainTime, i * (dur + 15));
        schedule.push({
          day,
          startTime: start,
          course: sessions === 1 ? "Основная задача" : `Задача ${i + 1}`,
          duration: dur,
        });
      }
      schedule.push({
        day,
        startTime: reviewTime,
        course: "Повторение / планирование",
        duration: 30,
      });
    });

    return schedule;
  },
};

// ─── Экспорт ────────────────────────────────────────────────
export const PLANNER_CATEGORIES: PlannerCategory[] = [
  hifzCategory,
  arabicCategory,
  ieltsCategory,
  otherCategory,
];
