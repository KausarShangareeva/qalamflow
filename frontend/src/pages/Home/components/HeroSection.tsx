import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useCopy } from "../../../hooks/useCopy";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  const { user } = useAuth();
  const { get } = useCopy();

  const words = [
    { emoji: "🧠", text: "знание" },
    { emoji: "💡", text: "ясность" },
    { emoji: "✏️", text: "постоянство" },
  ];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 3000); // Change word every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.badge}>✨ Ваш Спутник в Изучении Арабского</div>

      <h2 className={styles.animatedTitle}>
        Дисциплина рождает{" "}
        <span className={styles.changingWordWrapper} key={currentWordIndex}>
          <span className={styles.emoji}>{words[currentWordIndex].emoji}</span>
          <span className={styles.changingWord}>
            {words[currentWordIndex].text}
          </span>
        </span>
      </h2>

      <h1 className={styles.mainTitle}>
        Учишь арабский язык?
        <br />
        Делай это системно
      </h1>

      <p className={styles.subtitle}>{get("home.subtitle")}</p>
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
