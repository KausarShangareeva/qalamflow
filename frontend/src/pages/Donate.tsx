import { useState } from "react";
import styles from "./Donate.module.css";
import { useCopy } from "../hooks/useCopy";
import copy from "../json/ru.json";
import SectionHeader from "../components/SectionHeader";
import CTAButton from "../components/CTAButton";

const COFFEE_IMGS = ["/pencil_1.png", "/book.png", "/graduate-hat.png"];
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
              >
                {selected === i && (
                  <span className={styles.popularBadge}>{c.badge}</span>
                )}
                <img
                  src={COFFEE_IMGS[i]}
                  alt={c.label}
                  className={styles.coffeeImg}
                />
                <strong className={styles.coffeeLabel}>{c.label}</strong>
                <span className={styles.coffeeSub}>{c.sub}</span>
                <span className={styles.coffeeAmount}>{c.amount}</span>
              </button>
            ))}
          </div>

          <CTAButton
            onClick={() =>
              window.open("https://buymeacoffee.com/shanstudio", "_blank")
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
