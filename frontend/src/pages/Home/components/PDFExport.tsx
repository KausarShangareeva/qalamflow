import { useState } from "react";
import CTAButton from "../../../components/CTAButton";
import styles from "./PDFExport.module.css";

const tabs = [
  { key: "vertical", label: "Вертикальный", icon: "/virtical.svg" },
  { key: "horizontal", label: "Горизонтальный", icon: "/horizontal.svg" },
] as const;

type Tab = (typeof tabs)[number]["key"];

export default function PDFExport() {
  const [active, setActive] = useState<Tab>("vertical");

  return (
    <section id="pdf-export" className={styles.section}>
      <div className={styles.header}>
        <div className={styles.first}>
          <h2 className={styles.title}>Распечатайте </h2>
          <img src="/pdf-svg.svg" alt="" className={styles.titleIcon} />
        </div>
        <h2 className={styles.title}>ваш план в PDF формате</h2>
      </div>

      <div className={styles.toggle}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.toggleBtn} ${active === tab.key ? styles.toggleBtnActive : ""}`}
            onClick={() => setActive(tab.key)}
          >
            <img src={tab.icon} alt="" className={styles.toggleIcon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.cardWrapper}>
        <div className={styles.card}>
          <span className={styles.placeholderText}>
            {active === "vertical"
              ? "Изображение 1 скоро появится"
              : "Изображение 2 скоро появится"}
          </span>
        </div>
      </div>

      <CTAButton to="/register">Попробовать бесплатно</CTAButton>
    </section>
  );
}
