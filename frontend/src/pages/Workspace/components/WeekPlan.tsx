import { useRef, useState, useMemo } from "react";
import { Printer, Save, Search } from "lucide-react";
import type { ScheduleEntry } from "../types";
import styles from "./WeekPlan.module.css";

/* ===== Constants ===== */

const DAYS = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

const DAY_SHORT: Record<string, string> = {
  Понедельник: "Пн",
  Вторник: "Вт",
  Среда: "Ср",
  Четверг: "Чт",
  Пятница: "Пт",
  Суббота: "Сб",
  Воскресенье: "Вс",
};

const COURSES = [
  {
    name: "Медицинский курс",
    color: "#E0592A",
    bg: "rgba(224,89,42,0.12)",
    icon: false,
  },
  {
    name: "Мединский курс 1",
    color: "#7B2FC9",
    bg: "rgba(123,47,201,0.12)",
    icon: "/MK1.png",
  },
  {
    name: "Мединский курс 2",
    color: "#2E8B57",
    bg: "rgba(46,139,87,0.12)",
    icon: "/MK2.png",
  },
  {
    name: "Мединский курс 3",
    color: "#4A9BD9",
    bg: "rgba(74,155,217,0.12)",
    icon: "/MK3.png",
  },
  {
    name: "Мединский курс 4",
    color: "#C93545",
    bg: "rgba(201,53,69,0.12)",
    icon: "/MK4.png",
  },
  {
    name: "Бейна Ядейк",
    color: "#D46ABF",
    bg: "rgba(212,106,191,0.12)",
    icon: false,
  },
  {
    name: "Бейна Ядейк 1",
    color: "#D4940A",
    bg: "rgba(212,148,10,0.12)",
    icon: "/BY1.png",
  },
  {
    name: "Бейна Ядейк 2",
    color: "#0D7C50",
    bg: "rgba(13,124,80,0.12)",
    icon: "/BY2.png",
  },
  {
    name: "Бейна Ядейк 3",
    color: "#1E7FE0",
    bg: "rgba(30,127,224,0.12)",
    icon: "/BY3.png",
  },
  {
    name: "Бейна Ядейк 4",
    color: "#9B1B4A",
    bg: "rgba(155,27,74,0.12)",
    icon: "/BY4.png",
  },
  {
    name: "Коран",
    color: "#1B6E3A",
    bg: "rgba(27,110,58,0.12)",
    icon: "/quran.png",
  },
  {
    name: "Аджрумийя",
    color: "#A68B2C",
    bg: "rgba(166,139,44,0.12)",
    icon: "/ajrumiyah.png",
  },
  {
    name: "Катру ан-Нада",
    color: "#3566C0",
    bg: "rgba(53,102,192,0.12)",
    icon: false,
  },
  {
    name: "Альфия ибн Малика",
    color: "#7045C9",
    bg: "rgba(112,69,201,0.12)",
    icon: false,
  },
  {
    name: "Арабский",
    color: "#48B07A",
    bg: "rgba(72,176,122,0.12)",
    icon: "/arabic.png",
  },
  {
    name: "Таджвид",
    color: "#8A7D55",
    bg: "rgba(138,125,85,0.12)",
    icon: "/voice.png",
  },
  {
    name: "Сарф",
    color: "#C2185B",
    bg: "rgba(194,24,91,0.12)",
    icon: "/sarf.png",
  },
  {
    name: "Нахву",
    color: "#4652B1",
    bg: "rgba(70,82,177,0.12)",
    icon: "/nahwu.png",
  },
  {
    name: "Муроджиа",
    color: "#238A72",
    bg: "rgba(35,138,114,0.12)",
    icon: false,
  },
  { name: "Хифз", color: "#4F5EC0", bg: "rgba(79,94,192,0.12)", icon: false },
  {
    name: "Сира",
    color: "#6B4E2A",
    bg: "rgba(107,78,42,0.12)",
    icon: "/Sira.png",
  },
  {
    name: "Кысас ан-Набиййин лиль-Атфаль",
    color: "#D17B30",
    bg: "rgba(209,123,48,0.12)",
    icon: false,
  },
  {
    name: "Аль-Кыраа ар-Рашида",
    color: "#5A9E3C",
    bg: "rgba(90,158,60,0.12)",
    icon: false,
  },
  {
    name: "40 хадисов ан-Навави",
    color: "#8C3D8B",
    bg: "rgba(140,61,139,0.12)",
    icon: false,
  },
  {
    name: "Муаллим сани",
    color: "#2CA5A5",
    bg: "rgba(44,165,165,0.12)",
    icon: false,
  },
  {
    name: "Хатм Корана",
    color: "#1A5C3E",
    bg: "rgba(26,92,62,0.12)",
    icon: false,
  },
  {
    name: "Английский язык",
    color: "#2868A9",
    bg: "rgba(40,104,169,0.12)",
    icon: "/english.png",
  },
];

const FEATURED = new Set([
  "Медицинский курс",
  "Бейна Ядейк",
  "Коран",
  "Таджвид",
  "Хифз",
  "Сарф",
  "Сира",
  "Аджрумийя",
  "Аль-Кыраа ар-Рашида",
]);

function isFeatured(name: string): boolean {
  return FEATURED.has(name);
}

