import { useState, useRef, useEffect } from "react";
import type { ScheduleEntry } from "../types";
import { PLANNER_CATEGORIES } from "./plannerScript";
import styles from "./AIPlannerChat.module.css";

interface ChatMessage {
  role: "bot" | "user";
  content: string;
  options?: string[];
  tip?: string;
}

interface AIPlannerChatProps {
  onClose: () => void;
  onApplyPlan: (schedule: ScheduleEntry[], greeting: string, planTitle: string) => void;
  userName: string;
}

export default function AIPlannerChat({ onClose, onApplyPlan, userName }: AIPlannerChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      content: `Привет${userName ? ", " + userName : ""}! 👋 Я помогу составить крутой план на неделю.\n\nВыбери категорию:`,
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);
  const [readyToApply, setReadyToApply] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Выбор категории ──────────────────────────────────────
  const handleSelectCategory = (catId: string) => {
    const cat = PLANNER_CATEGORIES.find((c) => c.id === catId);
    if (!cat) return;
    setSelectedCategory(catId);

    // найти первый активный шаг (без condition или condition = true)
    const firstStep = cat.steps.find((s) => !s.condition || s.condition({}));
    if (!firstStep) return;

    setMessages((prev) => [
      ...prev,
      { role: "user",  content: cat.label },
      { role: "bot",   content: firstStep.question, options: firstStep.options, tip: firstStep.tip },
    ]);
    setStepIndex(0);
  };

  // ── Обработка ответа (кнопка или текст) ─────────────────
  const handleAnswer = (answer: string) => {
    if (!selectedCategory) return;
    const cat = PLANNER_CATEGORIES.find((c) => c.id === selectedCategory)!;

    // активные шаги с учётом уже собранных ответов
    const currentStep = getActiveSteps(cat, answers)[stepIndex];
    if (!currentStep) return;

    const newAnswers = { ...answers, [currentStep.key]: answer };
    setAnswers(newAnswers);
    setInput("");

    const activeSteps = getActiveSteps(cat, newAnswers);
    const nextIndex   = stepIndex + 1;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: answer },
    ]);

    if (nextIndex < activeSteps.length) {
      // следующий вопрос
      const next = activeSteps[nextIndex];
      setStepIndex(nextIndex);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: next.question, options: next.options, tip: next.tip },
        ]);
      }, 300);
    } else {
      // все вопросы собраны — показываем превью плана
      setDone(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: cat.confirmMessage(newAnswers) },
        ]);
        setReadyToApply(true);
      }, 300);
    }
  };

  // ── Применить план ───────────────────────────────────────
  const handleApply = () => {
    const cat = PLANNER_CATEGORIES.find((c) => c.id === selectedCategory);
    if (!cat) return;
    const schedule = cat.generatePlan(answers);
    onApplyPlan(schedule, cat.greeting, cat.planTitle);
  };

  // ── Показываем только шаги, у которых condition выполняется ─
  function getActiveSteps(cat: typeof PLANNER_CATEGORIES[number], ans: Record<string, string>) {
    return cat.steps.filter((s) => !s.condition || s.condition(ans));
  }

  // ── Текущий шаг — нужен ли текстовый ввод? ──────────────
  const currentCat   = PLANNER_CATEGORIES.find((c) => c.id === selectedCategory);
  const activeSteps  = currentCat ? getActiveSteps(currentCat, answers) : [];
  const currentStep  = activeSteps[stepIndex];
  const needsTextInput = selectedCategory && !done && currentStep && !currentStep.options;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel}>

        {/* Заголовок */}
        <div className={styles.header}>
          <span className={styles.headerTitle}>🤖 ИИ-планировщик</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">✕</button>
        </div>

        {/* Сообщения */}
        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i}>
              <div className={`${styles.bubble} ${msg.role === "user" ? styles.userBubble : styles.botBubble}`}>
                {msg.content.split("\n").map((line, j, arr) => (
                  <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
                ))}
              </div>

              {/* Подсказка под вопросом */}
              {msg.tip && (
                <div className={styles.tipBox}>
                  {msg.tip.split("\n").map((line, j, arr) => (
                    <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
                  ))}
                </div>
              )}

              {/* Кнопки-варианты под последним ботовым сообщением */}
              {msg.role === "bot" && msg.options && i === messages.length - 1 && !done && (
                <div className={styles.optionList}>
                  {msg.options.map((opt) => (
                    <button key={opt} className={styles.optionBtn} onClick={() => handleAnswer(opt)}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Кнопки категорий (только в начале) */}
          {!selectedCategory && (
            <div className={styles.optionList}>
              {PLANNER_CATEGORIES.map((cat) => (
                <button key={cat.id} className={styles.optionBtn} onClick={() => handleSelectCategory(cat.id)}>
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Кнопка применить план */}
          {readyToApply && (
            <button className={styles.applyBtn} onClick={handleApply}>
              ✨ Применить план в расписание
            </button>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Текстовый ввод — только когда вопрос без вариантов */}
        {needsTextInput && (
          <div className={styles.inputRow}>
            <input
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && input.trim() && handleAnswer(input.trim())}
              placeholder="Напиши ответ..."
              autoFocus
            />
            <button
              className={styles.sendBtn}
              onClick={() => input.trim() && handleAnswer(input.trim())}
              disabled={!input.trim()}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
