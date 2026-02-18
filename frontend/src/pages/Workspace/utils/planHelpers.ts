import type { ScheduleEntry } from "../types";

const COURSE_COLORS: Record<string, string> = {
  "Медицинский Курс": "#9B2335",
  "Бейна Ядейк": "#B07D2A",
  "Аджрумийя": "#2D8A5E",
  "Катру ан-Нада": "#3566C0",
  "Альфия ибн Малика": "#7045C9",
  "Коран": "#1A8A94",
  "Таджвид": "#A94480",
  "Тасхих": "#C0612E",
  "Муроджиа": "#238A72",
  "Хифз": "#4F5EC0",
  "Сира": "#6B4E2A",
};

const DAY_SHORT_RU: Record<string, string> = {
  Понедельник: "Пн",
  Вторник: "Вт",
  Среда: "Ср",
  Четверг: "Чт",
  Пятница: "Пт",
  Суббота: "Сб",
  Воскресенье: "Вс",
};

/** Pick the color of the most frequent course */
export function getDominantColor(schedule: ScheduleEntry[]): string {
  const freq: Record<string, number> = {};
  for (const entry of schedule) {
    freq[entry.course] = (freq[entry.course] || 0) + 1;
  }
  const topCourse = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
  return topCourse ? (COURSE_COLORS[topCourse] ?? "#6366f1") : "#6366f1";
}

/** Auto-generate a Russian title from the schedule courses */
export function generatePlanTitle(schedule: ScheduleEntry[]): string {
  const uniqueCourses = [...new Set(schedule.map((e) => e.course))];
  if (uniqueCourses.length === 0) return "Пустой план";
  if (uniqueCourses.length === 1)
    return `${uniqueCourses[0]} — недельный план`;
  if (uniqueCourses.length === 2)
    return `${uniqueCourses[0]} и ${uniqueCourses[1]} — недельный план`;
  const rest = uniqueCourses.length - 2;
  return `${uniqueCourses[0]}, ${uniqueCourses[1]} и ещё ${rest} — недельный план`;
}

/** Auto-generate a Russian description summarizing schedule contents */
export function generatePlanDescription(schedule: ScheduleEntry[]): string {
  const courseMap = new Map<string, string[]>();
  for (const entry of schedule) {
    const days = courseMap.get(entry.course) || [];
    const shortDay = DAY_SHORT_RU[entry.day] || entry.day;
    if (!days.includes(shortDay)) days.push(shortDay);
    courseMap.set(entry.course, days);
  }

  const parts: string[] = [];
  for (const [course, days] of courseMap) {
    parts.push(`${course} (${days.join(", ")})`);
  }

  const totalHours = schedule.reduce((sum, e) => sum + e.duration, 0) / 60;
  const totalFormatted =
    totalHours % 1 === 0 ? totalHours.toString() : totalHours.toFixed(1);

  return `${parts.join(". ")}. Всего ${totalFormatted} ч. в неделю.`;
}
