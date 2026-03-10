import { CircleStar, Bell } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useCopy } from "../../../hooks/useCopy";
import SectionHeader from "../../../components/SectionHeader";
import CTAButton from "../../../components/CTAButton";
import styles from "./Features.module.css";

const CARD_ICONS = [Bell, CircleStar];

export default function Features() {
  const { user } = useAuth();
  const { get, getArray } = useCopy();
  const cards = getArray("home.notifications.cards");

  return (
    <section id="notifications" className={styles.section}>
      <SectionHeader
        title={get("home.notifications.title")}
        titleWidth="90%"
        subtitle={get("home.notifications.subtitle")}
      />

      <div className={styles.grid}>
        {cards.map((card, index) => {
          const Icon = CARD_ICONS[index];
          return (
            <div key={index} className={styles.card}>
              <div className={styles.tag}>
                <Icon size={20} color="currentcolor" />
                <span>{card.tag}</span>
              </div>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <div className={styles.placeholder}>
                <span className={styles.placeholderText}>Image coming soon</span>
              </div>
              <p className={styles.cardBottom}>{card.bottom}</p>
            </div>
          );
        })}
      </div>

      <CTAButton to={user ? "/workspace" : "/register"}>
        {get("home.notifications.cta")}
      </CTAButton>
    </section>
  );
}
