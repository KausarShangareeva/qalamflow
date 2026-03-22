import { Trash2 } from "lucide-react";
import { useCopy } from "../../../hooks/useCopy";
import type { SavedPlan, ScheduleEntry } from "../types";
import TAGS from "../../../json/tags.json";
import WEEKDAYS from "../../../json/weekdays.json";
import TagIcon from "../../../components/TagIcon";
import styles from "./PDFPlanList.module.css";

interface PDFPlanListProps {
  plans: SavedPlan[];
  activePlanId: string | null;
  onLoadPlan: (planId: string) => void;
  onCreateNew: () => void;
  onDeletePlan: (planId: string) => void;
}

const TAG_MAP = Object.fromEntries(TAGS.map((t) => [t.name, t]));
const DAY_ORDER = WEEKDAYS.days.map((d) => d.full);
const DAY_SHORT: Record<string, string> = Object.fromEntries(
  WEEKDAYS.days.map((d) => [d.full, d.short]),
);

function formatDays(days: string[]): string {
  if (days.length === DAY_ORDER.length) return "Каждый день";

  // Get sorted indices in the week
  const indices = days.map((d) => DAY_ORDER.indexOf(d)).sort((a, b) => a - b);

  // Find contiguous ranges
  const ranges: number[][] = [];
  let range = [indices[0]];
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] === indices[i - 1] + 1) {
      range.push(indices[i]);
    } else {
      ranges.push(range);
      range = [indices[i]];
    }
  }
  ranges.push(range);

  return ranges
    .map((r) => {
      if (r.length === 1) return DAY_SHORT[DAY_ORDER[r[0]]];
      return `${DAY_SHORT[DAY_ORDER[r[0]]]} – ${DAY_SHORT[DAY_ORDER[r[r.length - 1]]]}`;
    })
    .join(", ");
}

function pluralKurs(n: number): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs >= 11 && abs <= 14) return "курсов";
  if (last === 1) return "курс";
  if (last >= 2 && last <= 4) return "курса";
  return "курсов";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleDateString("ru-RU", { month: "long" });
  const year = String(d.getFullYear()).slice(2);
  return `${day} ${month} ${year} г.`;
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин. назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "вчера";
  if (days < 7) return `${days} дн. назад`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} нед. назад`;
  return formatDate(iso);
}

function formatTotalHours(schedule: SavedPlan["schedule"]): string {
  const total = schedule.reduce((sum, e) => sum + e.duration, 0) / 60;
  return total % 1 === 0 ? `${total} ч/нед` : `${total.toFixed(1)} ч/нед`;
}

interface CourseRow {
  name: string;
  icon: string;
  days: string[];
  hours: number;
}

function buildCourseRows(schedule: ScheduleEntry[]): CourseRow[] {
  const map = new Map<string, { days: Set<string>; minutes: number }>();
  for (const e of schedule) {
    if (!map.has(e.course)) map.set(e.course, { days: new Set(), minutes: 0 });
    const row = map.get(e.course)!;
    row.days.add(e.day);
    row.minutes += e.duration;
  }
  const dayOrder = WEEKDAYS.days.map((d) => d.full);
  return Array.from(map.entries()).map(([name, { days, minutes }]) => ({
    name,
    icon: TAG_MAP[name]?.icon ?? "📌",
    days: [...days].sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)),
    hours: minutes / 60,
  }));
}

export default function PDFPlanList({
  plans,
  activePlanId,
  onLoadPlan,
  onCreateNew,
  onDeletePlan,
}: PDFPlanListProps) {
  const { get } = useCopy();
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {/* Create card */}
        <button className={styles.createCard} onClick={onCreateNew}>
          <span className={styles.createIcon}>+</span>
          <span className={styles.createText}>
            {get("workspace.createNewPlan")}
          </span>
        </button>

        {/* Plan cards */}
        {plans.map((plan) => {
          const rows = buildCourseRows(plan.schedule);
          const visible = rows.slice(0, 6);
          const hidden = rows.slice(6);
          const hiddenHours = hidden.reduce((s, r) => s + r.hours, 0);
          return (
            <article
              key={plan.id}
              className={`${styles.card} ${plan.id === activePlanId ? styles.cardActive : ""}`}
              onClick={() => onLoadPlan(plan.id)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.tag}>
                  🗓️ {formatDate(plan.createdAt)}
                </span>
                <span className={styles.hoursTag}>
                  🕰️ {formatTotalHours(plan.schedule)}
                </span>
              </div>
              {plan.updatedAt && plan.updatedAt !== plan.createdAt && (
                <p className={styles.updatedAt}>
                  ✏️ изменён {formatRelative(plan.updatedAt)}
                </p>
              )}

              <h3 className={styles.title}>План недели</h3>

              <ul className={styles.courseList}>
                {visible.map((row) => (
                  <li key={row.name} className={styles.courseRow}>
                    <span className={styles.courseIcon}><TagIcon icon={row.icon} size={14} /></span>
                    <span className={styles.courseName}>{row.name}</span>
                    <span className={styles.courseMeta}>
                      ({formatDays(row.days)}){" · "}
                      {row.hours % 1 === 0 ? row.hours : row.hours.toFixed(1)}ч
                    </span>
                  </li>
                ))}
              </ul>

              {hidden.length > 0 && (
                <p className={styles.moreRow}>
                  + ещё {hidden.length} {pluralKurs(hidden.length)} ·{" "}
                  {hiddenHours % 1 === 0 ? hiddenHours : hiddenHours.toFixed(1)}
                  ч
                </p>
              )}

              <div className={styles.cardFooter}>
                <button
                  className={styles.openBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLoadPlan(plan.id);
                  }}
                >
                  Открыть
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePlan(plan.id);
                  }}
                  aria-label="Delete plan"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
