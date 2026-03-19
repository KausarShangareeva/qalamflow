import React, { useState, useEffect } from "react";
import { useCopy } from "../../../hooks/useCopy";
import { useAuth } from "../../../context/AuthContext";
import { Calendar, GraduationCap, Search, X } from "lucide-react";
import CTAButton from "../../../components/CTAButton";
import TagIcon from "../../../components/TagIcon";
import SectionHeader from "../../../components/SectionHeader";
import WEEKDAYS from "../../../json/weekdays.json";
import { t } from "../../../utils/demoTags";
import styles from "./StepByStepGuide.module.css";

const ET_DAYS = WEEKDAYS.days.map((d) => d.short);
const ET_TIMES = WEEKDAYS.hours
  .filter((h) => h.value >= 8 && h.value <= 16)
  .map((h) => h.full.split(":")[0]);

// Курсы для попапа — берём из tags.json по имени
const POPUP_NAMES = [
  "Арабский",
  "Чтение Корана",
  "Мединский курс (МК)",
  "Бейна Ядейк (БЯ)",
  "Морфология (сарф)",
];
const DEMO_COURSES = POPUP_NAMES.flatMap((name) => {
  const tag = t(name);
  if (!tag) return [];
  return [{ label: tag.label, emoji: tag.icon, color: tag.color, bg: tag.bg }];
});

const DEMO_DURATIONS = ["30 мин", "1 час", "2 часа"];

// Row height = 2.8rem, rows: 0=08, 1=09, 2=10, 3=11, 4=12, 5=13, 6=14, 7=15, 8=16
function getTag(name: string) {
  const tag = t(name);
  if (!tag) return { label: name, emoji: "📚", color: "#888", bg: "rgba(136,136,136,0.12)" };
  return { label: tag.label, emoji: tag.icon, color: tag.color, bg: tag.bg };
}

const TABLE_COURSES = [
  { day: 0, startRow: 1, endRow: 3, ...getTag("Таджвид") },
  { day: 1, startRow: 0, endRow: 2, ...getTag("Тафсир") },
  { day: 3, startRow: 1, endRow: 4, ...getTag("Акыда") },
  { day: 5, startRow: 2, endRow: 4, ...getTag("Сира") },
  { day: 4, startRow: 6, endRow: 8, ...getTag("Фикх") },
];

const CYCLE_MS = 5000;
const SHOW_AT = 2000;
const POPUP_DURATION = 3000;

