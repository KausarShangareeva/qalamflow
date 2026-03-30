const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Ты — ИИ-планировщик для образовательной платформы Qalamflow. Помогаешь пользователям составить детальное недельное расписание.

Стиль: поддерживающий, дисциплинированный, мудрый. Обращайся на "ты". Отвечай кратко и по делу. Не используй markdown форматирование (звёздочки, решётки) — только обычный текст.

ДЛЯ КАЖДОЙ КАТЕГОРИИ задавай вопросы:

Хифз Корана:
- Сколько джузов/страниц ты уже знаешь?
- Темп: интенсивный (1-2 стр/день) или умеренный (полстраницы в день)?
- Во сколько обычно встаёшь и ложишься?

Арабский язык:
- Учишься самостоятельно или с учителем?
- Если с учителем — когда уроки (дни и время)?
- Сколько часов в день готов выделить?

IELTS:
- Текущий уровень (A1-C2 или примерный балл)?
- Дата экзамена (если есть)?
- Какие навыки слабее: Reading, Writing, Listening, Speaking?

Программирование:
- Что изучаешь? (Python, JavaScript, и т.д.)
- Есть ли курс или ментор?
- Сколько часов в день?

Другое:
- Что именно планируешь?
- Сколько времени в день готов выделить?

ПРАВИЛА:
1. Задавай вопросы по одному-два, не все сразу.
2. После сбора достаточно данных скажи РОВНО: "Отлично! Я готов составить твой план. Нажми кнопку ниже."
3. Не генерируй расписание в чате — только в ответ на запрос о генерации.
4. Учитывай время сна и пробуждения пользователя.`;

const SCHEDULE_PROMPT = `На основе разговора выше составь недельное расписание.

Верни ТОЛЬКО валидный JSON массив без пояснений, markdown или комментариев:

[
  {"day": "Понедельник", "startTime": "06:00", "course": "Хифз Корана", "duration": 120},
  {"day": "Вторник", "startTime": "07:00", "course": "Арабский язык", "duration": 60}
]

СТРОГИЕ ПРАВИЛА:
- day: ТОЛЬКО "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"
- startTime: формат "HH:MM", шаг 30 минут, диапазон 02:00-21:30
- course: название предмета (короткое, без лишних слов)
- duration: кратно 30 (30, 60, 90, 120, 150, 180, 210, 240)
- Не создавай пересекающиеся слоты в один день
- Делай расписание реалистичным, не перегружай`;

const READY_PHRASES = [
  "готов составить твой план",
  "Я готов составить",
  "готов составить план",
  "Нажми кнопку ниже",
];

async function chat(req, res) {
  try {
    const { messages, action } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages required" });
    }

    if (action === "generate") {
      const apiMessages = [
        ...messages,
        { role: "user", content: SCHEDULE_PROMPT },
      ];

      const response = await client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: apiMessages,
      });

      const text = response.content[0]?.text || "[]";
      const jsonMatch = text.match(/\[[\s\S]*\]/);

      if (!jsonMatch) {
        return res.status(500).json({ error: "Failed to parse schedule" });
      }

      let schedule;
      try {
        schedule = JSON.parse(jsonMatch[0]);
      } catch {
        return res.status(500).json({ error: "Invalid schedule JSON" });
      }

      return res.json({ schedule });
    }

    // Regular chat turn
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text = response.content[0]?.text || "";
    const isReady = READY_PHRASES.some((phrase) => text.includes(phrase));

    res.json({ message: text, isReady });
  } catch (err) {
    console.error("AI chat error:", err);
    res.status(500).json({ error: "AI service error" });
  }
}

module.exports = { chat };
