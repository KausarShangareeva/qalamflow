import { useState, useEffect, useRef } from "react";
import TagIcon from "../components/TagIcon";
import CTAButton from "../components/CTAButton";
import { useAuth } from "../context/AuthContext";
import { useCopy } from "../hooks/useCopy";
import { ChevronLeft, Sparkles } from "lucide-react";
import { api } from "../api/client";
import styles from "./SuggestProject.module.css";

const TOPICS = [
  { value: "AI", label: "ИИ", emoji: "🤖" },
  { value: "Education", label: "Образование", emoji: "📚" },
  { value: "Business", label: "Бизнес", emoji: "💼" },
  { value: "Personal Site", label: "Личный сайт", emoji: "🌱" },
  { value: "Gaming", label: "Игры", emoji: "🎮" },
];

const STATS = [
  {
    value: "6+ лет в UI-дизайне",
    label: "UI/UX дизайн в Figma",
    icon: "🎨",
    colorClass: "statBlue",
  },
  {
    value: "Full-Stack разработчик",
    label: "React.js • Node.js • Современные веб-приложения",
    icon: "💻",
    colorClass: "statYellow",
  },
  {
    value: "Открыт для новых проектов",
    label: "Ищу интересные идеи для реализации",
    icon: "🚀",
    colorClass: "statGreen",
  },
];

const TIMELINES = [
  { value: "Urgent", label: "Срочно", sublabel: "1–2 недели", badge: true },
  { value: "Fast", label: "Быстро", sublabel: "2–3 недели" },
  { value: "Flexible", label: "Гибко", sublabel: "1–2 месяца" },
  { value: "No rush", label: "Не срочно", sublabel: "Без даты" },
];

const TOPIC_TAGS: Record<string, string[]> = {
  AI: [
    "AI Чатбот",
    "AI Ассистент",
    "Генератор контента",
    "AI Автоматизация",
    "AI Изображения",
    "AI SaaS",
    "AI API Интеграция",
    "AI Продуктивность",
  ],
  Education: [
    "Изучение языков",
    "Онлайн-курсы",
    "Платформа обучения",
    "Планировщик учёбы",
    "Образовательное приложение",
    "Сайт курса",
  ],
  Business: [
    "Сайт компании",
    "SaaS платформа",
    "Маркетплейс",
    "CRM / Дашборд",
    "Система бронирования",
    "Онлайн-сервис",
    "MVP стартапа",
    "Панель администратора",
  ],
  "Personal Site": [
    "Портфолио",
    "Личный блог",
    "Сайт-резюме",
    "Личный бренд",
    "Лендинг",
    "Личный дашборд",
  ],
  Gaming: [
    "Браузерная игра",
    "Мультиплеер",
    "Лендинг для игры",
    "Игровое сообщество",
    "Система лидерборда",
    "Игровой дашборд",
  ],
};

const TOTAL_STEPS = 5;

