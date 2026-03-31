import { useRef, useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Printer, Save, Search } from "lucide-react";
import { useCopy } from "../../../hooks/useCopy";
import { useAuth } from "../../../context/AuthContext";
import UndoToast from "../../../components/UndoToast";
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

const STORAGE_KEY = "qalamflow_course_recent";

function getFrequent(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function incrementFrequency(courseName: string) {
  try {
    const recent = getFrequent();
    const updated = [
      courseName,
      ...recent.filter((n) => n !== courseName),
    ].slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

const FEATURED = new Set([
  "Арабский",
  "Чтение Корана",
  "Морфология (сарф)",
  "Мединский курс (МК)",
  "Бейна Ядейк (БЯ)",
]);

const DURATIONS = [
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "1.5 hours", value: 90 },
  { label: "2 hours", value: 120 },
  { label: "2.5 hours", value: 150 },
  { label: "3 hours", value: 180 },
  { label: "3.5 hours", value: 210 },
  { label: "4 hours", value: 240 },
];

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 2; hour <= 21; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour < 21) {
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

function pluralKurs(n: number): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs >= 11 && abs <= 14) return "курсов";
  if (last === 1) return "курс";
  if (last >= 2 && last <= 4) return "курса";
  return "курсов";
}

/* ===== Main component ===== */

interface WeekPlanProps {
  schedule: ScheduleEntry[];
  onScheduleChange: (schedule: ScheduleEntry[]) => void;
  orientation: Orientation;
  onOrientationChange: (o: Orientation) => void;
  onSave: () => void;
  canSave: boolean;
  savedScheduleLength: number;
}

