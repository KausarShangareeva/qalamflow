const https = require("node:https");
const nodemailer = require("nodemailer");

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
  }

  const payload = JSON.stringify({
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  });

  await new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.telegram.org",
        path: `/bot${token}/sendMessage`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
            return;
          }
          reject(
            new Error(
              `Telegram send failed (${res.statusCode || "no-status"}): ${body}`,
            ),
          );
        });
      },
    );

    req.setTimeout(10000, () => {
      req.destroy(new Error("Telegram request timeout"));
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function sendEmail(subject, html) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Missing GMAIL_USER or GMAIL_APP_PASSWORD");
  }

  // Используем более надежную конфигурацию для Gmail
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true для порта 465
    auth: {
      user: user,
      pass: pass,
    },
    // Добавляем таймаут, чтобы не ждать бесконечно
    connectionTimeout: 10000,
  });

  try {
    const info = await transporter.sendMail({
      from: `"QalamFlow Notifications" <${user}>`,
      to: user, // Отправляем самому себе
      subject: subject,
      html: html,
    });
    console.log("[notify] Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("[notify] Detailed Email Error:", error);
    throw error; // Пробрасываем ошибку дальше для обработки в контроллере
  }
}

module.exports = { sendTelegram, sendEmail };
