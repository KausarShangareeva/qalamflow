import { useRef, useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Printer, Save, Search } from "lucide-react";
import { useCopy } from "../../../hooks/useCopy";
import { useLocalizedWeekdays } from "../../../hooks/useLocalizedWeekdays";
import { useLocalizedTags } from "../../../hooks/useLocalizedTags";
import { useAuth } from "../../../context/AuthContext";
import UndoToast from "../../../components/UndoToast";
import type { ScheduleEntry } from "../types";
import COURSES from "../../../data/ru/tags.json";
import WEEKDAYS from "../../../data/ru/weekdays.json";
import TagIcon from "../../../components/TagIcon";
import styles from "./WeekPlan.module.css";

/* ===== Constants ===== */

// DAYS is the canonical key list (RU full names) — saved schedule entries
// store these as identifiers, so it stays in RU regardless of UI language.
const DAYS = WEEKDAYS.days.map((d) => d.full);

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
  for (let hour = 0; hour <= 23; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    slots.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

/* ===== Palette & time range ===== */

const PALETTE_COLORS = [
  "#1aaa6a",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#eab308",
  "#06b6d4",
  "#ef4444",
];

const ACCENT_KEY = "qalamflow_accent_color";
const TIME_FROM_KEY = "qalamflow_time_from";
const TIME_TO_KEY = "qalamflow_time_to";
const CUSTOM_TAGS_KEY = "qalamflow_custom_tags";

interface CustomTag {
  name: string;
  icon: string;
  color: string;
  bg: string;
}

function getCustomTags(): CustomTag[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TAGS_KEY);
    return raw ? (JSON.parse(raw) as CustomTag[]) : [];
  } catch {
    return [];
  }
}

function saveCustomTagsToStorage(tags: CustomTag[]) {
  try {
    localStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify(tags));
  } catch {}
}

function generateDynamicTimeSlots(from: number, to: number): string[] {
  const slots: string[] = [];
  for (let hour = from; hour <= to; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour < to) slots.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return slots;
}

