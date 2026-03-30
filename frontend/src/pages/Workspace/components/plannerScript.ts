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
  greeting: string;
  steps: PlannerStep[];
  generatePlan: (answers: Record<string, string>) => ScheduleEntry[];
  confirmMessage: (answers: Record<string, string>) => string;
}

// ─── Дни недели ────────────────────────────────────────────
const ALL_DAYS = [
  "Понедельник", "Вторник", "Среда",
  "Четверг", "Пятница", "Суббота", "Воскресенье",
];
const WEEKDAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"];
const WEEKEND  = ["Суббота", "Воскресенье"];

// ═══════════════════════════════════════════════════════════
// 📖 ХИФЗ (КОРАН) — Железный план
// ═══════════════════════════════════════════════════════════
const hifzCategory: PlannerCategory = {
  id: "hifz",
  label: "📖 Хифз (Коран)",
  greeting: "Мир тебе, о Хафиз Корана!",

  steps: [
    {
      key: "progress",
      question: "Сколько джузов или страниц ты уже заучил на данный момент?",
      options: ["Только начинаю", "1–5 джузов", "6–15 джузов", "16–25 джузов", "26–30 джузов"],
    },
    {
      key: "tempo",
      question: "В каком темпе ты хочешь двигаться?",
      options: [
        "Интенсивный (1–2 стр/день)",
        "Умеренный (полстраницы в день)",
      ],
    },
    {
      key: "speed",
      question: "Какова твоя текущая скорость заучивания одной страницы?",
      options: ["15–20 мин", "20–30 мин", "30–45 мин", "45+ мин"],
    },
  ],

  confirmMessage: (a) =>
    `✅ Отлично! Вот твой Железный план Хифза:\n\n` +
    (a.tempo?.includes("Интенсивный")
      ? `🌙 02:00–04:00 — Вирд (чтение 5 джузов)\n`
      : "") +
    `🌅 06:00–08:00 — Утренний Хифз (новые страницы)\n` +
    `📝 10:00–10:30 — Подготовка следующей суры\n` +
    `🔁 10:30–11:00 — Мурааджа (повторение)\n` +
    `🌙 19:00–21:00 — Ночная подготовка (аяты ×30)\n\n` +
    `Применяем план на всю неделю?`,

  generatePlan: (answers) => {
    const isIntensive = answers.tempo?.includes("Интенсивный");
    const schedule: ScheduleEntry[] = [];

    ALL_DAYS.forEach((day) => {
      if (isIntensive) {
        schedule.push({ day, startTime: "02:00", course: "Вирд (чтение 5 джузов)", duration: 120 });
      }
      schedule.push({ day, startTime: "06:00", course: "Хифз Корана",              duration: 120 });
      schedule.push({ day, startTime: "10:00", course: "Подготовка суры",           duration: 30  });
      schedule.push({ day, startTime: "10:30", course: "Мурааджа",                  duration: 30  });
      schedule.push({ day, startTime: "19:00", course: "Ночная подготовка",         duration: 120 });
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
  greeting: "Мир тебе, о Арабист!",

  steps: [
    {
      key: "mode",
      question: "Ты учишься самостоятельно или у тебя есть фиксированные уроки с учителем?",
      options: ["С учителем (Telegram / центр)", "Самостоятельно"],
    },
    {
      key: "lessons",
      question: "Перечисли дни и время своих занятий с учителем\n(например: Понедельник 18:00, Среда 18:00)",
      condition: (a) => a.mode?.includes("учителем") ?? false,
    },
    {
      key: "resources",
      question: "Ты уже знаешь по какой программе заниматься?",
      options: [
        "Нет, предложи проверенные ресурсы 📚",
        "Да, знаю программу",
      ],
      condition: (a) => a.mode?.includes("Самостоятельно") ?? false,
      tip: "📚 Рекомендуемые ресурсы:\n• @arabicwithus — Telegram-школа\n• Мединский курс (madinah.com)\n• YouTube: Arabic with Sam\n• Учебник Китаб аль-Асаси",
    },
    {
      key: "hours",
      question: "Сколько часов в день готов выделить на аудирование, чтение и письмо?",
      options: ["1 час", "2 часа", "3 часа", "4+ часа"],
    },
  ],

  confirmMessage: (a) => {
    const h = a.hours?.includes("1") ? 1 : a.hours?.includes("2") ? 2 : a.hours?.includes("3") ? 3 : 4;
    return (
      `✅ Отлично! Вот твоё расписание арабского:\n\n` +
      `🌅 07:00–${h >= 2 ? "08:00" : "07:30"} — Грамматика\n` +
      `🎧 17:00–18:00 — Аудирование\n` +
      (h >= 3 ? `✍️ 20:00–21:00 — Письмо\n` : "") +
      `\nВыходные — повторение + разговорная практика\n\nПрименяем?`
    );
  },

  generatePlan: (answers) => {
    const hours = answers.hours?.includes("1") ? 1 : answers.hours?.includes("2") ? 2 : answers.hours?.includes("3") ? 3 : 4;
    const schedule: ScheduleEntry[] = [];

    WEEKDAYS.forEach((day) => {
      schedule.push({ day, startTime: "07:00", course: "Арабский — грамматика",    duration: hours >= 2 ? 60 : 30 });
      schedule.push({ day, startTime: "17:00", course: "Арабский — аудирование",   duration: 60 });
      if (hours >= 3) {
        schedule.push({ day, startTime: "20:00", course: "Арабский — письмо",      duration: 60 });
      }
    });

    WEEKEND.forEach((day) => {
      schedule.push({ day, startTime: "09:00", course: "Арабский — повторение",   duration: 90 });
      schedule.push({ day, startTime: "15:00", course: "Арабский — разговорная практика", duration: 60 });
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
      options: ["2–4 недели", "1–2 месяца", "3–6 месяцев", "Дата не определена"],
    },
    {
      key: "weak",
      question: "Какой навык у тебя самый слабый?",
      options: ["Writing ✍️", "Speaking 🗣️", "Reading 📖", "Listening 🎧"],
    },
  ],

  confirmMessage: (a) => {
    const weak = a.weak?.split(" ")[0] ?? "Writing";
    return (
      `✅ Отлично! Вот твой план IELTS (цель: ${a.target ?? "7.0"}):\n\n` +
      `🌅 Утро — восприятие:\n` +
      `  07:00–08:00 Listening\n` +
      `  08:00–09:00 Reading\n\n` +
      `🌆 Вечер — практика:\n` +
      `  18:00–19:00 Writing\n` +
      `  19:00–20:00 Speaking\n\n` +
      `📌 Выходные — углублённая работа над ${weak}\n\nПрименяем?`
    );
  },

  generatePlan: (answers) => {
    const weak = answers.weak ?? "";
    const schedule: ScheduleEntry[] = [];

    WEEKDAYS.forEach((day) => {
      schedule.push({ day, startTime: "07:00", course: "IELTS — Listening", duration: 60 });
      schedule.push({ day, startTime: "08:00", course: "IELTS — Reading",   duration: 60 });
      schedule.push({ day, startTime: "18:00", course: "IELTS — Writing",   duration: 60 });
      schedule.push({ day, startTime: "19:00", course: "IELTS — Speaking",  duration: 60 });
    });

    const weakCourse =
      weak.includes("Writing")  ? "IELTS — Writing (углублённо)" :
      weak.includes("Speaking") ? "IELTS — Speaking (практика)"  :
      weak.includes("Reading")  ? "IELTS — Reading (тренировка)" :
                                  "IELTS — Listening (интенсив)";

    WEEKEND.forEach((day) => {
      schedule.push({ day, startTime: "10:00", course: weakCourse,                     duration: 120 });
      schedule.push({ day, startTime: "15:00", course: "IELTS — Vocabulary & Grammar", duration: 60  });
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
  greeting: "Мир тебе, о целеустремлённый!",

  steps: [
    {
      key: "tasks",
      question: "Опиши свои главные задачи на неделю (что хочешь успеть?):",
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
  ],

  confirmMessage: (a) => {
    const ft = a.free_time ?? "Утром";
    const time = ft.includes("Утром") ? "07:00" : ft.includes("Днём") ? "13:00" : "18:00";
    return (
      `✅ Отлично! Составляю сбалансированный план:\n\n` +
      `⏰ Основная работа: ${time} (90 мин каждый день)\n` +
      `🔁 Повторение и планирование следующего дня: 21:00\n\n` +
      `Задачи которые ты описал(а) будут распределены по слотам.\n\nПрименяем?`
    );
  },

  generatePlan: (answers) => {
    const ft = answers.free_time ?? "Утром";
    const mainTime   = ft.includes("Утром") ? "07:00" : ft.includes("Днём") ? "13:00" : "18:00";
    const reviewTime = ft.includes("Вечером") ? "09:00" : "21:00";
    const schedule: ScheduleEntry[] = [];

    ALL_DAYS.forEach((day) => {
      schedule.push({ day, startTime: mainTime,   course: "Основная задача",          duration: 90 });
      schedule.push({ day, startTime: reviewTime, course: "Повторение / планирование", duration: 30 });
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