function EmptyTable() {
  return (
    <div className={styles.emptyTable}>
      <div className={styles.etCorner} />
      {ET_DAYS.map((day, i) => (
        <div key={`d${i}`} className={styles.etDayLabel}>
          {day}
        </div>
      ))}
      {ET_TIMES.map((time, row) => (
        <React.Fragment key={`row-${row}`}>
          <div className={styles.etTimeLabel}>{time}</div>
          {ET_DAYS.map((_, col) => (
            <div key={`${col}-${row}`} className={styles.etCell} />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

function FilledTable() {
  return (
    <div className={styles.filledTableWrap}>
      <div className={styles.emptyTable} style={{ margin: 0 }}>
        <div className={styles.etCorner} />
        {ET_DAYS.map((day, i) => (
          <div key={`d${i}`} className={styles.etDayLabel}>
            {day}
          </div>
        ))}
        {ET_TIMES.map((time, row) => (
          <>
            <div key={`t${row}`} className={styles.etTimeLabel}>
              {time}
            </div>
            {ET_DAYS.map((_, col) => (
              <div key={`${col}-${row}`} className={styles.etCell} />
            ))}
          </>
        ))}
      </div>

      {TABLE_COURSES.map((c, i) => (
        <div
          key={i}
          className={styles.tableBlock}
          style={{
            left: `calc(1px + 2.8rem + ${c.day} * (100% - 2px - 2.8rem) / 7)`,
            top: `calc(6rem + ${c.startRow} * 2.8rem)`,
            height: `calc(${c.endRow - c.startRow} * 2.9rem - 1px)`,
            width: `calc((100% - 2px - 2.8rem) / 7 - 1px)`,
            background: c.bg,
            borderLeft: `2.5px solid ${c.color}`,
          }}
        >
          <span className={styles.tableBlockEmoji}>
            <TagIcon icon={c.emoji} size={12} />
          </span>
          <span className={styles.tableBlockLabel}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

function DemoPopup({
  visible,
  get,
}: {
  visible: boolean;
  get: (path: string) => string;
}) {
  return (
    <div
      className={`${styles.demoPopup} ${visible ? styles.demoPopupVisible : ""}`}
    >
      <div className={styles.demoPopupHeader}>
        <span className={styles.demoPopupTitle}>
          {get("home.howItWorks.popup.title")}
        </span>
        <span className={styles.demoPopupClose}>
          <X size={16} />
        </span>
      </div>

      <p className={styles.demoPopupLabel}>
        {get("home.howItWorks.popup.selectCourse")}
      </p>

      <div className={styles.demoSearchBar}>
        <Search size={14} className={styles.demoSearchIcon} />
        <span className={styles.demoSearchPlaceholder}>
          {get("home.howItWorks.popup.searchPlaceholder")}
        </span>
      </div>

      <div className={styles.demoChips}>
        {DEMO_COURSES.map((c) => (
          <span
            key={c.label}
            className={styles.demoChip}
            style={{
              background: c.bg,
              color: c.color,
              border: `1px solid ${c.color}`,
            }}
          >
            <span className={styles.demoChipIcon}>
              <TagIcon icon={c.emoji} size={14} />
            </span>
            {c.label}
          </span>
        ))}
      </div>

      <p className={styles.demoPopupLabel}>
        {get("home.howItWorks.popup.duration")}
      </p>

      <div className={styles.demoDurations}>
        {DEMO_DURATIONS.map((d) => (
          <span key={d} className={styles.demoDuration}>
            {d}
          </span>
        ))}
      </div>

      <div className={styles.demoAddBtn}>
        {get("home.howItWorks.popup.addButton")}
      </div>
    </div>
  );
}

export default function StepByStepGuide() {
  const { get } = useCopy();
  const { user } = useAuth();
  const [popupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;

    const cycle = () => {
      showTimer = setTimeout(() => {
        setPopupVisible(true);
        hideTimer = setTimeout(() => setPopupVisible(false), POPUP_DURATION);
      }, SHOW_AT);
    };

    cycle();
    const interval = setInterval(cycle, CYCLE_MS);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <section id="how-it-works" className={styles.section}>
      <SectionHeader
        title={get("home.howItWorks.title")}
        subtitle={get("home.howItWorks.subtitle")}
        titleWidth="90%"
      />

      <div className={styles.grid}>
        {/* Card 1 */}
        <div className={styles.card}>
          <div className={styles.tag}>
            <GraduationCap size={20} color="var(--color-primary)" />
            <span>{get("home.howItWorks.step1.tag")}</span>
          </div>
          <h3 className={styles.cardTitle}>
            {get("home.howItWorks.step1.main")} <TagIcon icon="🤓" size={22} />
          </h3>
          <div className={styles.placeholder}>
            <EmptyTable />

            {/* Animated cursor */}
            <div className={styles.guideCursor}>
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                <path
                  d="M1 1l5.5 16 3-5.5 5.5-3L1 1z"
                  fill="#0d9488"
                  stroke="#fff"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
              <span className={styles.guideCursorLabel}>Aisha</span>
            </div>

            <DemoPopup visible={popupVisible} get={get} />
          </div>
          <p className={styles.cardBottom}>
            {get("home.howItWorks.step1.bottom")}
          </p>
        </div>

        {/* Card 2 */}
        <div className={styles.card}>
          <div className={styles.tag}>
            <Calendar size={20} color="var(--color-primary)" />
            <span>{get("home.howItWorks.step2.tag")}</span>
          </div>
          <h3 className={styles.cardTitle}>
            {get("home.howItWorks.step2.main")} <TagIcon icon="✨" size={22} />
          </h3>
          <div className={styles.placeholder}>
            <FilledTable />
          </div>
          <p className={styles.cardBottom}>
            {get("home.howItWorks.step2.bottom")}
          </p>
        </div>
      </div>

      <CTAButton to={user ? "/workspace" : "/register"}>
        {get("home.howItWorks.cta")}
      </CTAButton>
    </section>
  );
}
