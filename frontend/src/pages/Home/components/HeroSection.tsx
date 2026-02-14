import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useCopy } from "../../../hooks/useCopy";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  const { user } = useAuth();
  const { get } = useCopy();

  const words = ["знание", "ясность", "постоянство"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 3000); // Change word every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.mainTitle}>
        Учишь арабский?<br />
        Делай это системно.
      </h1>
      <h2 className={styles.animatedTitle}>
        Дисциплина рождает{" "}
        <span className={styles.changingWord} key={currentWordIndex}>
          {words[currentWordIndex]}
        </span>
      </h2>
      <p className={styles.subtitle}>
        {get("home.subtitle")}
      </p>
      {user ? (
        <Link to="/dashboard" className={styles.cta}>{get("home.cta.dashboard")}</Link>
      ) : (
        <Link to="/register" className={styles.cta}>{get("home.cta.register")}</Link>
      )}
    </div>
  );
}
