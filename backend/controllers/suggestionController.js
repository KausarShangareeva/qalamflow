const Suggestion = require("../models/Suggestion");
const { sendTelegram, sendEmail } = require("../services/notify");

exports.createSuggestion = async (req, res) => {
  try {
    const { name, email, projectType, title, details } = req.body;

    if (!name || !email || !projectType || !title || !details) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    const suggestion = await Suggestion.create({
      userId: req.user?.id || null,
      name,
      email,
      projectType,
      title,
      details,
    });

    const tgText =
      `💡 <b>New suggestion on QalamFlow</b>\n\n` +
      `👤 <b>${name}</b> (${email})\n` +
      `📁 ${projectType} — <b>${title}</b>\n\n` +
      `${details}`;

    const emailHtml =
      `<h2>💡 New suggestion: ${title}</h2>` +
      `<p><b>From:</b> ${name} (${email})</p>` +
      `<p><b>Type:</b> ${projectType}</p>` +
      `<hr/><p>${details.replace(/\n/g, "<br/>")}</p>`;

    // Добавляем await для гарантии отправки на бесплатных хостингах
    try {
      await Promise.allSettled([
        sendTelegram(tgText),
        sendEmail(`💡 New suggestion: ${title}`, emailHtml),
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

    return res.status(201).json(suggestion);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
