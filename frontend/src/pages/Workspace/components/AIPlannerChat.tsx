import { useState, useRef, useEffect } from "react";
import type { ScheduleEntry } from "../types";
import { api } from "../../../api/client";
import styles from "./AIPlannerChat.module.css";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIPlannerChatProps {
  onClose: () => void;
  onApplyPlan: (schedule: ScheduleEntry[], greeting: string) => void;
  userName: string;
}

const AI_TAGS = [
  { id: "hifz", label: "📖 Хифз (Коран)", greeting: "Мир тебе, о Хафиз Корана!" },
  { id: "arabic", label: "🌍 Арабский язык", greeting: "Мир тебе, о Арабист!" },
  { id: "ielts", label: "🎓 IELTS", greeting: "Мир тебе, о Мастер IELTS!" },
  { id: "programming", label: "💻 Программирование", greeting: "Мир тебе, о Разработчик!" },
  { id: "other", label: "🛠 Другое", greeting: "Мир тебе, о целеустремлённый!" },
];

export default function AIPlannerChat({ onClose, onApplyPlan, userName }: AIPlannerChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Привет${userName ? ", " + userName : ""}! 👋 Я помогу составить крутой план на неделю.\n\nДля чего хочешь спланировать неделю? Выбери одну или несколько категорий:`,
    },
  ]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagsConfirmed, setTagsConfirmed] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [primaryGreeting, setPrimaryGreeting] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const sendToAI = async (newMessages: ChatMessage[]) => {
    setLoading(true);
    try {
      const data = await api.post<{ message: string; isReady: boolean }>("/ai/chat", {
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
      });
      const assistantMsg: ChatMessage = { role: "assistant", content: data.message };
      setMessages((prev) => [...prev, assistantMsg]);
      if (data.isReady) setIsReady(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Произошла ошибка. Попробуй ещё раз." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const confirmTags = async () => {
    if (selectedTags.length === 0) return;
    const tagLabels = AI_TAGS.filter((t) => selectedTags.includes(t.id))
      .map((t) => t.label)
      .join(", ");
    const primary = AI_TAGS.find((t) => t.id === selectedTags[0]);
    if (primary) setPrimaryGreeting(primary.greeting);
    setTagsConfirmed(true);
    const userMsg: ChatMessage = { role: "user", content: `Выбранные категории: ${tagLabels}` };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    await sendToAI(newMessages);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    await sendToAI(newMessages);
  };

  const handleApplyPlan = async () => {
    setGenerating(true);
    try {
      const data = await api.post<{ schedule: ScheduleEntry[] }>("/ai/chat", {
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        action: "generate",
      });
      onApplyPlan(data.schedule, primaryGreeting);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Не удалось сгенерировать план. Попробуй ещё раз." },
      ]);
      setGenerating(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>🤖 ИИ-планировщик</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">✕</button>
        </div>

        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.bubble} ${msg.role === "user" ? styles.userBubble : styles.botBubble}`}>
              {msg.content.split("\n").map((line, j, arr) => (
                <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
              ))}
            </div>
          ))}

          {!tagsConfirmed && (
            <div className={styles.tagArea}>
              <div className={styles.tagList}>
                {AI_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    className={`${styles.tagBtn} ${selectedTags.includes(tag.id) ? styles.tagSelected : ""}`}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <button className={styles.confirmTagsBtn} onClick={confirmTags}>
                  Продолжить →
                </button>
              )}
            </div>
          )}

          {loading && (
            <div className={`${styles.bubble} ${styles.botBubble} ${styles.typing}`}>
              <span /><span /><span />
            </div>
          )}

          {isReady && !generating && (
            <button className={styles.applyBtn} onClick={handleApplyPlan}>
              ✨ Применить план в расписание
            </button>
          )}

          {generating && (
            <div className={`${styles.bubble} ${styles.botBubble}`}>
              ⏳ Генерирую твой план...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {tagsConfirmed && !isReady && (
          <div className={styles.inputRow}>
            <input
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Напиши ответ..."
              disabled={loading || generating}
            />
            <button
              className={styles.sendBtn}
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
