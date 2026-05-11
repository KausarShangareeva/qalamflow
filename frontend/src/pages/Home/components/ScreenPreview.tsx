import { useRef } from "react";
import { Save, Printer } from "lucide-react";
import { useCopy } from "../../../hooks/useCopy";
import { useLocalizedWeekdays } from "../../../hooks/useLocalizedWeekdays";
import WEEKDAYS from "../../../data/ru/weekdays.json";
import { t as demoTag } from "../../../utils/demoTags";
import TagIcon from "../../../components/TagIcon";
import styles from "./ScreenPreview.module.css";

const DAYS = WEEKDAYS.days.map((d) => d.short);

// Screen preview uses hourly slots (compact)
const TIMES = WEEKDAYS.hours
  .filter((h) => h.value >= 8 && h.value <= 16)
  .map((h) => h.full);

// Print uses 30-minute slots
const PRINT_TIMES: string[] = [];
for (let h = 8; h <= 21; h++) {
  PRINT_TIMES.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 16) PRINT_TIMES.push(`${String(h).padStart(2, "0")}:30`);
}

// Convert emoji char → Apple CDN image URL (same source as emoji-picker-react)
function emojiToAppleUrl(emoji: string): string {
  const codepoints = [...emoji]
    .map((c) => c.codePointAt(0)!)
    .filter((cp) => cp !== 0xfe0f) // strip variation selector
    .map((cp) => cp.toString(16).toLowerCase())
    .join("-");
  return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${codepoints}.png`;
}

// [день, начало, конец, название из tags.json]
const SCHEDULE_DEF: [string, number, number, string][] = [
  ["Пн",  9, 11,  "Таджвид"],
  ["Вт",  8, 10,  "Тафсир"],
  ["Ср", 11, 13,  "Акыда"],
  ["Чт",  9, 12,  "Хадисы"],
  ["Пт", 14, 16,  "Фикх"],
  ["Сб", 10, 12,  "Сира"],
  ["Вс", 13, 15,  "Тазкия"],
];

// Автогенерация 30-минутных слотов из SCHEDULE_DEF
const DEMO_SCHEDULE: Record<string, { name: string; color: string; bg: string; icon: string }> = {};
for (const [day, startH, endH, name] of SCHEDULE_DEF) {
  const tag = demoTag(name);
  const entry = tag
    ? { name: tag.label, color: tag.color, bg: tag.bg, icon: tag.icon }
    : { name, color: "#888", bg: "rgba(136,136,136,0.12)", icon: "📚" };
  for (let h = startH; h < endH; h++) {
    DEMO_SCHEDULE[`${day}-${String(h).padStart(2, "0")}:00`] = entry;
    DEMO_SCHEDULE[`${day}-${String(h).padStart(2, "0")}:30`] = entry;
  }
}

// Track which cells are "start" vs "continuation"
function isStart(day: string, time: string, times: string[]): boolean {
  const idx = times.indexOf(time);
  if (idx === 0) return true;
  const prevKey = `${day}-${times[idx - 1]}`;
  const curKey = `${day}-${time}`;
  return (
    !DEMO_SCHEDULE[prevKey] ||
    DEMO_SCHEDULE[prevKey].name !== DEMO_SCHEDULE[curKey]?.name
  );
}

function getSpan(day: string, time: string, times: string[]): number {
  const entry = DEMO_SCHEDULE[`${day}-${time}`];
  if (!entry) return 1;
  let span = 1;
  const idx = times.indexOf(time);
  for (let i = idx + 1; i < times.length; i++) {
    const nextEntry = DEMO_SCHEDULE[`${day}-${times[i]}`];
    if (nextEntry && nextEntry.name === entry.name) span++;
    else break;
  }
  return span;
}

export default function ScreenPreview() {
  const { get } = useCopy();
  const { shortForRuShort } = useLocalizedWeekdays();
  const tableRef = useRef<HTMLDivElement>(null);

  function buildPrintTable(): string {
    // Track which cells to skip (continuations of multi-row blocks)
    const skip = new Set<string>();
    for (const day of DAYS) {
      for (let i = 0; i < PRINT_TIMES.length; i++) {
        const key = `${day}-${PRINT_TIMES[i]}`;
        if (DEMO_SCHEDULE[key] && isStart(day, PRINT_TIMES[i], PRINT_TIMES)) {
          const span = getSpan(day, PRINT_TIMES[i], PRINT_TIMES);
          for (let j = 1; j < span; j++) {
            skip.add(`${day}-${PRINT_TIMES[i + j]}`);
          }
        }
      }
    }

    const header = `<tr><th></th>${DAYS.map((d) => `<th>${d}</th>`).join("")}</tr>`;
    const rows = PRINT_TIMES.map((time) => {
      const cells = DAYS.map((day) => {
        const key = `${day}-${time}`;
        if (skip.has(key)) return "";
        const entry = DEMO_SCHEDULE[key];
        if (entry && isStart(day, time, PRINT_TIMES)) {
          const span = getSpan(day, time, PRINT_TIMES);
          const bg = `repeating-linear-gradient(-45deg,transparent,transparent 4px,color-mix(in srgb,${entry.color} 10%,transparent) 4px,color-mix(in srgb,${entry.color} 10%,transparent) 7px),${entry.bg}`;
          const iconUrl = emojiToAppleUrl(entry.icon);
          return `<td rowspan="${span}" style="background:${bg};border-left:3px solid ${entry.color};vertical-align:top;padding:4px 5px 3px;"><span style="display:inline-flex;align-items:center;gap:3px;"><img src="${iconUrl}" style="width:12px;height:12px;flex-shrink:0;" /><span style="font-size:9px;font-weight:600;">${entry.name}</span></span></td>`;
        }
        return `<td></td>`;
      }).join("");
      return `<tr><td>${time}</td>${cells}</tr>`;
    }).join("");

    return `<table><thead>${header}</thead><tbody>${rows}</tbody></table>`;
  }

  function handlePrint() {
    // Resolve CSS custom properties (var(--tag-*)) used in DEMO_SCHEDULE colors
    const computedRoot = getComputedStyle(document.documentElement);
    const rawColors = Object.values(DEMO_SCHEDULE)
      .flatMap((e) => [e.color, e.bg])
      .join(" ");
    const varNames = [...new Set(rawColors.match(/--[^)]+/g) ?? [])];
    const cssVarsBlock = `:root { ${varNames.map((v) => `${v}: ${computedRoot.getPropertyValue(v).trim()};`).join(" ")} }`;

    const iframe = document.createElement("iframe");
    Object.assign(iframe.style, {
      position: "fixed",
      left: "-9999px",
      top: "-9999px",
      width: "0",
      height: "0",
    });

    iframe.addEventListener("load", function onLoad() {
      iframe.removeEventListener("load", onLoad);
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    });

    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(`<!DOCTYPE html><html><head>
<meta charset="utf-8"><title>Weekly Schedule</title>
<style>
  ${cssVarsBlock}
  @page { size: landscape; margin: 8mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  html { font-size: 10px; }
  body { font-family: system-ui, sans-serif; background: #fff; }
  table { width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; border: 1px solid #d1d5db; border-radius: 12px; overflow: hidden; }
  th, td { border-top: 1px solid #d1d5db; border-right: 1px solid #d1d5db; padding: 2px 4px; font-size: 9px; text-align: center; height: 30px; vertical-align: top; }
  th:last-child, td:last-child { border-right: none; }
  tr:first-child th { border-top: none; }
  th { background: #f3f0fb !important; font-weight: 500; color: #6949b2; border-bottom: 1px solid #d1d5db !important; font-size: 10px; text-align: center; vertical-align: middle; }
  td:first-child { text-align: center; vertical-align: middle; font-weight: 500; color: #6b7280; width: 48px; background: #f3f0fb !important; font-size: 8px; }
  span { font-size: 9px; font-weight: 600; color: #111; }
</style>
</head><body>${buildPrintTable()}</body></html>`);
    doc.close();
  }

  // Build a set of continuation cells to skip
  const skipCells = new Set<string>();
  for (const day of DAYS) {
    for (let i = 0; i < TIMES.length; i++) {
      const key = `${day}-${TIMES[i]}`;
      if (DEMO_SCHEDULE[key] && isStart(day, TIMES[i], TIMES)) {
        const span = getSpan(day, TIMES[i], TIMES);
        for (let j = 1; j < span; j++) {
          skipCells.add(`${day}-${TIMES[i + j]}`);
        }
      }
    }
  }

  return (
    <section id="screen-preview" className={styles.section}>
      <div className={styles.screen}>
        {/* Browser chrome */}
        <div className={styles.toolbar}>
          <div className={styles.dots}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
          <div className={styles.addressBar} />
        </div>

        {/* Action buttons */}
        <div className={styles.actionBar}>
          <button className={styles.saveBtn}>
            <Save size={18} />
            {get("pdfExport.savePlan")}
          </button>
          <button
            type="button"
            className={styles.printBtn}
            onClick={handlePrint}
          >
            <Printer size={18} />
            {get("pdfExport.printPDF")}
          </button>
          <div className={styles.hintGroup}>
            <span className={styles.actionHint}>
              {get("pdfExport.hint")} <br />
              {get("pdfExport.hintSuffix")}
            </span>
            <svg
              className={styles.hintArrow}
              width="60"
              height="50"
              viewBox="0 0 60 50"
              fill="none"
            >
              <path
                d="M10 4 C20 4, 40 8, 46 24 C52 40, 54 44, 56 48"
                stroke="var(--color-text-muted)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="6 4"
                fill="none"
              />
              <path
                d="M58 40 L56 48 L48 46"
                stroke="var(--color-text-muted)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* Schedule table */}
        <div className={styles.content} ref={tableRef}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.timeHeader} />
                {DAYS.map((day) => (
                  <th key={day} className={styles.dayHeader}>
                    {shortForRuShort[day] ?? day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMES.map((time) => (
                <tr key={time}>
                  <td className={styles.timeCell}>{time}</td>
                  {DAYS.map((day) => {
                    const key = `${day}-${time}`;
                    if (skipCells.has(key)) return null;
                    const entry = DEMO_SCHEDULE[key];
                    if (entry && isStart(day, time, TIMES)) {
                      const span = getSpan(day, time, TIMES);
                      return (
                        <td
                          key={key}
                          rowSpan={span}
                          className={styles.bookedCell}
                          style={{
                            background: `repeating-linear-gradient(-45deg, transparent, transparent 4px, color-mix(in srgb, ${entry.color} 10%, transparent) 4px, color-mix(in srgb, ${entry.color} 10%, transparent) 7px), ${entry.bg}`,
                            borderLeft: `3px solid ${entry.color}`,
                          }}
                        >
                          <span className={styles.courseContent}>
                            <span className={styles.courseIcon}>
                              <TagIcon icon={entry.icon} size={12} />
                            </span>
                            <span className={styles.courseName}>
                              {entry.name}
                            </span>
                          </span>
                        </td>
                      );
                    }
                    return <td key={key} className={styles.emptyCell} />;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
