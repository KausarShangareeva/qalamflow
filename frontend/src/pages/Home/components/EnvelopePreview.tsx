import SectionHeader from "../../../components/SectionHeader";
import styles from "./EnvelopePreview.module.css";

export default function EnvelopePreview() {
  return (
    <section id="envelope" className={styles.previewSection}>
      <SectionHeader
        title="Готовый график занятий с датами"
        subtitle="План, график и срок — в одном месте"
        titleWidth="60%"
      />

      <div className={styles.envelopeWrapper}>
        <div className={styles.envelope}>
          {/* Передняя рубаза конверта */}
          <div className={styles.coverLeft} />
          <div className={styles.coverRight} />

          {/* Серые карточки внутри */}
          <div className={`${styles.card} ${styles.cardLeft}`} />
          <div className={`${styles.card} ${styles.cardRight}`} />

          {/* Центральный placeholder */}
          <div className={styles.placeholder} />

          {/* задняя крышка конверта */}
          <div className={styles.flap} />
        </div>
      </div>
    </section>
  );
}