function lightenHex(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r + (255 - r) * amount)}, ${Math.round(g + (255 - g) * amount)}, ${Math.round(b + (255 - b) * amount)})`;
}

/* ===== Types ===== */

interface AnyTag {
  name: string;
  color: string;
  bg: string;
  icon?: string;
  benefit?: string;
}

interface CellInfo {
  type: "start" | "continuation" | "empty";
  isLast: boolean;
  order: number;
  course?: AnyTag;
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

function buildScheduleMap(
  entries: ScheduleEntry[],
  allTags: AnyTag[],
): Map<string, CellInfo> {
  const map = new Map<string, CellInfo>();
  entries.forEach((entry, entryIdx) => {
    const course = allTags.find((c) => c.name === entry.course);
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

function pluralKurs(
  n: number,
  lang: string,
  get: (path: string) => string,
): string {
  if (lang === "en") {
    return n === 1
      ? get("workspace.courseSingular")
      : get("workspace.courseFew");
  }
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs >= 11 && abs <= 14) return get("workspace.courseMany");
  if (last === 1) return get("workspace.courseSingular");
  if (last >= 2 && last <= 4) return get("workspace.courseFew");
  return get("workspace.courseMany");
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
  const { lang } = useLocalizedWeekdays();
  const { benefitForName } = useLocalizedTags();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isGuest = localStorage.getItem("guestMode") === "true" && !user;
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [popup, setPopup] = useState<{ day: string; time: string } | null>(
    null,
  );
  const [showEmoji, setShowEmoji] = useState(true);
  const [accentColor, setAccentColor] = useState<string>(
    () => localStorage.getItem(ACCENT_KEY) || "#1aaa6a",
  );
  const [timeFrom, setTimeFrom] = useState<number>(() =>
    Number(localStorage.getItem(TIME_FROM_KEY) || "2"),
  );
  const [timeTo, setTimeTo] = useState<number>(() =>
    Number(localStorage.getItem(TIME_TO_KEY) || "21"),
  );
  const dynamicTimeSlots = useMemo(
    () => generateDynamicTimeSlots(timeFrom, timeTo),
    [timeFrom, timeTo],
  );
  const [customTags, setCustomTags] = useState<CustomTag[]>(getCustomTags);
  const allTags = useMemo<AnyTag[]>(
    () => [
      ...(COURSES as AnyTag[]),
      ...customTags,
    ],
    [customTags],
  );
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

  const scheduleMap = useMemo(
    () => buildScheduleMap(schedule, allTags),
    [schedule, allTags],
  );

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

    const tag = allTags.find((c) => c.name === course);
    if (tag && tag.benefit) {
      if (benefitTimerRef.current) clearTimeout(benefitTimerRef.current);
      setBenefitToast({
        course,
        benefit: tag.benefit!,
        icon: tag.icon ?? "",
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
  th { background: ${lightenHex(accentColor, 0.86)} !important; font-weight: 600; color: ${accentColor}; border-bottom: 1px solid #d1d5db !important; font-size: ${isHorizontal ? "10px" : "11px"}; white-space: nowrap; }
  td:first-child { text-align: center; font-weight: 500; color: #6b7280; width: 52px; background: ${lightenHex(accentColor, 0.91)} !important; border-right: 1px solid #d1d5db !important; font-size: ${isHorizontal ? "9px" : "9px"}; }
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
        <div className={styles.tableControls}>
          {/* Time range */}
          <div className={styles.timeRangeRow}>
            <span className={styles.timeRangeLabel}>От</span>
            <select
              className={styles.timeSelect}
              value={timeFrom}
              onChange={(e) => {
                const v = Number(e.target.value);
                setTimeFrom(v);
                localStorage.setItem(TIME_FROM_KEY, String(v));
              }}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i} disabled={i >= timeTo}>
                  {i.toString().padStart(2, "0")}:00
                </option>
              ))}
            </select>
            <span className={styles.timeRangeLabel}>До</span>
            <select
              className={styles.timeSelect}
              value={timeTo}
              onChange={(e) => {
                const v = Number(e.target.value);
                setTimeTo(v);
                localStorage.setItem(TIME_TO_KEY, String(v));
              }}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i + 1} value={i + 1} disabled={i + 1 <= timeFrom}>
                  {(i + 1).toString().padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </div>

          {/* Color swatches */}
          <div className={styles.colorPalette}>
            {PALETTE_COLORS.map((color) => (
              <button
                key={color}
                className={`${styles.colorSwatch} ${accentColor === color ? styles.colorSwatchActive : ""}`}
                style={{ background: color }}
                title={color}
                onClick={() => {
                  setAccentColor(color);
                  localStorage.setItem(ACCENT_KEY, color);
                }}
              />
            ))}
          </div>

          {/* Orientation toggle */}
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
        </div>

        {/* Emoji toggle */}
        <div className={styles.emojiWrap}>
          <div className={styles.saveBubble}>
            <div className={styles.saveBubbleCircle}>
              {showEmoji ? "😊" : "🌒"}
            </div>
            <div className={styles.saveHint}>
              {showEmoji
                ? get("workspace.saveHints.emojiAdded")
                : get("workspace.saveHints.emojiRemoved")}
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
                get("workspace.saveHints.noCourseYet")
              ) : canSave ? (
                <>
                  {get("workspace.saveHints.youAdded")}{" "}
                  <strong>
                    {schedule.length - savedScheduleLength}{" "}
                    {pluralKurs(schedule.length - savedScheduleLength, lang, get)}
                  </strong>{" "}
                  {get("workspace.saveHints.savePlanSuffix")}
                </>
              ) : (
                get("workspace.saveHints.planSaved")
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
        style={{ "--table-accent": accentColor } as React.CSSProperties}
      >
        {orientation === "vertical" ? (
          <VerticalTable
            scheduleMap={scheduleMap}
            onCellClick={handleCellClick}
            showEmoji={showEmoji}
            timeSlots={dynamicTimeSlots}
          />
        ) : (
          <HorizontalTable
            scheduleMap={scheduleMap}
            onCellClick={handleCellClick}
            showEmoji={showEmoji}
            timeSlots={dynamicTimeSlots}
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
          customTags={customTags}
          onCustomTagsChange={(tags) => {
            setCustomTags(tags);
            saveCustomTagsToStorage(tags);
          }}
        />
      )}

      {benefitToast && (
        <div
          className={styles.benefitToast}
          style={{ left: benefitToast.x, top: benefitToast.y }}
        >
          <span className={styles.benefitToastLabel}>
            {get("workspace.benefitToastLabel")}
          </span>
          <div className={styles.benefitToastBody}>
            <TagIcon icon={benefitToast.icon} size={22} />
            <span className={styles.benefitToastText}>
              {benefitForName(benefitToast.course) || benefitToast.benefit}
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
              {get("workspace.guestModal.title")}
            </h3>
            <p className={styles.guestModalText}>
              {get("workspace.guestModal.text")}
            </p>
            <button
              className={styles.guestModalRegister}
              onClick={() => {
                localStorage.removeItem("guestMode");
                navigate("/register");
              }}
            >
              {get("workspace.guestModal.register")}
            </button>
            <button
              className={styles.guestModalLater}
              onClick={() => setShowGuestModal(false)}
            >
              {get("workspace.guestModal.later")}
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
  customTags,
  onCustomTagsChange,
}: {
  onAdd: (course: string, duration: number) => void;
  onClose: () => void;
  showEmoji: boolean;
  isAdmin: boolean;
  customTags: CustomTag[];
  onCustomTagsChange: (tags: CustomTag[]) => void;
}) {
  const { get } = useCopy();
  const { translateName } = useLocalizedTags();
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(getLastCourse);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(getLastDuration);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagIcon, setNewTagIcon] = useState("🏷️");
  const [newTagColor, setNewTagColor] = useState(PALETTE_COLORS[0]);

  const baseCourses = useMemo(
    () => COURSES.filter((c) => isAdmin || !(c as any).adminOnly) as AnyTag[],
    [isAdmin],
  );

  // Search matches both the canonical (RU) name and the localized display
  // name, so the user can type in whichever language the UI is currently in.
  const matchesQuery = (c: AnyTag, q: string): boolean => {
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");
    if (norm(c.name).includes(q)) return true;
    const localized = translateName(c.name);
    if (localized !== c.name && norm(localized).includes(q)) return true;
    return false;
  };

  const visibleCourses = useMemo(() => {
    const q = search.trim().toLowerCase().replace(/\s+/g, "");
    const pool: AnyTag[] = [...baseCourses, ...customTags];
    if (q.length >= 3) return pool.filter((c) => matchesQuery(c, q));
    const frequent = getFrequent();
    if (frequent.length > 0) {
      const freqSet = new Set(frequent);
      const matched = pool.filter((c) => freqSet.has(c.name));
      if (matched.length > 0) return matched;
    }
    return (COURSES as AnyTag[]).filter((c) => FEATURED.has(c.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, baseCourses, customTags, translateName]);

  function handleSaveCustomTag() {
    const name = newTagName.trim();
    if (!name) return;
    const pool: AnyTag[] = [...baseCourses, ...customTags];
    if (pool.some((c) => c.name === name)) return;
    const tag: CustomTag = { name, icon: newTagIcon || "🏷️", color: newTagColor, bg: newTagColor + "20" };
    onCustomTagsChange([...customTags, tag]);
    setSelectedCourse(name);
    saveLastCourse(name);
    setShowAddForm(false);
    setNewTagName("");
    setNewTagIcon("🏷️");
    setNewTagColor(PALETTE_COLORS[0]);
  }

  function handleDeleteCustomTag(name: string) {
    onCustomTagsChange(customTags.filter((t) => t.name !== name));
    if (selectedCourse === name) setSelectedCourse(null);
  }

  const showAddPrompt = search.trim().length >= 3 && visibleCourses.length === 0 && !showAddForm;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.popupHeader}>
          <span>{get("home.howItWorks.popup.title")}</span>
          <button className={styles.popupClose} onClick={onClose}>&times;</button>
        </div>

        {/* Tabs */}
        <div className={styles.popupTabs}>
          <button
            className={`${styles.popupTab} ${tab === "all" ? styles.popupTabActive : ""}`}
            onClick={() => setTab("all")}
          >
            {get("home.howItWorks.popup.selectCourse")}
          </button>
          <button
            className={`${styles.popupTab} ${tab === "mine" ? styles.popupTabActive : ""}`}
            onClick={() => setTab("mine")}
          >
            {get("workspace.popupTabMyTags")}
            {customTags.length > 0 && (
              <span className={styles.popupTabBadge}>{customTags.length}</span>
            )}
          </button>
        </div>

        {/* ── All courses tab ── */}
        {tab === "all" && (
          <>
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
                  onClick={() => { setSelectedCourse(c.name); saveLastCourse(c.name); }}
                >
                  {showEmoji && c.icon && (
                    <span className={styles.courseIcon}><TagIcon icon={c.icon} size={14} /></span>
                  )}
                  {translateName(c.name)}
                </button>
              ))}
              <button
                className={styles.addCustomTagBtn}
                onClick={() => {
                  setShowAddForm((v) => !v);
                  if (!showAddForm && search.trim()) setNewTagName(search.trim());
                }}
              >
                <span className={styles.addCustomTagPlus}>+</span>
                {get("workspace.popupAddCustomBtn")}
              </button>
            </div>
            {showAddPrompt && (
              <p className={styles.notFoundPrompt}>
                {get("workspace.popupNotFound")}{" "}
                <button className={styles.notFoundBtn} onClick={() => { setShowAddForm(true); setNewTagName(search.trim()); }}>
                  {get("workspace.popupAddTagBtn")}
                </button>
              </p>
            )}
          </>
        )}

        {/* ── My tags tab ── */}
        {tab === "mine" && (
          <div className={styles.myTagsPanel}>
            {customTags.length === 0 ? (
              <p className={styles.myTagsEmpty}>
                {get("workspace.popupMyTagsEmpty")}<br />
                {get("workspace.popupMyTagsHint")}
              </p>
            ) : (
              <div className={styles.courseGrid}>
                {customTags.map((c) => (
                  <div key={c.name} className={styles.myTagRow}>
                    <button
                      className={`${styles.courseTag} ${selectedCourse === c.name ? styles.courseTagActive : ""}`}
                      style={{ "--tag-color": c.color } as React.CSSProperties}
                      onClick={() => { setSelectedCourse(c.name); saveLastCourse(c.name); }}
                    >
                      {showEmoji && c.icon && (
                        <span className={styles.courseIcon}><TagIcon icon={c.icon} size={14} /></span>
                      )}
                      {c.name}
                    </button>
                    <button
                      className={styles.myTagDelete}
                      onClick={() => handleDeleteCustomTag(c.name)}
                      title={get("workspace.customTag.delete")}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              className={styles.addCustomTagBtn}
              style={{ marginTop: "var(--space-sm)" }}
              onClick={() => { setTab("all"); setShowAddForm(true); }}
            >
              <span className={styles.addCustomTagPlus}>+</span>
              {get("workspace.popupAddTagFooter")}
            </button>
          </div>
        )}

        {/* Add form */}
        {showAddForm && tab === "all" && (
          <div className={styles.addTagForm}>
            <div className={styles.addTagRow}>
              <input
                className={styles.addTagEmojiInput}
                value={newTagIcon}
                onChange={(e) => setNewTagIcon(e.target.value)}
                placeholder="🏷️"
              />
              <input
                className={styles.addTagNameInput}
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder={get("workspace.customTag.namePlaceholder")}
                onKeyDown={(e) => e.key === "Enter" && handleSaveCustomTag()}
                autoFocus
              />
            </div>
            <div className={styles.addTagColorRow}>
              {PALETTE_COLORS.map((color) => (
                <button
                  key={color}
                  className={`${styles.addTagColorSwatch} ${newTagColor === color ? styles.addTagColorActive : ""}`}
                  style={{ background: color }}
                  onClick={(e) => { e.stopPropagation(); setNewTagColor(color); }}
                />
              ))}
            </div>
            <div className={styles.addTagActions}>
              <button
                className={styles.addTagSave}
                style={{ background: newTagColor }}
                onClick={handleSaveCustomTag}
                disabled={!newTagName.trim()}
              >
                {get("workspace.customTag.save")}
              </button>
              <button className={styles.addTagCancel} onClick={() => setShowAddForm(false)}>
                {get("workspace.customTag.cancel")}
              </button>
            </div>
          </div>
        )}

        {/* Duration */}
        <p className={styles.popupLabel}>{get("home.howItWorks.popup.duration")}</p>
        <div className={styles.durationGrid}>
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              className={`${styles.durationBtn} ${selectedDuration === d.value ? styles.durationActive : ""}`}
              onClick={() => { setSelectedDuration(d.value); saveLastDuration(d.value); }}
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
  const { shortForRuFull: DAY_SHORT } = useLocalizedWeekdays();
  const { translateName } = useLocalizedTags();
  const key = `${day}-${time}`;
  const info = scheduleMap.get(key);

  if (info && info.type !== "empty") {
    const isStart = info.type === "start";
    const { isLast } = info;
    const c = info.course?.color ?? "var(--color-primary-solid, #4ade80)";
    const bg =
      info.course?.bg ??
      "color-mix(in srgb, var(--color-primary-solid, #4ade80) 12%, transparent)";
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
    const rawName = info.course?.name ?? info.entry?.course ?? "";
    const displayName = translateName(rawName);
    return (
      <td
        className={`${className} ${styles.cellBooked}`}
        style={cellStyle}
        data-print="booked"
        onClick={(e) => onCellClick(day, time, e)}
      >
        {isStart && (
          <span className={styles.courseName} data-print="course">
            {showEmoji &&
              info.course &&
              typeof info.course.icon === "string" && (
                <span
                  className={styles.courseIconCell}
                  data-print="course-icon"
                >
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
  timeSlots,
}: {
  scheduleMap: Map<string, CellInfo>;
  onCellClick: (day: string, time: string, e: React.MouseEvent) => void;
  showEmoji: boolean;
  timeSlots: string[];
}) {
  const { shortForRuFull: DAY_SHORT, fullForRuFull: DAY_FULL } =
    useLocalizedWeekdays();
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.timeHeader} />
          {DAYS.map((day) => (
            <th key={day} className={styles.dayHeader}>
              <span className={styles.dayFull} data-print="day-full">
                {DAY_FULL[day]}
              </span>
              <span className={styles.dayShort} data-print="day-short">
                {DAY_SHORT[day]}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {timeSlots.map((time) => (
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
  timeSlots,
}: {
  scheduleMap: Map<string, CellInfo>;
  onCellClick: (day: string, time: string, e: React.MouseEvent) => void;
  showEmoji: boolean;
  timeSlots: string[];
}) {
  const { shortForRuFull: DAY_SHORT, fullForRuFull: DAY_FULL } =
    useLocalizedWeekdays();
  return (
    <table className={`${styles.table} ${styles.tableHorizontal}`}>
      <thead>
        <tr>
          <th className={styles.timeHeader} />
          {DAYS.map((day) => (
            <th key={day} className={styles.dayHeader}>
              <span className={styles.dayFull} data-print="day-full">
                {DAY_FULL[day]}
              </span>
              <span className={styles.dayShort} data-print="day-short">
                {DAY_SHORT[day]}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {timeSlots.map((time) => (
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
