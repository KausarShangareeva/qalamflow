import { useTranslation } from "react-i18next";

type ReplacementValues = Record<string, string | number>;

/**
 * Same API as the previous useCopy() — but now reads from i18next so callers
 * automatically re-render when the active language changes. The translations
 * live in src/data/{ru,en}/*.json and are loaded by src/i18n/index.ts.
 */
export function useCopy() {
  const { t, i18n } = useTranslation();

  const get = (path: string, values?: ReplacementValues): string => {
    const result = t(path, { ...(values ?? {}), defaultValue: path });
    return typeof result === "string" ? result : path;
  };

  const getArray = <T = unknown>(path: string): T[] => {
    const result = t(path, { returnObjects: true, defaultValue: [] });
    if (!Array.isArray(result)) {
      console.warn(`Copy path does not point to an array: ${path}`);
      return [];
    }
    return result as T[];
  };

  const getRandomMotivation = (): string => {
    const list = getArray<string>("dashboard.motivations");
    if (!list.length) return "";
    return list[Math.floor(Math.random() * list.length)];
  };

  return {
    get,
    getArray,
    getRandomMotivation,
    // Back-compat: a snapshot of the current language's resource bundle.
    // Callers that destructure `copy` get the same nested object shape as
    // before. Prefer `get(path)` in new code so re-renders happen on language
    // switch.
    copy: i18n.getResourceBundle(i18n.language, "translation") as Record<
      string,
      unknown
    >,
  };
}
