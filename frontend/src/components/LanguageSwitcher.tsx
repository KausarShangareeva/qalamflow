import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import styles from "./LanguageSwitcher.module.css";

const LANGUAGES = [
  { code: "ru", short: "RU", flag: "🇷🇺" },
  { code: "en", short: "EN", flag: "🇬🇧" },
] as const;

type Variant = "desktop" | "mobile";

interface Props {
  variant?: Variant;
}

export default function LanguageSwitcher({ variant = "desktop" }: Props) {
  const { i18n, t } = useTranslation();

  const activeCode = (i18n.language?.split("-")[0] ?? "ru") as
    | (typeof LANGUAGES)[number]["code"]
    | string;
  const activeIdx = Math.max(
    0,
    LANGUAGES.findIndex((l) => l.code === activeCode),
  );
  const nextLang = LANGUAGES[(activeIdx + 1) % LANGUAGES.length];

  const toggle = () => i18n.changeLanguage(nextLang.code);

  if (variant === "mobile") {
    return (
      <button
        type="button"
        onClick={toggle}
        className={styles.mobileToggle}
        aria-label={`Switch to ${nextLang.short}`}
      >
        <span className={styles.mobileLabel}>
          <Globe size={18} />
          {t("navigation.language", { defaultValue: "Language" })}
        </span>
        <span className={styles.mobileBadge}>
          {LANGUAGES[activeIdx].flag} {LANGUAGES[activeIdx].short}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={styles.trigger}
      onClick={toggle}
      aria-label={`Switch to ${nextLang.short}`}
      title={`Switch to ${nextLang.short}`}
    >
      <Globe size={16} className={styles.triggerIcon} />
      <span className={styles.triggerLabel}>{LANGUAGES[activeIdx].short}</span>
    </button>
  );
}