export default function SuggestProject() {
  const { user } = useAuth();
  const { get } = useCopy();
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState("");
  const [timeline, setTimeline] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [name, setName] = useState(user?.name.split(" ")[0] ?? "");
  const [contact, setContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function handleSubmit() {
    setIsSubmitting(true);
    setProgress(0);

    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) {
          clearInterval(intervalRef.current!);
          return 95;
        }
        return p + 1;
      });
    }, 30);

    const minDelay = new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      await Promise.all([
        api.post("/suggestions", {
          name,
          email: contact,
          projectType: topic,
          title: selectedTags.join(", ") || topic,
          details: `Timeline: ${timeline}\nContact: ${contact}\nTags: ${selectedTags.join(", ")}`,
        }),
        minDelay,
      ]);
    } catch {
      await minDelay;
    } finally {
      clearInterval(intervalRef.current!);
      setProgress(100);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 600);
    }
  }

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    [],
  );

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.cardCenter}>
        <div className={styles.surveyCard}>
          {/* Loading screen */}
          {isSubmitting && (
            <div className={styles.loadingScreen}>
              <div className={styles.loadingIconWrap}>
                <Sparkles size={32} strokeWidth={1.5} />
              </div>
              <h3 className={styles.loadingTitle}>
                {name ? (
                  <>
                    <span className={styles.brand}>{name}</span>
                    {get("suggestProject.loadingTitleWith")}
                  </>
                ) : (
                  get("suggestProject.loadingTitleWithout")
                )}
              </h3>

              <div className={styles.progressTrackBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={styles.progressPct}>{progress}%</span>
            </div>
          )}

          {/* Success screen */}
          {isSuccess && (
            <div className={styles.loadingScreen}>
              <div className={styles.successIconWrap}>
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className={styles.loadingTitle}>
                {get("suggestProject.successTitle")}
              </h3>
              <p className={styles.loadingSub}>
                {get("suggestProject.successSub")}
              </p>
            </div>
          )}

          {/* Survey steps */}
          {!isSubmitting && !isSuccess && (
            <>
              {/* Progress + back */}
              <div className={styles.surveyTop}>
                {step > 1 && (
                  <button
                    className={styles.backBtn}
                    onClick={() => setStep((s) => s - 1)}
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <div className={styles.progressTrack}>
                  {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                    <div
                      key={i}
                      className={`${styles.progressDot} ${i < step ? styles.progressDotActive : ""}`}
                    />
                  ))}
                </div>
              </div>

              {/* Step 1 — topic */}
              {step === 1 && (
                <div className={styles.stepBody}>
                  <h3 className={styles.stepTitle}>
                    {get("suggestProject.step1Title")}
                  </h3>
                  <p className={styles.stepSub}>
                    {get("suggestProject.step1Sub")}
                  </p>
                  <ul className={styles.optionList}>
                    {TOPICS.map((t) => (
                      <li key={t.value}>
                        <button
                          className={`${styles.optionBtn} ${topic === t.value ? styles.optionBtnActive : ""}`}
                          onClick={() => {
                            setTopic(t.value);
                            setTimeout(() => setStep(2), 180);
                          }}
                        >
                          <span className={styles.optionIcon}>
                            <TagIcon icon={t.emoji} size={20} />
                          </span>
                          <span className={styles.optionLabel}>{t.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Step 2 — You're in the right place */}
              {step === 2 && (
                <div className={styles.stepBody}>
                  <h3 className={styles.stepTitle}>
                    {get("suggestProject.step2Title")}
                  </h3>
                  <div className={styles.statList}>
                    {STATS.map((s) => (
                      <div
                        key={s.value}
                        className={`${styles.statCard} ${styles[s.colorClass]}`}
                      >
                        <span className={styles.flex}>
                          <TagIcon icon={s.icon} size={20} />
                          <strong className={styles.statValue}>
                            {s.value}
                          </strong>
                        </span>
                        <p className={styles.statLabel}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <CTAButton onClick={() => setStep(3)} fullWidth>
                    {get("suggestProject.continueBtn")}
                  </CTAButton>
                </div>
              )}

              {/* Step 3 — Timeline */}
              {step === 3 && (
                <div className={styles.stepBody}>
                  <h3 className={styles.stepTitle}>
                    {get("suggestProject.step3Title")}
                  </h3>
                  <p className={styles.stepSub}>
                    {get("suggestProject.step3Sub")}
                  </p>
                  <ul className={styles.optionList}>
                    {TIMELINES.map((t) => (
                      <li key={t.value}>
                        <button
                          className={`${styles.optionBtn} ${styles.timelineBtn} ${timeline === t.value ? styles.optionBtnActive : ""}`}
                          onClick={() => {
                            setTimeline(t.value);
                            setTimeout(() => setStep(4), 180);
                          }}
                        >
                          <span className={styles.optionLabel}>
                            {t.label}
                            <span className={styles.optionSub}>
                              {t.sublabel}
                            </span>
                          </span>
                          {t.badge && (
                            <span className={styles.urgentBadge}>
                              {get("suggestProject.urgentBadge")}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Step 4 — Tags */}
              {step === 4 && (
                <div className={styles.stepBody}>
                  <h3 className={styles.stepTitle}>
                    {get("suggestProject.step4Title")}
                  </h3>
                  <p className={styles.stepSub}>
                    {get("suggestProject.step4Sub")}
                  </p>
                  <div className={styles.tagGrid}>
                    {(TOPIC_TAGS[topic] ?? []).map((tag) => (
                      <button
                        key={tag}
                        className={`${styles.tagPill} ${selectedTags.includes(tag) ? styles.tagPillActive : ""}`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <CTAButton
                    disabled={selectedTags.length === 0}
                    onClick={() => setStep(5)}
                    fullWidth
                  >
                    {get("suggestProject.continueBtn")}
                  </CTAButton>
                </div>
              )}

              {/* Step 5 — Contact */}
              {step === 5 && (
                <div className={styles.stepBody}>
                  <h3 className={styles.stepTitle}>
                    {get("suggestProject.step5Title")}
                  </h3>
                  <p className={styles.stepSub}>
                    {get("suggestProject.step5Sub")}
                  </p>
                  <div className={styles.contactForm}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="sp-name">
                        {get("suggestProject.nameLabel")}
                      </label>
                      <input
                        id="sp-name"
                        type="text"
                        className={styles.fieldInput}
                        placeholder={get("suggestProject.namePlaceholder")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="sp-contact">
                        {get("suggestProject.contactLabel")}
                      </label>
                      <input
                        id="sp-contact"
                        type="email"
                        autoComplete="email"
                        className={styles.fieldInput}
                        placeholder={get("suggestProject.contactPlaceholder")}
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                      />
                    </div>

                    <CTAButton
                      disabled={!name.trim() || !contact.trim()}
                      onClick={handleSubmit}
                      fullWidth
                    >
                      {get("suggestProject.submitBtn")}
                    </CTAButton>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
