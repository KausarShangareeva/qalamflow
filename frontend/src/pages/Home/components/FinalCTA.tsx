import SectionHeader from "../../../components/SectionHeader";
import CTAButton from "../../../components/CTAButton";
import styles from "./FinalCTA.module.css";

export default function FinalCTA() {
  return (
    <section id="cta" className={styles.section}>
      <SectionHeader
        title="Звучит здорово? 😊"
        subtitle="Попробуй сам - это очень просто"
      />
      <div className={styles.card}>
        <div className={styles.illustration}>
          <span className={styles.placeholderText}>
            Изображение скоро появится
          </span>
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>Начните планировать</h3>
          <p className={styles.description}>
            Создайте свой план обучения с нуля за пару минут и двигайтесь к цели
            системно.
          </p>
          <CTAButton to="/register">Подробнее</CTAButton>
        </div>
      </div>
    </section>
  );
}
