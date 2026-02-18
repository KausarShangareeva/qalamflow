import { useCopy } from "../../../hooks/useCopy";
import { Calendar, UserRound } from "lucide-react";
import CTAButton from "../../../components/CTAButton";
import styles from "./StepByStepGuide.module.css";

export default function StepByStepGuide() {
  const { get } = useCopy();

  return (
    <section id="how-it-works" className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>{get("home.howItWorks.title")}</h2>
        <p className={styles.subtitle}>{get("home.howItWorks.subtitle")}</p>
      </div>

      <div className={styles.grid}>
        {/* Card 1 */}
        <div className={styles.card}>
          <div className={styles.tag}>
            <UserRound size={20} color="blue" />
            <span>{get("home.howItWorks.step1.tag")}</span>
          </div>
          <h3 className={styles.cardTitle}>
            {get("home.howItWorks.step1.main")}
          </h3>
          <div className={styles.placeholder}>
            <span className={styles.placeholderText}>
              Изображение скоро появится
            </span>
          </div>
          <p className={styles.cardBottom}>
            {get("home.howItWorks.step1.bottom")}
          </p>
        </div>

        {/* Card 2 */}
        <div className={styles.card}>
          <div className={styles.tag}>
            <Calendar size={20} color="blue" />
            <span>{get("home.howItWorks.step2.tag")}</span>
          </div>
          <h3 className={styles.cardTitle}>
            {get("home.howItWorks.step2.main")}
          </h3>
          <div className={styles.placeholder}>
            <span className={styles.placeholderText}>
              Изображение скоро появится
            </span>
          </div>
          <p className={styles.cardBottom}>
            {get("home.howItWorks.step2.bottom")}
          </p>
        </div>
      </div>

      <CTAButton to="/register">{get("home.howItWorks.cta")}</CTAButton>
    </section>
  );
}
