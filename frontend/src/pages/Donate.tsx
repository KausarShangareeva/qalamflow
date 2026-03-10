import { useState } from "react";
import styles from "./Donate.module.css";
import SectionHeader from "../components/SectionHeader";
import CTAButton from "../components/CTAButton";
import TagIcon from "../components/TagIcon";

const COFFEES = [
  {
    img: "/tea.png",
    label: "Limon tea",
    sub: "Tiny boost",
    amount: "$3",
    badge: "Nice pick 🍋",
  },
  {
    img: "/cappuccino.png",
    label: "Cappuccino",
    sub: "Extra energy ⚡",
    amount: "$6",
    badge: "Most loved ✨",
  },
  {
    img: "/Frappuccino.png",
    label: "Frappuccino",
    sub: "Author's favourite",
    amount: "$9",
    badge: "Top choice 🔥",
  },
];

export default function Donate() {
  const [selected, setSelected] = useState<string>("Cappuccino");

  return (
    <section className={styles.page}>
      <SectionHeader title="Oh hey, coffee friend 😺" titleWidth="60%" />

      <div className={styles.card}>
        <p>If QalamFlow helped you, a coffee keeps the code flowing</p>
        <div className={styles.cardCenter}>
          <div className={styles.coffeeGrid}>
            {COFFEES.map((c) => (
              <button
                key={c.label}
                onClick={() => setSelected(c.label)}
                className={`${styles.coffeeCard} ${selected === c.label ? styles.coffeeCardSelected : ""}`}
              >
                {selected === c.label && (
                  <span className={styles.popularBadge}>{c.badge}</span>
                )}
                <img src={c.img} alt={c.label} className={styles.coffeeImg} />
                <strong className={styles.coffeeLabel}>{c.label}</strong>
                <span className={styles.coffeeSub}>{c.sub}</span>
                <span className={styles.coffeeAmount}>{c.amount}</span>
              </button>
            ))}
          </div>

          <CTAButton
            onClick={() =>
              window.open(
                "https://buymeacoffee.com/shanstudio",
                "bmc",
                "width=600,height=700,left=300,top=100",
              )
            }
          >
            ☕ Buy me a coffee
          </CTAButton>

          <p className={styles.footnote}>Safe & quick — 30 seconds.</p>
        </div>
      </div>
    </section>
  );
}
