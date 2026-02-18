import { Trash2 } from "lucide-react";
import type { SavedPlan } from "../types";
import styles from "./PDFPlanList.module.css";

interface PDFPlanListProps {
  plans: SavedPlan[];
  activePlanId: string | null;
  onLoadPlan: (planId: string) => void;
  onCreateNew: () => void;
  onDeletePlan: (planId: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PDFPlanList({
  plans,
  activePlanId,
  onLoadPlan,
  onCreateNew,
  onDeletePlan,
}: PDFPlanListProps) {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {/* Create card */}
        <button className={styles.createCard} onClick={onCreateNew}>
          <span className={styles.createIcon}>+</span>
          <span className={styles.createText}>Создать новый план</span>
        </button>

        {/* Plan cards */}
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`${styles.card} ${plan.id === activePlanId ? styles.cardActive : ""}`}
            onClick={() => onLoadPlan(plan.id)}
          >
            <div className={styles.cardHeader}>
              <span className={styles.tag}>
                {formatDate(plan.createdAt)}
              </span>
              <button
                className={styles.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePlan(plan.id);
                }}
                aria-label="Удалить план"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <h3 className={styles.title}>{plan.title}</h3>
            <p className={styles.description}>{plan.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
