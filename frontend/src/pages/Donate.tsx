import { useState } from "react";
import styles from "./Donate.module.css";
import { useCopy } from "../hooks/useCopy";
import copy from "../json/ru.json";
import SectionHeader from "../components/SectionHeader";
import CTAButton from "../components/CTAButton";

const TIER_EMOJIS = ["🪙", "📗", "🏆"]; // бронза, изумруд, золото
const TIER_COLORS = ["#b87333", "#10b981", "#d4a853"]; // бронза, изумруд, золото
const coffees = copy.donate.coffees;

export default function Donate() {
  const { get } = useCopy();
  const [selected, setSelected] = useState<number>(1);

  return (
    <section className={styles.page}>
      <SectionHeader title={get("donate.title")} titleWidth="100%" />

      <div className={styles.card}>
        <p>
          {get("donate.mainTextBefore")}
          <strong className={styles.highlight}>{get("donate.mainTextHighlight")}</strong>
          {get("donate.mainTextAfter")}
        </p>
        <div className={styles.cardCenter}>
          <div className={styles.coffeeGrid}>
            {coffees.map((c, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`${styles.coffeeCard} ${selected === i ? styles.coffeeCardSelected : ""}`}
                style={{ "--tier-color": TIER_COLORS[i] } as React.CSSProperties}
              >
                {selected === i && (
                  <span className={styles.popularBadge}>{c.badge}</span>
                )}
                <span className={styles.coffeeImg}>{TIER_EMOJIS[i]}</span>
                <strong className={styles.coffeeLabel}>{c.label}</strong>
                <span className={styles.coffeeSub}>{c.sub}</span>
                <span className={styles.coffeeAmount}>{c.amount}</span>
              </button>
            ))}
          </div>

          <CTAButton
            onClick={() =>
              window.open("https://yookassa.ru/my/i/Z_KABQB0ZcuM/l", "_blank")
            }
          >
            {get("donate.button")}
          </CTAButton>

          <p className={styles.footnote}>{get("donate.footnote")}</p>
        </div>
      </div>
    </section>
  );
}
