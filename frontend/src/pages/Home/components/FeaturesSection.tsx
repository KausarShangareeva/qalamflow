import React from "react";
import { useCopy } from "../../../hooks/useCopy";
import { useAuth } from "../../../context/AuthContext";
import SectionHeader from "../../../components/SectionHeader";
import CTAButton from "../../../components/CTAButton";
import {
  GraduationCap,
  Calendar,
  StickyNote,
  Bookmark,
  Download,
  Save,
  ArrowLeftRight,
  FileText,
  Trash2,
  Printer,
} from "lucide-react";

import ALL_TAGS from "../../../data/ru/tags.json";
import { useLocalizedWeekdays } from "../../../hooks/useLocalizedWeekdays";
import TagIcon from "../../../components/TagIcon";
import { t as demoTag } from "../../../utils/demoTags";
import styles from "./FeaturesSection.module.css";

function highlighted(name: string, rows: number) {
  const tag = demoTag(name);
  return tag
    ? { name: tag.label, color: tag.color, bg: tag.bg, icon: tag.icon, rows }
    : { name, color: "#888", bg: "rgba(136,136,136,0.12)", icon: "📚", rows };
}

const HIGHLIGHTED_ALL_TAGS = [
  highlighted("Чтение Корана", 3),
  highlighted("Арабский для Корана", 5),
  highlighted("Фикх", 4),
];

