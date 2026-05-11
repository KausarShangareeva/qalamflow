import { useTranslation } from "react-i18next";
import ruTags from "../data/ru/tags.json";
import enTags from "../data/en/tags.json";

export type Tag = {
  name: string;
  color: string;
  bg: string;
  icon: string;
  benefit: string;
};

const TAG_BUNDLES: Record<string, Tag[]> = {
  ru: ruTags as Tag[],
  en: enTags as Tag[],
};

/**
 * Returns the tag list for the active language. RU is the canonical source
 * (saved plans store RU names as IDs); EN mirrors it by index. For lookups by
 * stored name, keep importing data/ru/tags.json directly — this hook is for
 * display-side components that should react to language changes.
 */
export function useLocalizedTags() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] ?? "ru";
  const tags = TAG_BUNDLES[lang] ?? TAG_BUNDLES.ru;

  const indexForRuName = (ruName: string): number =>
    ruTags.findIndex((t) => t.name === ruName);

  const translateName = (ruName: string): string => {
    if (lang === "ru") return ruName;
    const idx = indexForRuName(ruName);
    if (idx === -1) return ruName;
    return tags[idx]?.name ?? ruName;
  };

  // Resolves the localized `benefit` for a given canonical RU tag name.
  const benefitForName = (ruName: string): string => {
    const idx = indexForRuName(ruName);
    if (idx === -1) return "";
    return tags[idx]?.benefit ?? ruTags[idx].benefit;
  };

  return { tags, translateName, benefitForName, lang };
}
