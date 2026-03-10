import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useCopy } from "../../../hooks/useCopy";
import CTAButton from "../../../components/CTAButton";
import TagIcon from "../../../components/TagIcon";
import TAGS from "../../../json/tags.json";
import WEEKDAYS from "../../../json/weekdays.json";
import styles from "./PDFExport.module.css";

function tag(name: string) {
  const t = TAGS.find((t) => t.name === name);
  if (!t) {
    console.warn(`[PDFExport] Course not found in tags.json: "${name}"`);
    return {
      label: name,
      color: "#888",
      bg: "rgba(136,136,136,0.12)",
      icon: "📚",
    };
  }
  return { label: t.name, color: t.color, bg: t.bg, icon: t.icon };
}

const tabs = [
  { key: "vertical", labelKey: "pdfExport.tabPortrait", icon: "/virtical.svg" },
  {
    key: "horizontal",
    labelKey: "pdfExport.tabLandscape",
    icon: "/horizontal.svg",
  },
] as const;

type Tab = (typeof tabs)[number]["key"];

// ── Schedule data ────────────────────────────────────────────────────────────
const DAYS = WEEKDAYS.days.map((d) => d.short);
const PDF_HOURS = WEEKDAYS.hours.filter((h) => h.value >= 6 && h.value <= 22);
const START_HOUR = PDF_HOURS[0].value;
const TOTAL_HOURS = PDF_HOURS[PDF_HOURS.length - 1].value - START_HOUR; // 06:00 – 22:00
const SLOT_MIN = 30; // 30-minute slots
const TOTAL_SLOTS = (TOTAL_HOURS * 60) / SLOT_MIN; // 32 slots

const TIME_COL_PCT = 10;
const DAY_COL_PCT = (100 - TIME_COL_PCT) / DAYS.length;

const COURSES = [
  // Monday
  { day: 0, start: 9, end: 11, ...tag("Math") },
  { day: 0, start: 13, end: 14.5, ...tag("Art") },
  // Tuesday
  { day: 1, start: 8, end: 10, ...tag("Physics") },
  { day: 1, start: 12, end: 13.5, ...tag("Geography") },
  // Wednesday
  { day: 2, start: 7, end: 8.5, ...tag("Music") },
  { day: 2, start: 11, end: 13, ...tag("Literature") },
  // Thursday
  { day: 3, start: 9, end: 12, ...tag("History") },
  { day: 3, start: 14, end: 16, ...tag("Physical Education") },
  // Friday
  { day: 4, start: 9, end: 11, ...tag("Computer Science") },
  { day: 4, start: 14, end: 16, ...tag("Chemistry") },
  // Saturday
  { day: 5, start: 10, end: 12, ...tag("Biology") },
  { day: 5, start: 13.5, end: 15, ...tag("Economics") },
  // Sunday
  { day: 6, start: 11, end: 12.5, ...tag("Drama") },
  { day: 6, start: 14, end: 15.5, ...tag("English") },
];

// ── Mini schedule preview ────────────────────────────────────────────────────
function MiniSchedulePreview({
  orientation: _orientation,
}: {
  orientation: Tab;
}) {
  return (
    <div className={styles.previewPaper}>
      <div className={styles.paper}>
        <div className={styles.schedGrid}>
          {/* Day headers */}
          <div className={styles.schedHeader}>
            <div className={styles.schedCorner} />
            {DAYS.map((day, i) => (
              <div key={i} className={styles.schedDayLabel}>
                {day}
              </div>
            ))}
          </div>

          {/* Body: background grid + course blocks */}
          <div className={styles.schedBody}>
            {/* Grid rows — 30-min slots */}
            <div className={styles.schedRows}>
              {Array.from({ length: TOTAL_SLOTS }).map((_, slot) => {
                const totalMins = slot * SLOT_MIN;
                const hour = START_HOUR + Math.floor(totalMins / 60);
                const min = totalMins % 60;
                return (
                  <div key={slot} className={styles.schedRow}>
                    <div className={styles.schedTimeLabel}>
                      {String(hour).padStart(2, "0")}:
                      {String(min).padStart(2, "0")}
                    </div>
                    {DAYS.map((_, col) => (
                      <div key={col} className={styles.schedCell} />
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Course blocks */}
            {COURSES.map((course, i) => {
              const left = TIME_COL_PCT + course.day * DAY_COL_PCT;
              const top = ((course.start - START_HOUR) / TOTAL_HOURS) * 100;
              const height = ((course.end - course.start) / TOTAL_HOURS) * 100;
              return (
                <div
                  key={i}
                  className={styles.schedBlock}
                  style={{
                    left: `calc(${left}% + 1px)`,
                    top: `${top}%`,
                    width: `calc(${DAY_COL_PCT}% - 2px)`,
                    height: `${height}%`,
                    background: `repeating-linear-gradient(-45deg, transparent, transparent 4px, color-mix(in srgb, ${course.color} 10%, transparent) 4px, color-mix(in srgb, ${course.color} 10%, transparent) 7px), ${course.bg}`,
                    borderLeft: `2.5px solid ${course.color}`,
                  }}
                >
                  <span className={styles.schedBlockIcon}>
                    <TagIcon icon={course.icon} size={10} />
                  </span>
                  <span className={styles.schedBlockLabel}>{course.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function PDFExport() {
  const { user } = useAuth();
  const { get } = useCopy();
  const [active, setActive] = useState<Tab>("vertical");

  return (
    <section id="pdf-export" className={styles.section}>
      <div className={styles.header}>
        <div className={styles.first}>
          <h2 className={styles.title}>
            Распечатай
            <img src="/pdf-svg.svg" alt="" className={styles.titleIcon} />
            свой план
          </h2>
        </div>
        <h2 className={styles.title}>в формате PDF</h2>
      </div>

      <div className={styles.toggle}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.toggleBtn} ${active === tab.key ? styles.toggleBtnActive : ""}`}
            onClick={() => setActive(tab.key)}
          >
            <img src={tab.icon} alt="" className={styles.toggleIcon} />
            <span>{get(tab.labelKey)}</span>
          </button>
        ))}
      </div>

      <div className={styles.cardWrapper}>
        <div
          className={`${styles.card} ${
            active === "horizontal" ? styles.cardLandscape : styles.cardPortrait
          }`}
        >
          <MiniSchedulePreview orientation={active} />
        </div>
      </div>

      <CTAButton to={user ? "/workspace" : "/register"}>
        {get("pdfExport.button")}
      </CTAButton>
    </section>
  );
}
