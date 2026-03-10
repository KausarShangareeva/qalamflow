import { useRef, useState, useMemo } from "react";
import { Printer, Save, Search } from "lucide-react";
import { useCopy } from "../../../hooks/useCopy";
import type { ScheduleEntry } from "../types";
import COURSES from "../../../json/tags.json";
import WEEKDAYS from "../../../json/weekdays.json";
import TagIcon from "../../../components/TagIcon";
import styles from "./WeekPlan.module.css";

/* ===== Constants ===== */

const DAYS = WEEKDAYS.days.map((d) => d.full);

const DAY_SHORT: Record<string, string> = Object.fromEntries(
  WEEKDAYS.days.map((d) => [d.full, d.short]),
);

const FEATURED = new Set([
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "History",
  "Geography",
  "English",
  "Computer Science",
  "Literature",
  "Art",
]);

const DURATIONS = [
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "1.5 hours", value: 90 },
  { label: "2 hours", value: 120 },
  { label: "2.5 hours", value: 150 },
  { label: "3 hours", value: 180 },
];

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 5; hour <= 22; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour < 22) {
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

/* ===== Types ===== */

interface CellInfo {
  type: "start" | "continuation" | "empty";
  isLast: boolean;
  order: number;
  course?: (typeof COURSES)[number];
  entry?: ScheduleEntry;
}

type Orientation = "vertical" | "horizontal";

/* ===== Helpers ===== */

function getTimeSlotsForEntry(startTime: string, duration: number): string[] {
  const startIdx = TIME_SLOTS.indexOf(startTime);
  if (startIdx === -1) return [];
  const slotCount = duration / 30;
  return TIME_SLOTS.slice(startIdx, startIdx + slotCount);
}

function buildScheduleMap(entries: ScheduleEntry[]): Map<string, CellInfo> {
  const map = new Map<string, CellInfo>();
  entries.forEach((entry, entryIdx) => {
    const course = COURSES.find((c) => c.name === entry.course);
    const slots = getTimeSlotsForEntry(entry.startTime, entry.duration);
    slots.forEach((time, i) => {
      const key = `${entry.day}-${time}`;
      map.set(key, {
        type: i === 0 ? "start" : "continuation",
        isLast: i === slots.length - 1,
        order: entryIdx,
        course,
        entry,
      });
    });
  });
  return map;
}

/* ===== Main component ===== */

interface WeekPlanProps {
  schedule: ScheduleEntry[];
  onScheduleChange: (schedule: ScheduleEntry[]) => void;
  orientation: Orientation;
  onOrientationChange: (o: Orientation) => void;
  onSave: () => void;
  canSave: boolean;
}

export default function WeekPlan({
  schedule,
  onScheduleChange,
  orientation,
  onOrientationChange,
  onSave,
  canSave,
}: WeekPlanProps) {
  const { get } = useCopy();
  const [popup, setPopup] = useState<{ day: string; time: string } | null>(
    null,
  );
  const [showEmoji, setShowEmoji] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);

  const scheduleMap = useMemo(() => buildScheduleMap(schedule), [schedule]);

  function handleCellClick(day: string, time: string) {
    const key = `${day}-${time}`;
    const info = scheduleMap.get(key);
    if (info && info.type !== "empty") {
      onScheduleChange(
        schedule.filter(
          (e) =>
            !(
              e.day === info.entry!.day && e.startTime === info.entry!.startTime
            ),
        ),
      );
      return;
    }
    setPopup({ day, time });
  }

  function handleAdd(course: string, duration: number) {
    if (!popup) return;
    onScheduleChange([
      ...schedule,
      { day: popup.day, startTime: popup.time, course, duration },
    ]);
    setPopup(null);
  }

  function handlePrint() {
    const el = tableRef.current;
    if (!el) return;

    const isHorizontal = orientation === "horizontal";
    const pageSize = isHorizontal
      ? "@page { size: landscape; margin: 8mm; }"
      : "@page { size: portrait; margin: 8mm; }";

    // Resolve CSS variables (var(--tag-*)) so they work inside the iframe
    const computedRoot = getComputedStyle(document.documentElement);
    const resolvedVars = COURSES.flatMap((course) => [course.color, course.bg])
      .filter((val): val is string => typeof val === "string")
      .map((val) => val.match(/var\((--[^)]+)\)/)?.[1])
      .filter((varName): varName is string => !!varName)
      .filter((varName, i, arr) => arr.indexOf(varName) === i)
      .map(
        (varName) =>
          `${varName}: ${computedRoot.getPropertyValue(varName).trim()};`,
      )
      .filter(Boolean);
    const cssVarsBlock = `:root { ${resolvedVars.join(" ")} }`;

    const iframe = document.createElement("iframe");
    Object.assign(iframe.style, {
      position: "fixed",
      left: "-9999px",
      top: "-9999px",
      width: "0",
      height: "0",
    });
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Weekly Plan</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  ${cssVarsBlock}
  ${pageSize}
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  html { font-size: 10px; }
  body { font-family: "Montserrat", system-ui, sans-serif; background: #fff; }
  table { width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; border: 1px solid #d1d5db; border-radius: 12px; overflow: hidden; }
  th, td { border-top: 1px solid #d1d5db; border-right: 1px solid #d1d5db; padding: ${isHorizontal ? "2px 3px" : "3px 5px"}; font-size: ${isHorizontal ? "9px" : "10px"}; text-align: center; height: ${isHorizontal ? "20px" : "29px"}; vertical-align: top; }
  th:last-child, td:last-child { border-right: none; }
  tr:first-child th { border-top: none; }
  th { background: #f3f0fb !important; font-weight: 500; color: #6949b2; border-bottom: 1px solid #d1d5db !important; font-size: ${isHorizontal ? "10px" : "11px"}; white-space: nowrap; }
  td:first-child { text-align: center; font-weight: 500; color: #6b7280; width: 52px; background: #f3f0fb !important; border-right: 1px solid #d1d5db !important; font-size: ${isHorizontal ? "9px" : "9px"}; }
  th:first-child { text-align: center; width: 52px; }
  [data-print="day-full"] { display: inline !important; }
  [data-print="day-short"] { display: none !important; }
  [data-print="label"] { display: none !important; }
  [data-print="course"] { font-size: ${isHorizontal ? "11px" : "12px"}; font-weight: 500; color: #000 !important; display: flex; align-items: center; justify-content: center; gap: 3px; overflow: hidden; white-space: nowrap; padding-top: 4px; }
  [data-print="course-icon"] { width: ${isHorizontal ? "13px" : "15px"}; height: ${isHorizontal ? "13px" : "15px"}; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
  [data-print="course-icon"] img { width: 100% !important; height: 100% !important; }
  [data-print="booked"] { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
</style>
</head><body>${el.innerHTML}</body></html>`);
    doc.close();

    iframe.contentWindow?.focus();
    // Delay to allow fonts and emoji images to load before printing
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 600);
  }

  return (
    <div className={styles.wrapper}>
      {/* Toggle + Print */}
      <div className={styles.toolbar}>
        <div className={styles.toggle}>
          <button
            className={`${styles.toggleBtn} ${orientation === "vertical" ? styles.toggleActive : ""}`}
            onClick={() => onOrientationChange("vertical")}
          >
            <img src="/virtical.svg" alt="" className={styles.toggleIcon} />
            <span>{get("workspace.vertical")}</span>
          </button>
          <button
            className={`${styles.toggleBtn} ${orientation === "horizontal" ? styles.toggleActive : ""}`}
            onClick={() => onOrientationChange("horizontal")}
          >
            <img src="/horizontal.svg" alt="" className={styles.toggleIcon} />
            <span>{get("workspace.horizontal")}</span>
          </button>
        </div>
        {/* Emoji toggle */}
        <button
          className={`${styles.emojiSwitch} ${showEmoji ? styles.emojiOn : styles.emojiOff}`}
          onClick={() => setShowEmoji((v) => !v)}
          aria-label="Toggle emoji"
        >
          <span className={styles.emojiThumb}>{showEmoji ? "😊" : "🌒"}</span>
        </button>

        <button className={styles.saveBtn} onClick={onSave} disabled={!canSave}>
          <Save size={18} />
          {get("pdfExport.savePlan")}
        </button>
        <button className={styles.printBtn} onClick={handlePrint}>
          <Printer size={18} />
          {get("pdfExport.printPDF")}
        </button>
      </div>

      {/* Table */}
      <div
        className={`${styles.tableContainer} ${orientation === "horizontal" ? styles.landscapePage : styles.portraitPage}`}
        ref={tableRef}
      >
        {orientation === "vertical" ? (
          <VerticalTable
            scheduleMap={scheduleMap}
            onCellClick={handleCellClick}
            showEmoji={showEmoji}
          />
        ) : (
          <HorizontalTable
            scheduleMap={scheduleMap}
            onCellClick={handleCellClick}
            showEmoji={showEmoji}
          />
        )}
      </div>

      {/* Popup */}
      {popup && (
        <CoursePopup
          onAdd={handleAdd}
          onClose={() => setPopup(null)}
          showEmoji={showEmoji}
        />
      )}
    </div>
  );
}

/* ===== Popup ===== */

function CoursePopup({
  onAdd,
  onClose,
  showEmoji,
}: {
  onAdd: (course: string, duration: number) => void;
  onClose: () => void;
  showEmoji: boolean;
}) {
  const { get } = useCopy();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const visibleCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length >= 2)
      return COURSES.filter((c) => c.name.toLowerCase().includes(q));
    return COURSES.filter((c) => FEATURED.has(c.name));
  }, [search]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.popupHeader}>
          <span>{get("home.howItWorks.popup.title")}</span>
          <button className={styles.popupClose} onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Courses */}
        <p className={styles.popupLabel}>{get("home.howItWorks.popup.selectCourse")}</p>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder={get("home.howItWorks.popup.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.courseGrid}>
          {visibleCourses.map((c) => (
            <button
              key={c.name}
              className={`${styles.courseTag} ${selectedCourse === c.name ? styles.courseTagActive : ""}`}
              style={{ "--tag-color": c.color } as React.CSSProperties}
              onClick={() => setSelectedCourse(c.name)}
            >
              {showEmoji && typeof c.icon === "string" && (
                <span className={styles.courseIcon}>
                  <TagIcon icon={c.icon} size={14} />
                </span>
              )}
              {c.name}
            </button>
          ))}
          {visibleCourses.length === 0 && (
            <p className={styles.searchEmpty}>{get("workspace.nothingFound")}</p>
          )}
        </div>

        {/* Duration */}
        <p className={styles.popupLabel}>{get("home.howItWorks.popup.duration")}</p>
        <div className={styles.durationGrid}>
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              className={`${styles.durationBtn} ${selectedDuration === d.value ? styles.durationActive : ""}`}
              onClick={() => setSelectedDuration(d.value)}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Submit */}
        <button
          className={styles.addBtn}
          disabled={!selectedCourse || !selectedDuration}
          onClick={() => {
            if (selectedCourse && selectedDuration) {
              onAdd(selectedCourse, selectedDuration);
            }
          }}
        >
          {get("home.howItWorks.popup.addButton")}
        </button>
      </div>
    </div>
  );
}

/* ===== Shared cell renderer ===== */

function ScheduleCell({
  day,
  time,
  scheduleMap,
  onCellClick,
  className,
  showEmoji,
}: {
  day: string;
  time: string;
  scheduleMap: Map<string, CellInfo>;
  onCellClick: (day: string, time: string) => void;
  className: string;
  showEmoji: boolean;
}) {
  const key = `${day}-${time}`;
  const info = scheduleMap.get(key);

  if (info && info.course) {
    const isStart = info.type === "start";
    const { isLast } = info;
    const c = info.course.color;
    const stripe = `color-mix(in srgb, ${c} 5%, transparent)`;
    const lineColor = `color-mix(in srgb, ${c} 100%, transparent)`;
    const cellStyle: React.CSSProperties = {
      backgroundColor: info.course.bg,
      backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 4px, ${stripe} 4px, ${stripe} 7px)`,
      zIndex: info.order + 1,
      borderLeft: `1px solid ${lineColor}`,
      borderRightColor: lineColor,
      ...(isStart
        ? { borderTop: `1px solid ${lineColor}` }
        : { borderTopColor: "transparent" }),
      ...(isLast && { borderBottom: `1px solid ${lineColor}` }),
    };
    return (
      <td
        className={`${className} ${styles.cellBooked}`}
        style={cellStyle}
        data-print="booked"
        onClick={() => onCellClick(day, time)}
      >
        {isStart && (
          <span className={styles.courseName} data-print="course">
            {showEmoji && typeof info.course.icon === "string" && (
              <span className={styles.courseIconCell} data-print="course-icon">
                <TagIcon icon={info.course.icon} size={15} />
              </span>
            )}
            <span className={styles.courseText}>{info.course.name}</span>
          </span>
        )}
      </td>
    );
  }

  return (
    <td className={className} onClick={() => onCellClick(day, time)}>
      <span className={styles.cellLabel} data-print="label">
        {DAY_SHORT[day]}. {time}
      </span>
    </td>
  );
}

/* ===== Vertical table ===== */

function VerticalTable({
  scheduleMap,
  onCellClick,
  showEmoji,
}: {
  scheduleMap: Map<string, CellInfo>;
  onCellClick: (day: string, time: string) => void;
  showEmoji: boolean;
}) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.timeHeader} />
          {DAYS.map((day) => (
            <th key={day} className={styles.dayHeader}>
              <span className={styles.dayFull} data-print="day-full">
                {day}
              </span>
              <span className={styles.dayShort} data-print="day-short">
                {DAY_SHORT[day]}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {TIME_SLOTS.map((time) => (
          <tr
            key={time}
            className={time.endsWith(":00") ? styles.hourRow : styles.halfRow}
          >
            <td className={styles.timeCell}>{time}</td>
            {DAYS.map((day) => (
              <ScheduleCell
                key={day}
                day={day}
                time={time}
                scheduleMap={scheduleMap}
                onCellClick={onCellClick}
                className={styles.cell}
                showEmoji={showEmoji}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ===== Horizontal table (landscape: days on top, time on left) ===== */

function HorizontalTable({
  scheduleMap,
  onCellClick,
  showEmoji,
}: {
  scheduleMap: Map<string, CellInfo>;
  onCellClick: (day: string, time: string) => void;
  showEmoji: boolean;
}) {
  return (
    <table className={`${styles.table} ${styles.tableHorizontal}`}>
      <thead>
        <tr>
          <th className={styles.timeHeader} />
          {DAYS.map((day) => (
            <th key={day} className={styles.dayHeader}>
              <span className={styles.dayFull} data-print="day-full">
                {day}
              </span>
              <span className={styles.dayShort} data-print="day-short">
                {DAY_SHORT[day]}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {TIME_SLOTS.map((time) => (
          <tr
            key={time}
            className={time.endsWith(":00") ? styles.hourRow : styles.halfRow}
          >
            <td className={styles.timeCell}>{time}</td>
            {DAYS.map((day) => (
              <ScheduleCell
                key={day}
                day={day}
                time={time}
                scheduleMap={scheduleMap}
                onCellClick={onCellClick}
                className={styles.cell}
                showEmoji={showEmoji}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
