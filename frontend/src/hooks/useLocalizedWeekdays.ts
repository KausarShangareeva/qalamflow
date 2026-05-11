import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ruWeekdays from "../data/ru/weekdays.json";
import enWeekdays from "../data/en/weekdays.json";

type Weekdays = typeof ruWeekdays;

const BUNDLES: Record<string, Weekdays> = {
  ru: ruWeekdays,
  en: enWeekdays,
};

/**
 * Returns the weekdays/hours arrays for the active language. RU is the
 * canonical schema (stored schedule entries use RU `full` day names as keys),
 * so internal lookups should keep importing data/ru/weekdays.json directly.
 *
 * For display, resolve canonical RU labels to the active locale's labels:
 *   shortForRuFull("Понедельник") → "Mon" (en) | "Пн" (ru)
 *   fullForRuFull("Понедельник")  → "Monday" | "Понедельник"
 *   shortForRuShort("Пн")         → "Mon" | "Пн"
 */
export function useLocalizedWeekdays() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] ?? "ru";
  const weekdays = BUNDLES[lang] ?? BUNDLES.ru;

  const maps = useMemo(() => {
    const shortForRuFull: Record<string, string> = {};
    const fullForRuFull: Record<string, string> = {};
    const shortForRuShort: Record<string, string> = {};
    ruWeekdays.days.forEach((d, i) => {
      const localized = weekdays.days[i];
      shortForRuFull[d.full] = localized?.short ?? d.short;
      fullForRuFull[d.full] = localized?.full ?? d.full;
      shortForRuShort[d.short] = localized?.short ?? d.short;
    });
    return { shortForRuFull, fullForRuFull, shortForRuShort };
  }, [weekdays]);

  return { weekdays, ...maps, lang };
}