const DURATIONS = [
  { label: "30 минут", value: 30 },
  { label: "1 час", value: 60 },
  { label: "1.5 часа", value: 90 },
  { label: "2 часа", value: 120 },
  { label: "2.5 часа", value: 150 },
  { label: "3 часа", value: 180 },
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
  const [popup, setPopup] = useState<{ day: string; time: string } | null>(
    null,
  );
  const [showEmoji, setShowEmoji] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);

  const scheduleMap = buildScheduleMap(schedule);

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

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "-9999px";
    iframe.style.width = "0";
    iframe.style.height = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Недельный план</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  ${pageSize}
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body { font-family: "Montserrat", system-ui, sans-serif; }
  table { width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; border: 1px solid #ccc; border-radius: 12px; overflow: hidden; }
  th, td { border-top: 1px solid #ccc; border-right: 1px solid #ccc; padding: ${isHorizontal ? "3px 4px" : "5px 6px"}; font-size: ${isHorizontal ? "9px" : "10px"}; text-align: center; height: ${isHorizontal ? "20px" : "29px"}; }
  th:last-child, td:last-child { border-right: none; }
  tr:first-child th { border-top: none; }
  th { background: #f0f0f5 !important; font-weight: 600; color: #303030; border-bottom: 1px solid #3234ae; font-size: 11px; }
  td:first-child { text-align: left; font-weight: 500; color: #303030; width: ${isHorizontal ? "60px" : "60px"}; }
  th:first-child { text-align: left; font-weight: 600; color: #303030; width: ${isHorizontal ? "60px" : "60px"}; }
  [data-print="day-full"] { display: inline !important; }
  [data-print="day-short"] { display: none !important; }
  [data-print="label"] { font-size: 8px; color: #bbb; }
  [data-print="course"] { font-size: 9px; font-weight: 600; display: flex; align-items: center; gap: 2px; }
  [data-print="course-icon"] { width: 21px; height: 21px; flex-shrink: 0; }
  [data-print="booked"] { position: relative; z-index: 1; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
</style>
</head><body>${el.innerHTML}</body></html>`);
    doc.close();

    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    setTimeout(() => document.body.removeChild(iframe), 1000);
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
            <span>Вертикальный</span>
          </button>
          <button
            className={`${styles.toggleBtn} ${orientation === "horizontal" ? styles.toggleActive : ""}`}
            onClick={() => onOrientationChange("horizontal")}
          >
            <img src="/horizontal.svg" alt="" className={styles.toggleIcon} />
            <span>Горизонтальный</span>
          </button>
        </div>
        {/* Emoji toggle */}
        <button
          className={`${styles.emojiSwitch} ${showEmoji ? styles.emojiOn : styles.emojiOff}`}
          onClick={() => setShowEmoji((v) => !v)}
          aria-label="Добавить эмоджи"
        >
          <span className={styles.emojiThumb}>{showEmoji ? "😊" : "🌒"}</span>
        </button>

        <button className={styles.saveBtn} onClick={onSave} disabled={!canSave}>
          <Save size={18} />
          Сохранить план
        </button>
        <button className={styles.printBtn} onClick={handlePrint}>
          <Printer size={18} />
          Распечатать PDF
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
          day={popup.day}
          time={popup.time}
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
  day,
  time,
  onAdd,
  onClose,
  showEmoji,
}: {
  day: string;
  time: string;
  onAdd: (course: string, duration: number) => void;
  onClose: () => void;
  showEmoji: boolean;
}) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const visibleCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length >= 2) return COURSES.filter((c) => c.name.toLowerCase().includes(q));
    return COURSES.filter((c) => isFeatured(c.name));
  }, [search]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.popupHeader}>
          <span>Добавить курс</span>
          <button className={styles.popupClose} onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Courses */}
        <p className={styles.popupLabel}>🎓 Выберите курс</p>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Не нашли курс? Введите название…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.courseGrid}>
          {visibleCourses.map((c) => (
            <button
              key={c.name}
              className={`${styles.courseTag} ${selectedCourse === c.name ? styles.courseTagActive : ""}`}
              style={
                selectedCourse === c.name
                  ? { background: c.bg, borderColor: c.color, color: c.color }
                  : { background: c.bg, borderColor: c.bg, color: c.color }
              }
              onClick={() => setSelectedCourse(c.name)}
            >
              {showEmoji && typeof c.icon === "string" && (
                <img src={c.icon} alt="" className={styles.courseIcon} />
              )}
              {c.name}
            </button>
          ))}
          {visibleCourses.length === 0 && (
            <p className={styles.searchEmpty}>Ничего не найдено</p>
          )}
        </div>

        {/* Duration */}
        <p className={styles.popupLabel}>🕰️ Длительность</p>
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
          Добавить в расписание
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
    const stripe = `${c}10`;
    const shadows = [`-1px 0 0 ${c}`, ...(isLast ? [`0 1px 0 ${c}`] : [])];
    const cellStyle: React.CSSProperties = {
      backgroundColor: info.course.bg,
      backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 4px, ${stripe} 4px, ${stripe} 7px)`,
      zIndex: info.order + 1,
      boxShadow: shadows.join(", "),
      ...(isStart && { borderTopColor: c }),
      borderRightColor: c,
    };
    return (
      <td
        className={`${className} ${styles.cellBooked}`}
        style={cellStyle}
        data-print="booked"
        onClick={() => onCellClick(day, time)}
      >
        {isStart && (
          <span
            className={styles.courseName}
            style={{ color: info.course.color }}
            data-print="course"
          >
            {showEmoji && typeof info.course.icon === "string" && (
              <img
                src={info.course.icon}
                alt=""
                className={styles.courseIconCell}
                data-print="course-icon"
              />
            )}
            {info.course.name}
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
          <th className={styles.timeHeader}>Время</th>
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
          <th className={styles.timeHeader}>Время</th>
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
