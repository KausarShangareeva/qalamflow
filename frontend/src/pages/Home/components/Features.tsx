import { CircleStar, Bell } from "lucide-react";
import SectionHeader from "../../../components/SectionHeader";
import CTAButton from "../../../components/CTAButton";
import styles from "./Features.module.css";

export default function Features() {
  return (
    <section id="notifications" className={styles.section}>
      <SectionHeader
        title="Получайте уведомления и отмечайте прогресс"
        titleWidth="90%"
        subtitle="Визуализация вашего успеха в процентах"
      />

      <div className={styles.grid}>
        {/* Card 1 */}
        <div className={styles.card}>
          <div className={styles.tag}>
            <Bell size={20} color="blue" />
            <span>Напоминания</span>
          </div>
          <h3 className={styles.cardTitle}>
            Получайте уведомления о начале урока за 15 минут и мотивацию
          </h3>
          <div className={styles.placeholder}>
            <span className={styles.placeholderText}>
              Изображение скоро появится
            </span>
          </div>
          <p className={styles.cardBottom}>
            Выберите курс, укажите даты — и получите готовое расписание занятий
          </p>
        </div>

        {/* Card 2 */}
        <div className={styles.card}>
          <div className={styles.tag}>
            <CircleStar size={20} color="blue" />
            <span>Прогресс</span>
          </div>
          <h3 className={styles.cardTitle}>
            Отмечайте пройденные уроки и следите за достижениями
          </h3>
          <div className={styles.placeholder}>
            <span className={styles.placeholderText}>
              Изображение скоро появится
            </span>
          </div>
          <p className={styles.cardBottom}>
            Визуальная статистика и напоминания помогут вам не сбиться с пути
          </p>
        </div>
      </div>

      <CTAButton to="/register">Начать планировать</CTAButton>
    </section>
  );
}
