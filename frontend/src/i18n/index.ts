import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ruCommon from "../data/ru/common.json";
import ruHome from "../data/ru/home.json";
import ruWorkspace from "../data/ru/workspace.json";
import ruAuth from "../data/ru/auth.json";
import ruFeedback from "../data/ru/feedback.json";
import ruSuggestProject from "../data/ru/suggestProject.json";
import ruNotFound from "../data/ru/notFound.json";

import enCommon from "../data/en/common.json";
import enHome from "../data/en/home.json";
import enWorkspace from "../data/en/workspace.json";
import enAuth from "../data/en/auth.json";
import enFeedback from "../data/en/feedback.json";
import enSuggestProject from "../data/en/suggestProject.json";
import enNotFound from "../data/en/notFound.json";

// Single 'translation' namespace per language: per-page JSON files merged into
// one flat object. Keeps the existing `get("foo.bar")` dotted-path API working
// without changes in any caller.
function mergeNs(...sources: Record<string, unknown>[]) {
  return Object.assign({}, ...sources);
}

export const SUPPORTED_LANGUAGES = ["ru", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: {
        translation: mergeNs(
          ruCommon,
          ruHome,
          ruWorkspace,
          ruAuth,
          ruFeedback,
          ruSuggestProject,
          ruNotFound,
        ),
      },
      en: {
        translation: mergeNs(
          enCommon,
          enHome,
          enWorkspace,
          enAuth,
          enFeedback,
          enSuggestProject,
          enNotFound,
        ),
      },
    },
    fallbackLng: "ru",
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
      prefix: "{",
      suffix: "}",
    },
    returnObjects: true,
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "qalamflow_lang",
    },
  });

export default i18n;