function HighlightedCourses() {
  return (
    <div className={styles.courseBricks}>
      {HIGHLIGHTED_ALL_TAGS.map((course) => (
        <div key={course.name} className={styles.courseColumn}>
          {Array.from({ length: course.rows }).map((_, i) => (
            <div
              key={i}
              className={styles.courseBrick}
              style={{
                background: `repeating-linear-gradient(-45deg, transparent, transparent 4px, color-mix(in srgb, ${course.color} 10%, transparent) 4px, color-mix(in srgb, ${course.color} 10%, transparent) 7px), ${course.bg}`,
                borderLeft: `3px solid ${course.color}`,
              }}
            >
              {i === 0 && (
                <>
                  <span className={styles.courseBrickIcon}>{course.icon}</span>
                  <span className={styles.courseBrickName}>{course.name}</span>
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const MINI_SCHEDULE: Record<string, string> = {
  "0-1": "#6366f1",
  "0-2": "#6366f1", // Mon: Math
  "1-0": "#f59e0b",
  "1-1": "#f59e0b", // Tue: Physics
  "2-3": "#22c55e",
  "2-4": "#22c55e", // Wed: Literature
  "3-1": "#ec4899",
  "3-2": "#ec4899",
  "3-3": "#ec4899", // Thu: History
  "4-6": "#a855f7",
  "4-7": "#a855f7", // Fri: Chemistry
  "5-2": "#0ea5e9",
  "5-3": "#0ea5e9", // Sat: Biology
  "6-5": "#f97316",
  "6-6": "#f97316", // Sun: English
};

function MiniSchedule() {
  const { weekdays } = useLocalizedWeekdays();
  const miniDays = weekdays.days.map((d) => d.short);
  const miniHours = weekdays.hours.filter((h) => h.value >= 8 && h.value <= 16);
  return (
    <div className={styles.miniSchedule}>
      {/* Corner */}
      <div className={styles.miniCorner} />
      {/* Day headers */}
      {miniDays.map((day, i) => (
        <div key={`d${i}`} className={styles.miniDayLabel}>
          {day}
        </div>
      ))}
      {/* Rows */}
      {miniHours.map((hour, row) => (
        <React.Fragment key={row}>
          <div className={styles.miniTimeLabel}>{hour.full.split(":")[0]}</div>
          {miniDays.map((_, col) => {
            const color = MINI_SCHEDULE[`${col}-${row}`];
            return (
              <div
                key={`${col}-${row}`}
                className={styles.miniCell}
                style={
                  color
                    ? {
                        background: `repeating-linear-gradient(-45deg, transparent, transparent 3px, color-mix(in srgb, ${color} 15%, transparent) 3px, color-mix(in srgb, ${color} 15%, transparent) 5px), color-mix(in srgb, ${color} 18%, transparent)`,
                        borderLeft: `2px solid ${color}`,
                      }
                    : undefined
                }
              />
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

function PDFFormat() {
  return (
    <div className={styles.pdfWrap}>
      {/* Landscape */}
      <div className={`${styles.pdfPage} ${styles.pdfLandscape}`}>
        <div className={styles.pdfImgPlaceholder}>
          <FileText size={20} strokeWidth={1.5} />
        </div>
        <div className={styles.pdfLines}>
          <div className={styles.pdfLine} style={{ width: "80%" }} />
          <div className={styles.pdfLine} style={{ width: "60%" }} />
        </div>
        <div className={styles.pdfBtn} />
      </div>

      {/* Swap icon */}
      <div className={styles.pdfSwap}>
        <ArrowLeftRight size={18} strokeWidth={2} />
      </div>

      {/* Portrait */}
      <div className={`${styles.pdfPage} ${styles.pdfPortrait}`}>
        <div className={styles.pdfImgPlaceholder}>
          <FileText size={20} strokeWidth={1.5} />
        </div>
        <div className={styles.pdfLines}>
          <div className={styles.pdfLine} style={{ width: "75%" }} />
          <div className={styles.pdfLine} style={{ width: "50%" }} />
        </div>
        <div className={styles.pdfBtn} />
      </div>
    </div>
  );
}

function DownloadPDF({ get }: { get: (path: string) => string }) {
  return (
    <div className={styles.dlWrap}>
      <div className={styles.dlBox}>
        {/* PDF file icon */}
        <div className={styles.dlFile}>
          <div className={styles.dlFileCorner} />
          <div className={styles.dlFileBadge}>PDF</div>
        </div>

        {/* Spinner (loading phase) */}
        <svg className={styles.dlSpinner} viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="18" fill="none" strokeWidth="3" />
        </svg>

        {/* Checkmark (done phase) */}
        <div className={styles.dlCheck}>
          <svg width="22" height="22" viewBox="0 0 22 22">
            <circle cx="11" cy="11" r="10" fill="#22c55e" />
            <polyline
              points="6,11 9.5,14.5 16,8"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className={styles.dlBtnWrap}>
        <button className={styles.dlBtn}>
          <Printer size={15} strokeWidth={2.5} />
          {get("pdfExport.printPDF")}
        </button>

        {/* Cursor with username */}
        <div className={styles.dlCursor}>
          <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
            <path
              d="M1 1l5.5 16 3-5.5 5.5-3L1 1z"
              fill="#5b21b6"
              stroke="#fff"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
          <span className={styles.dlCursorLabel}>Мустафа</span>
        </div>
      </div>
    </div>
  );
}

function SavedPlans({ get }: { get: (path: string) => string }) {
  return (
    <div className={styles.savedStack}>
      {/* Back cards for stack effect */}
      <div className={`${styles.savedCard} ${styles.savedCardBack2}`} />
      <div className={`${styles.savedCard} ${styles.savedCardBack1}`} />

      {/* Front card */}
      <div className={`${styles.savedCard} ${styles.savedCardFront}`}>
        <div className={styles.savedCardTop}>
          <div className={styles.savedCardIcon}>
            <FileText size={20} strokeWidth={2} />
          </div>
          <button className={styles.savedCardTrash} aria-label="Delete">
            <Trash2 size={18} strokeWidth={1.8} />
          </button>
        </div>
        <div className={styles.savedCardTitle}>
          {get("features.savedPlans.weekOf")}
        </div>
        <div className={styles.savedCardDesc}>
          {get("features.savedPlans.sessions")} <br />
          {get("features.savedPlans.days")} <br />
          {get("features.savedPlans.hours")}
        </div>
        <button className={styles.savedCardOpen}>
          {get("features.savedPlans.open")}
        </button>
      </div>
    </div>
  );
}

// ── Animated Tags Marquee ─────────────────────────────────────────────────────
const chunk = Math.ceil(ALL_TAGS.length / 3);
const TAG_ROWS = [
  ALL_TAGS.slice(0, chunk),
  ALL_TAGS.slice(chunk, chunk * 2),
  ALL_TAGS.slice(chunk * 2),
];

function AnimatedTags() {
  return (
    <div className={styles.tagsWrap}>
      {TAG_ROWS.map((row, rowIdx) => {
        const doubled = [...row, ...row];
        const trackClass =
          rowIdx === 1
            ? `${styles.tagsTrack} ${styles.tagsTrackRight}`
            : rowIdx === 2
              ? `${styles.tagsTrack} ${styles.tagsTrackSlow}`
              : styles.tagsTrack;
        return (
          <div key={rowIdx} className={trackClass}>
            {doubled.map((course, i) => (
              <span
                key={i}
                className={styles.animTag}
                style={{
                  color: course.color,
                  borderColor: course.color,
                  background: course.bg,
                }}
              >
                <span className={styles.animTagIcon}>
                  <TagIcon icon={course.icon} size={16} />
                </span>
                {course.name}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

const featureIcons = [
  GraduationCap,
  Calendar,
  StickyNote,
  Bookmark,
  Download,
  Save,
];

export default function FeaturesSection() {
  const { getArray, get } = useCopy();
  const { user } = useAuth();
  const features = getArray("home.features.items");

  return (
    <section id="features" className={styles.features}>
      <SectionHeader
        title={get("home.features.title")}
        subtitle={get("home.features.subtitle")}
        titleWidth="90%"
      />
      <div className={styles.cardGrid}>
        {features.map((feature, index) => {
          const Icon = featureIcons[index];
          return (
            <div key={index} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <Icon size={20} strokeWidth={2} />
                </div>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
              </div>
              <div className={styles.cardBody}>
                {index === 0 ? (
                  <HighlightedCourses />
                ) : index === 1 ? (
                  <MiniSchedule />
                ) : index === 2 ? (
                  <PDFFormat />
                ) : index === 3 ? (
                  <AnimatedTags />
                ) : index === 4 ? (
                  <DownloadPDF get={get} />
                ) : index === 5 ? (
                  <SavedPlans get={get} />
                ) : (
                  <span className={styles.comingSoon}>
                    {get("features.comingSoon")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CTAButton to={user ? "/workspace" : "/register"}>
        {get("features.getStarted")}
      </CTAButton>
    </section>
  );
}
