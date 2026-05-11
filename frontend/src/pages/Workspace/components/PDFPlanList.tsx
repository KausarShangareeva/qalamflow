import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useCopy } from "../../../hooks/useCopy";
import { useLocalizedWeekdays } from "../../../hooks/useLocalizedWeekdays";
import { useLocalizedTags } from "../../../hooks/useLocalizedTags";
import type { SavedPlan, ScheduleEntry } from "../types";
import TAGS from "../../../data/ru/tags.json";
import WEEKDAYS from "../../../data/ru/weekdays.json";
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
// Canonical day order (RU full names) — saved plans store these as keys.
const DAY_ORDER = WEEKDAYS.days.map((d) => d.full);

type GetFn = (path: string, values?: Record<string, string | number>) => string;

function pluralCourse(n: number, lang: string, get: GetFn): string {
  // RU has 3 plural forms; EN has 2 (and we map both to courses).
  if (lang === "en") {
    return n === 1 ? get("workspace.courseSingular") : get("workspace.courseFew");
  }
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs >= 11 && abs <= 14) return get("workspace.courseMany");
  if (last === 1) return get("workspace.courseSingular");
  if (last >= 2 && last <= 4) return get("workspace.courseFew");
  return get("workspace.courseMany");
}

function formatDate(iso: string, lang: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleDateString(lang === "en" ? "en-US" : "ru-RU", {
    month: "long",
  });
  const year = String(d.getFullYear()).slice(2);
  return lang === "en" ? `${month} ${day}, '${year}` : `${day} ${month} ${year} г.`;
}

function formatRelative(iso: string, lang: string, get: GetFn): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return get("workspace.relativeJustNow");
  if (mins < 60) return get("workspace.relativeMinutesAgo", { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return get("workspace.relativeHoursAgo", { count: hours });
  const days = Math.floor(hours / 24);
  if (days === 1) return get("workspace.relativeYesterday");
  if (days < 7) return get("workspace.relativeDaysAgo", { count: days });
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return get("workspace.relativeWeeksAgo", { count: weeks });
  return formatDate(iso, lang);
}

function formatTotalHours(schedule: SavedPlan["schedule"], get: GetFn): string {
  const total = schedule.reduce((sum, e) => sum + e.duration, 0) / 60;
  const count = total % 1 === 0 ? `${total}` : total.toFixed(1);
  return get("workspace.hoursPerWeekShort", { count });
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
  const { shortForRuFull, lang } = useLocalizedWeekdays();
  const { translateName } = useLocalizedTags();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const formatDays = (days: string[]): string => {
    if (days.length === DAY_ORDER.length) return get("common.everyDay");
    const indices = days.map((d) => DAY_ORDER.indexOf(d)).sort((a, b) => a - b);
    const ranges: number[][] = [];
    let range = [indices[0]];
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] === indices[i - 1] + 1) range.push(indices[i]);
      else {
        ranges.push(range);
        range = [indices[i]];
      }
    }
    ranges.push(range);
    return ranges
      .map((r) =>
        r.length === 1
          ? shortForRuFull[DAY_ORDER[r[0]]]
          : `${shortForRuFull[DAY_ORDER[r[0]]]} – ${shortForRuFull[DAY_ORDER[r[r.length - 1]]]}`,
      )
      .join(", ");
  };

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
                  🗓️ {formatDate(plan.createdAt, lang)}
                </span>
                <span className={styles.hoursTag}>
                  🕰️ {formatTotalHours(plan.schedule, get)}
                </span>
              </div>
              {plan.updatedAt && plan.updatedAt !== plan.createdAt && (
                <p className={styles.updatedAt}>
                  {get("workspace.updatedAt", {
                    time: formatRelative(plan.updatedAt, lang, get),
                  })}
                </p>
              )}

              <h3 className={styles.title}>
                {plan.title?.includes("weekly plan") || plan.title?.includes("Empty plan")
                  ? get("workspace.weekPlanTitle")
                  : plan.title}
              </h3>

              <ul className={styles.courseList}>
                {visible.map((row) => (
                  <li key={row.name} className={styles.courseRow}>
                    <span className={styles.courseIcon}><TagIcon icon={row.icon} size={14} /></span>
                    <span className={styles.courseName}>
                      {translateName(row.name)}
                    </span>
                    <span className={styles.courseMeta}>
                      ({formatDays(row.days)}){" · "}
                      {row.hours % 1 === 0 ? row.hours : row.hours.toFixed(1)}ч
                    </span>
                  </li>
                ))}
              </ul>

              {hidden.length > 0 && (
                <p className={styles.moreRow}>
                  {get("workspace.moreCoursesRow", {
                    count: hidden.length,
                    plural: pluralCourse(hidden.length, lang, get),
                    hours:
                      hiddenHours % 1 === 0
                        ? hiddenHours
                        : hiddenHours.toFixed(1),
                  })}
                </p>
              )}

              <div className={styles.cardFooter}>
                {confirmId === plan.id ? (
                  <div className={styles.confirmRow} onClick={(e) => e.stopPropagation()}>
                    <span className={styles.confirmText}>
                      {get("workspace.confirmDelete")}
                    </span>
                    <button
                      className={styles.confirmYes}
                      onClick={(e) => { e.stopPropagation(); onDeletePlan(plan.id); setConfirmId(null); }}
                    >
                      {get("workspace.confirmYes")}
                    </button>
                    <button
                      className={styles.confirmNo}
                      onClick={(e) => { e.stopPropagation(); setConfirmId(null); }}
                    >
                      {get("workspace.confirmNo")}
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      className={styles.openBtn}
                      onClick={(e) => { e.stopPropagation(); onLoadPlan(plan.id); }}
                    >
                      {get("workspace.openBtn")}
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => { e.stopPropagation(); setConfirmId(plan.id); }}
                      aria-label={get("workspace.deletePlanAria")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
