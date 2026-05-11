import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useCopy } from "../../../hooks/useCopy";
import CTAButton from "../../../components/CTAButton";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  const { user } = useAuth();
  const { get } = useCopy();
  const navigate = useNavigate();

  function handleGuestMode() {
    localStorage.setItem("guestMode", "true");
    localStorage.removeItem("qalamflow_draft_schedule");
    localStorage.removeItem("qalamflow_draft_orientation");
    localStorage.removeItem("qalamflow_active_plan_id");
    navigate("/workspace");
  }

  return (
    <section id="hero" className={styles.heroSection}>
      <div className={styles.wrapper}>
        {/* Left column — text & actions */}
        <div className={styles.heroLeft}>
          <h1 className={styles.mainTitle}>{get("hero.mainTitle")}</h1>

          <h2 className={styles.animatedTitle}>{get("hero.subTitle")}</h2>

          <div className={styles.heroActions}>
            {user ? (
              <CTAButton to="/workspace">
                {get("home.cta.dashboard")}
              </CTAButton>
            ) : (
              <CTAButton onClick={handleGuestMode}>
                {get("home.cta.guestPlan")}
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
