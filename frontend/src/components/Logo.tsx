import { useCopy } from "../hooks/useCopy";
import styles from "./Logo.module.css";

interface LogoProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
  variant?: "dark" | "light";
}

export default function Logo({ size = "medium", showText = true, variant = "dark" }: LogoProps) {
  const { get } = useCopy();

  const iconSizes = {
    small: 28,
    medium: 36,
    large: 44,
  };

  const fontSizes = {
    small: 16,
    medium: 20,
    large: 24,
  };

  return (
    <div className={styles.logo}>
      <img
        src="/Logo_green_bg.svg"
        alt="QalamFlow"
        className={styles.logoIcon}
        style={{ width: iconSizes[size], height: iconSizes[size] }}
      />
      {showText && (
        <span className={`${styles.logoText} ${variant === "light" ? styles.logoTextLight : ""}`}>
          {get("app.name")}
        </span>
      )}
    </div>
  );
}
