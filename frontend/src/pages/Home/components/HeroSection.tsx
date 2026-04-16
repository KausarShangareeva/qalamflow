import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useCopy } from "../../../hooks/useCopy";
import { ArrowUpRight } from "lucide-react";
import CTAButton from "../../../components/CTAButton";
import TagIcon from "../../../components/TagIcon";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  const { user } = useAuth();
  const { get, copy } = useCopy();
  const navigate = useNavigate();

  function handleGuestMode() {
    localStorage.setItem("guestMode", "true");
    localStorage.removeItem("qalamflow_draft_schedule");
    localStorage.removeItem("qalamflow_draft_orientation");
    localStorage.removeItem("qalamflow_active_plan_id");
    navigate("/workspace");
  }

  const phrases = copy.hero.phrases;
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <section id="hero" className={styles.heroSection}>
      <div className={styles.wrapper}>
        {/* Left column — text & actions */}
        <div className={styles.heroLeft}>
          <h1 className={styles.mainTitle}>{get("hero.mainTitle")}</h1>

          <h2 className={styles.animatedTitle}>
            Спроектируй свою учебный план за 5 минут и начни двигаться к
            результату без выгорания
          </h2>

          <div className={styles.heroActions}>
            {user ? (
              <CTAButton to="/workspace">{get("home.cta.dashboard")}</CTAButton>
            ) : (
              <CTAButton onClick={handleGuestMode}>
                Составить план как гость ✨
              </CTAButton>
            )}
          </div>
        </div>

        {/* Right column — page mockup */}
        <div className={styles.heroRight}>
          <img
            src="/QalamFlow_page.jpg"
            alt="QalamFlow preview"
            className={styles.heroMockup}
          />
        </div>
      </div>
    </section>
  );
}
