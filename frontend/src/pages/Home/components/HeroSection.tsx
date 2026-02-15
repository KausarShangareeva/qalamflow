import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useCopy } from "../../../hooks/useCopy";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  const { user } = useAuth();
  const { get } = useCopy();

  const phrases = [
    { emoji: "🎯", text: "довести курс до конца." },
    { emoji: "✍️", text: "составить план обучения" },
    { emoji: "📄", text: "скачать расписание в PDF" },
    { emoji: "🔔", text: "помнить о занятиях" },
  ];
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3500); // Change phrase every 3.5 seconds

    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.badge}>✨ Ваш Спутник в Изучении Арабского</div>

      <h1 className={styles.mainTitle}>
        Учишь арабский язык?
        <br />
        Делай это системно
      </h1>

      <h2 className={styles.animatedTitle}>
        Мы поможем вам{" "}
        <span className={styles.changingPhraseWrapper} key={currentPhraseIndex}>
          <span className={styles.phraseEmoji}>
            {phrases[currentPhraseIndex].emoji}
          </span>
          <span className={styles.changingPhrase}>
            {phrases[currentPhraseIndex].text}
          </span>
        </span>
      </h2>

      {/* <p className={styles.subtitle}>{get("home.subtitle")}</p> */}
      {user ? (
        <Link to="/dashboard" className={styles.cta}>
          {get("home.cta.dashboard")}
        </Link>
      ) : (
        <Link to="/register" className={styles.cta}>
          {get("home.cta.register")} ✨
        </Link>
      )}
    </div>
  );
}
