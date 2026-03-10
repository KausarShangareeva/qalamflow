const Feedback = require("../models/Feedback");
const { sendTelegram, sendEmail } = require("../services/notify");

function sanitizeName(name = "Anonymous") {
  const trimmed = String(name).trim();
  if (!trimmed) return "Anonymous";
  return trimmed;
}

exports.getFeedback = async (_req, res) => {
  try {
    const entries = await Feedback.find({})
      .sort({ createdAt: -1 })
      .limit(30)
      .select("name rating message location createdAt userId avatarUrl");

    const publicEntries = entries.map((entry) => ({
      _id: entry._id,
      userId: entry.userId ? String(entry.userId) : null,
      name: sanitizeName(entry.name),
      rating: entry.rating,
      message: entry.message,
      location: entry.location,
      avatarUrl: entry.avatarUrl || "",
      createdAt: entry.createdAt,
    }));

    return res.json(publicEntries);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const entry = await Feedback.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: "Not found" });
    return res.json({ message: "Deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateFeedback = async (req, res) => {
  try {
    const { message, rating } = req.body;
    if (!message || !rating) {
      return res
        .status(400)
        .json({ message: "Message and rating are required" });
    }
    const normalizedRating = Number(rating);
    if (
      !Number.isFinite(normalizedRating) ||
      normalizedRating < 1 ||
      normalizedRating > 5
    ) {
      return res.status(400).json({ message: "Rating must be from 1 to 5" });
    }
    const entry = await Feedback.findByIdAndUpdate(
      req.params.id,
      { message: String(message).trim(), rating: normalizedRating },
      { new: true },
    );
    if (!entry) return res.status(404).json({ message: "Not found" });
    return res.json({
      _id: entry._id,
      userId: entry.userId ? String(entry.userId) : null,
      name: sanitizeName(entry.name),
      rating: entry.rating,
      message: entry.message,
      location: entry.location,
      createdAt: entry.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createFeedback = async (req, res) => {
  try {
    const { name, email, rating, message, location, avatarUrl } = req.body;

    if (!name || !rating || !message) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    const normalizedRating = Number(rating);
    if (
      !Number.isFinite(normalizedRating) ||
      normalizedRating < 1 ||
      normalizedRating > 5
    ) {
      return res.status(400).json({ message: "Rating must be from 1 to 5" });
    }

    const entry = await Feedback.create({
      userId: req.user?.id || null,
      name,
      email,
      rating: normalizedRating,
      message,
      location,
      avatarUrl: avatarUrl || "",
    });

    const tgText =
      `📝 <b>New feedback on QalamFlow</b>\n\n` +
      `👤 <b>${name}</b> (${email})\n` +
      `⭐ Rating: <b>${normalizedRating}/5</b>\n\n` +
      `${message}`;

    const emailHtml =
      `<h2>📝 New feedback</h2>` +
      `<p><b>From:</b> ${name} (${email})</p>` +
      `<p><b>Rating:</b> ${normalizedRating}/5</p>` +
      (location ? `<p><b>Location:</b> ${location}</p>` : "") +
      `<hr/><p>${String(message).replace(/\n/g, "<br/>")}</p>`;

    // Используем await, чтобы сервер дождался отправки уведомлений перед ответом клиенту
    // Это критично для бесплатных хостингов (Render/Netlify), которые "засыпают" после ответа
    try {
      await Promise.allSettled([
        sendTelegram(tgText),
        sendEmail("📝 New feedback", emailHtml),
      ]).then((results) => {
        if (results[0].status === "rejected") {
          console.error(
            "[notify] Telegram error:",
            results[0].reason?.message || results[0].reason,
          );
        }
        if (results[1].status === "rejected") {
          console.error(
            "[notify] Email error:",
            results[1].reason?.message || results[1].reason,
          );
        }
      });
    } catch (notifyErr) {
      console.error("[notify] Notification process error:", notifyErr);
    }

    return res.status(201).json({
      _id: entry._id,
      userId: entry.userId ? String(entry.userId) : null,
      name: sanitizeName(entry.name),
      rating: entry.rating,
      message: entry.message,
      location: entry.location,
      avatarUrl: entry.avatarUrl || "",
      createdAt: entry.createdAt,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
