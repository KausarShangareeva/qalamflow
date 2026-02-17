import { useRef, useState } from "react";
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
  { name: "Медицинский Курс", color: "#9B2335", bg: "rgba(155,35,53,0.12)" },
  { name: "Бейна Ядейк", color: "#B07D2A", bg: "rgba(176,125,42,0.12)" },
  { name: "Аджрумийя", color: "#2D8A5E", bg: "rgba(45,138,94,0.12)" },
  { name: "Катру ан-Нада", color: "#3566C0", bg: "rgba(53,102,192,0.12)" },
  { name: "Альфия ибн Малика", color: "#7045C9", bg: "rgba(112,69,201,0.12)" },
  { name: "Коран", color: "#1A8A94", bg: "rgba(26,138,148,0.12)" },
  { name: "Таджвид", color: "#A94480", bg: "rgba(169,68,128,0.12)" },
  { name: "Тасхих", color: "#C0612E", bg: "rgba(192,97,46,0.12)" },
  { name: "Муроджиа", color: "#238A72", bg: "rgba(35,138,114,0.12)" },
  { name: "Хифз", color: "#4F5EC0", bg: "rgba(79,94,192,0.12)" },
];

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

interface ScheduleEntry {
  day: string;
  startTime: string;
  course: string;
  duration: number;
}

interface CellInfo {
  type: "start" | "continuation" | "empty";
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
  for (const entry of entries) {
    const course = COURSES.find((c) => c.name === entry.course);
    const slots = getTimeSlotsForEntry(entry.startTime, entry.duration);
    slots.forEach((time, i) => {
      const key = `${entry.day}-${time}`;
      map.set(key, {
        type: i === 0 ? "start" : "continuation",
        course,
        entry,
      });
    });
  }
  return map;
}

/* ===== Main component ===== */

export default function WeekPlan() {
  const [orientation, setOrientation] = useState<Orientation>("vertical");
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [popup, setPopup] = useState<{ day: string; time: string } | null>(
    null,
  );
  const tableRef = useRef<HTMLDivElement>(null);

  const scheduleMap = buildScheduleMap(schedule);

  function handleCellClick(day: string, time: string) {
    const key = `${day}-${time}`;
    const info = scheduleMap.get(key);
    if (info && info.type !== "empty") {
      // Remove existing entry
      setSchedule((prev) =>
        prev.filter(
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
    setSchedule((prev) => [
      ...prev,
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
  th, td { border-bottom: 1px solid #ccc; border-right: 1px solid #ccc; padding: ${isHorizontal ? "3px 4px" : "5px 6px"}; font-size: ${isHorizontal ? "9px" : "10px"}; text-align: center; height: ${isHorizontal ? "20px" : "29px"}; }
  th:last-child, td:last-child { border-right: none; }
  tr:last-child td { border-bottom: none; }
  th { background: #f0f0f5 !important; font-weight: 600; color: #303030; border-bottom: 1px solid #3234ae; font-size: 11px; }
  td:first-child { text-align: left; font-weight: 500; color: #303030; width: ${isHorizontal ? "60px" : "60px"}; }
  th:first-child { text-align: left; font-weight: 600; color: #303030; width: ${isHorizontal ? "60px" : "60px"}; }
  [data-print="label"] { font-size: 8px; color: #bbb; }
  [data-print="course"] { font-size: 9px; font-weight: 600; }
  [data-print="booked"] { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
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
      <div className={styles.toggle}>
        <button
          className={`${styles.toggleBtn} ${orientation === "vertical" ? styles.toggleActive : ""}`}
          onClick={() => setOrientation("vertical")}
        >
          A4 вертикальный
        </button>
        <button
          className={`${styles.toggleBtn} ${orientation === "horizontal" ? styles.toggleActive : ""}`}
          onClick={() => setOrientation("horizontal")}
        >
          A4 горизонтальный
        </button>
        <button className={styles.printBtn} onClick={handlePrint}>
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
          />
        ) : (
          <HorizontalTable
            scheduleMap={scheduleMap}
            onCellClick={handleCellClick}
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
}: {
  day: string;
  time: string;
  onAdd: (course: string, duration: number) => void;
  onClose: () => void;
}) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.popupHeader}>
          <span>
            {DAY_SHORT[day]}. {time}
          </span>
          <button className={styles.popupClose} onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Courses */}
        <p className={styles.popupLabel}>Выберите курс</p>
        <div className={styles.courseGrid}>
          {COURSES.map((c) => (
            <button
              key={c.name}
              className={`${styles.courseTag} ${selectedCourse === c.name ? styles.courseTagActive : ""}`}
              style={
                selectedCourse === c.name
                  ? { background: c.color, borderColor: c.color, color: "#fff" }
                  : { background: c.bg, borderColor: c.bg, color: c.color }
              }
              onClick={() => setSelectedCourse(c.name)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Duration */}
        <p className={styles.popupLabel}>Длительность</p>
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
}: {
  day: string;
  time: string;
  scheduleMap: Map<string, CellInfo>;
  onCellClick: (day: string, time: string) => void;
  className: string;
}) {
  const key = `${day}-${time}`;
  const info = scheduleMap.get(key);

  if (info && info.course) {
    const isStart = info.type === "start";
    const stripe = `${info.course.color}20`;
    return (
      <td
        className={`${className} ${styles.cellBooked}`}
        style={{
          backgroundColor: info.course.bg,
          backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 4px, ${stripe} 4px, ${stripe} 7px)`,
        }}
        data-print="booked"
        onClick={() => onCellClick(day, time)}
      >
        {isStart && (
          <span
            className={styles.courseName}
            style={{ color: info.course.color }}
            data-print="course"
          >
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
}: {
  scheduleMap: Map<string, CellInfo>;
  onCellClick: (day: string, time: string) => void;
}) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.timeHeader}>Время</th>
          {DAYS.map((day) => (
            <th key={day} className={styles.dayHeader}>
              <span className={styles.dayFull}>{day}</span>
              <span className={styles.dayShort}>{DAY_SHORT[day]}</span>
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
}: {
  scheduleMap: Map<string, CellInfo>;
  onCellClick: (day: string, time: string) => void;
}) {
  return (
    <table className={`${styles.table} ${styles.tableHorizontal}`}>
      <thead>
        <tr>
          <th className={styles.timeHeader}>Время</th>
          {DAYS.map((day) => (
            <th key={day} className={styles.dayHeader}>
              <span className={styles.dayFull}>{day}</span>
              <span className={styles.dayShort}>{DAY_SHORT[day]}</span>
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
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