export default function WeekPlan({
  schedule,
  onScheduleChange,
  orientation,
  onOrientationChange,
  onSave,
  canSave,
  savedScheduleLength,
}: WeekPlanProps) {
  const { get } = useCopy();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isGuest = localStorage.getItem("guestMode") === "true" && !user;
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [popup, setPopup] = useState<{ day: string; time: string } | null>(
    null,
  );
  const [showEmoji, setShowEmoji] = useState(true);
  const [deletedEntry, setDeletedEntry] = useState<ScheduleEntry | null>(null);
  const [benefitToast, setBenefitToast] = useState<{
    course: string;
    benefit: string;
    icon: string;
    x: number;
    y: number;
  } | null>(null);
  const benefitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastDeletedRef = useRef<ScheduleEntry | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const saveBtnRef = useRef<HTMLButtonElement>(null);
  const [btnWidth, setBtnWidth] = useState<number | undefined>(undefined);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = saveBtnRef.current;
    if (!btn) return;
    const ro = new ResizeObserver(() => setBtnWidth(btn.offsetWidth));
    ro.observe(btn);
    setBtnWidth(btn.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const scheduleMap = useMemo(() => buildScheduleMap(schedule), [schedule]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && lastDeletedRef.current) {
        onScheduleChange([...schedule, lastDeletedRef.current]);
        lastDeletedRef.current = null;
        setDeletedEntry(null);
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [schedule, onScheduleChange]);

  useEffect(
    () => () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    },
    [],
  );

  function handleCellClick(day: string, time: string, e: React.MouseEvent) {
    const key = `${day}-${time}`;
    const info = scheduleMap.get(key);
    if (info && info.type !== "empty") {
      const entry = info.entry!;
      onScheduleChange(
        schedule.filter(
          (e2) => !(e2.day === entry.day && e2.startTime === entry.startTime),
        ),
      );
      lastDeletedRef.current = entry;
      setDeletedEntry(entry);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => setDeletedEntry(null), 10000);
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    popupPosRef.current = { x: rect.left + rect.width / 2, y: rect.top };
    setPopup({ day, time });
  }

  function handleAdd(course: string, duration: number) {
    if (!popup) return;
    onScheduleChange([
      ...schedule,
      { day: popup.day, startTime: popup.time, course, duration },
    ]);
    setPopup(null);

    const tag = COURSES.find((c) => c.name === course);
    if (tag && "benefit" in tag && (tag as any).benefit) {
      if (benefitTimerRef.current) clearTimeout(benefitTimerRef.current);
      setBenefitToast({
        course,
        benefit: (tag as any).benefit,
        icon: tag.icon,
        x: popupPosRef.current.x,
        y: popupPosRef.current.y,
      });
      benefitTimerRef.current = setTimeout(() => setBenefitToast(null), 3000);
    }
  }

  function handlePrint() {
    if (isGuest) {
      setShowGuestModal(true);
      return;
    }
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
  th, td { border-top: 1px solid #d1d5db; border-right: 1px solid #d1d5db; padding: ${isHorizontal ? "2px 3px" : "3px 5px"}; font-size: ${isHorizontal ? "9px" : "10px"}; text-align: center; height: ${isHorizontal ? "20px" : "29px"}; max-height: ${isHorizontal ? "20px" : "29px"}; overflow: hidden; vertical-align: center; }
  th:last-child, td:last-child { border-right: none; }
  tr:first-child th { border-top: none; }
  th { background: #e8f7f0 !important; font-weight: 600; color: #0a7a48; border-bottom: 1px solid #d1d5db !important; font-size: ${isHorizontal ? "10px" : "11px"}; white-space: nowrap; }
  td:first-child { text-align: center; font-weight: 500; color: #6b7280; width: 52px; background: #e8f7f0 !important; border-right: 1px solid #d1d5db !important; font-size: ${isHorizontal ? "9px" : "9px"}; }
  th:first-child { text-align: center; width: 52px; }
  [data-print="day-full"] { display: inline !important; }
  [data-print="day-short"] { display: none !important; }
  [data-print="label"] { display: none !important; }
  [data-print="course"] { font-size: ${isHorizontal ? "9px" : "10px"}; font-weight: 500; color: #000 !important; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 2px; padding: 1px 2px 0; width: 100%; overflow: hidden; line-height: 1.2; }
  [data-print="course-text"] { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-clamp: 2; word-break: break-word; text-align: center; }
  [data-print="course-icon"] { width: ${isHorizontal ? "11px" : "13px"}; height: ${isHorizontal ? "11px" : "13px"}; flex-shrink: 0; display: flex; align-items: center; justify-content: center; margin-top: 1px; }
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
        <div className={styles.emojiWrap}>
          <div className={styles.saveBubble}>
            <div className={styles.saveBubbleCircle}>
              {showEmoji ? "😊" : "🌒"}
            </div>
            <div className={styles.saveHint}>
              {showEmoji
                ? "Эмоджи добавлены в расписание"
                : "Эмоджи удалены из расписания"}
            </div>
          </div>
          <div className={styles.saveDashedLine} />
          <button
            ref={emojiBtnRef}
            className={`${styles.emojiSwitch} ${showEmoji ? styles.emojiOn : styles.emojiOff}`}
            onClick={() => setShowEmoji((v) => !v)}
            aria-label="Toggle emoji"
          >
            <span className={styles.emojiThumb}>{showEmoji ? "😊" : "🌒"}</span>
          </button>
        </div>

        <div className={styles.saveBtnWrap}>
          <div
            className={styles.saveBubble}
            style={btnWidth ? { width: btnWidth } : undefined}
          >
            <div className={styles.saveBubbleCircle}>
              {schedule.length === 0 ? "🩶" : canSave ? "✨" : "✅"}
            </div>
            <div
              className={`${styles.saveHint} ${canSave ? styles.saveHintActive : schedule.length > 0 ? styles.saveHintDone : ""}`}
            >
              {schedule.length === 0 ? (
                "Вы ещё не добавили курс"
              ) : canSave ? (
                <>
                  Вы добавили{" "}
                  <strong>
                    {schedule.length - savedScheduleLength}{" "}
                    {pluralKurs(schedule.length - savedScheduleLength)}
                  </strong>{" "}
                  — сохраните план
                </>
              ) : (
                "План сохранён"
              )}
            </div>
          </div>
          <div className={styles.saveDashedLine} />
          <button
            ref={saveBtnRef}
            className={styles.saveBtn}
            onClick={onSave}
            disabled={!canSave}
          >
            <Save size={18} />
            {get("pdfExport.savePlan")}
          </button>
        </div>
        <button className={styles.printBtn} onClick={handlePrint}>
          <Printer size={18} />
          {get("pdfExport.printPDF")}
        </button>

        {/* Line-break: forces toggle to new row at ≤1000px */}
        <div className={styles.toolbarBreak} />
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
          isAdmin={isAdmin}
        />
      )}

      {benefitToast && (
        <div
          className={styles.benefitToast}
          style={{ left: benefitToast.x, top: benefitToast.y }}
        >
          <span className={styles.benefitToastLabel}>ПОЛЬЗА КУРСА</span>
          <div className={styles.benefitToastBody}>
            <TagIcon icon={benefitToast.icon} size={22} />
            <span className={styles.benefitToastText}>
              {benefitToast.benefit}
            </span>
          </div>
        </div>
      )}

      {deletedEntry && (
        <UndoToast
          message={deletedEntry.course}
          onUndo={() => {
            onScheduleChange([...schedule, deletedEntry]);
            lastDeletedRef.current = null;
            setDeletedEntry(null);
            if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
          }}
        />
      )}

      {showGuestModal && (
        <div
          className={styles.guestModalOverlay}
          onClick={() => setShowGuestModal(false)}
        >
          <div
            className={styles.guestModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.guestModalEmoji}>🎉</div>
            <h3 className={styles.guestModalTitle}>
              Ага! Вы хотите распечатать крутой план?
            </h3>
            <p className={styles.guestModalText}>
              Зарегистрируйтесь, чтобы не потерять план и иметь доступ к нему с
              любого устройства!
            </p>
            <button
              className={styles.guestModalRegister}
              onClick={() => {
                localStorage.removeItem("guestMode");
                navigate("/register");
              }}
            >
              Зарегистрироваться
            </button>
            <button
              className={styles.guestModalLater}
              onClick={() => setShowGuestModal(false)}
            >
              Позже
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Popup ===== */

const LAST_DURATION_KEY = "qalamflow_last_duration";
const LAST_COURSE_KEY = "qalamflow_last_course";

function getLastDuration(): number | null {
  try {
    const raw = localStorage.getItem(LAST_DURATION_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

function saveLastDuration(d: number) {
  try {
    localStorage.setItem(LAST_DURATION_KEY, String(d));
  } catch {}
}

function getLastCourse(): string | null {
  try {
    return localStorage.getItem(LAST_COURSE_KEY);
  } catch {
    return null;
  }
}

function saveLastCourse(name: string) {
  try {
    localStorage.setItem(LAST_COURSE_KEY, name);
  } catch {}
}

function CoursePopup({
  onAdd,
  onClose,
  showEmoji,
  isAdmin,
}: {
  onAdd: (course: string, duration: number) => void;
  onClose: () => void;
  showEmoji: boolean;
  isAdmin: boolean;
}) {
  const { get } = useCopy();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(
    getLastCourse,
  );
  const [selectedDuration, setSelectedDuration] = useState<number | null>(
    getLastDuration,
  );
  const [search, setSearch] = useState("");

  const allCourses = useMemo(
    () => COURSES.filter((c) => isAdmin || !(c as any).adminOnly),
    [isAdmin],
  );

  const visibleCourses = useMemo(() => {
    const q = search.trim().toLowerCase().replace(/\s+/g, "");
    if (q.length >= 3)
      return allCourses.filter((c) =>
        c.name.toLowerCase().replace(/\s+/g, "").includes(q),
      );
    const frequent = getFrequent();
    if (frequent.length > 0) {
      const freqSet = new Set(frequent);
      const matched = allCourses.filter((c) => freqSet.has(c.name));
      if (matched.length > 0) return matched;
    }
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
        <p className={styles.popupLabel}>
          {get("home.howItWorks.popup.selectCourse")}
        </p>
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
              onClick={() => {
                setSelectedCourse(c.name);
                saveLastCourse(c.name);
              }}
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
            <p className={styles.searchEmpty}>
              {get("workspace.nothingFound")}
            </p>
          )}
        </div>

        {/* Duration */}
        <p className={styles.popupLabel}>
          {get("home.howItWorks.popup.duration")}
        </p>
        <div className={styles.durationGrid}>
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              className={`${styles.durationBtn} ${selectedDuration === d.value ? styles.durationActive : ""}`}
              onClick={() => {
                setSelectedDuration(d.value);
                saveLastDuration(d.value);
              }}
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
              incrementFrequency(selectedCourse);
              saveLastDuration(selectedDuration);
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
  onCellClick: (day: string, time: string, e: React.MouseEvent) => void;
  className: string;
  showEmoji: boolean;
}) {
  const key = `${day}-${time}`;
  const info = scheduleMap.get(key);

  if (info && info.type !== "empty") {
    const isStart = info.type === "start";
    const { isLast } = info;
    const c = info.course?.color ?? "var(--color-primary-solid, #4ade80)";
    const bg = info.course?.bg ?? "color-mix(in srgb, var(--color-primary-solid, #4ade80) 12%, transparent)";
    const stripe = `color-mix(in srgb, ${c} 5%, transparent)`;
    const lineColor = `color-mix(in srgb, ${c} 100%, transparent)`;
    const cellStyle: React.CSSProperties = {
      backgroundColor: bg,
      backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 4px, ${stripe} 4px, ${stripe} 7px)`,
      zIndex: info.order + 1,
      borderLeft: `1px solid ${lineColor}`,
      borderRightColor: lineColor,
      ...(isStart
        ? { borderTop: `1px solid ${lineColor}` }
        : { borderTopColor: "transparent" }),
      ...(isLast && { borderBottom: `1px solid ${lineColor}` }),
    };
    const displayName = info.course?.name ?? info.entry?.course ?? "";
    return (
      <td
        className={`${className} ${styles.cellBooked}`}
        style={cellStyle}
        data-print="booked"
        onClick={(e) => onCellClick(day, time, e)}
      >
        {isStart && (
          <span className={styles.courseName} data-print="course">
            {showEmoji && info.course && typeof info.course.icon === "string" && (
              <span className={styles.courseIconCell} data-print="course-icon">
                <TagIcon icon={info.course.icon} size={15} />
              </span>
            )}
            <span className={styles.courseText} data-print="course-text">
              {displayName.split("\n")[0]}
            </span>
          </span>
        )}
      </td>
    );
  }

  return (
    <td className={className} onClick={(e) => onCellClick(day, time, e)}>
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
  onCellClick: (day: string, time: string, e: React.MouseEvent) => void;
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
  onCellClick: (day: string, time: string, e: React.MouseEvent) => void;
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
