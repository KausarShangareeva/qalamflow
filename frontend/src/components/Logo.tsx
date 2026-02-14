import { useCopy } from "../hooks/useCopy";
import styles from "./Logo.module.css";

interface LogoProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
}

export default function Logo({ size = "medium", showText = true }: LogoProps) {
  const { get } = useCopy();

  const iconSizes = {
    small: 32,
    medium: 40,
    large: 48,
  };

  const fontSizes = {
    small: 16,
    medium: 20,
    large: 24,
  };

  return (
    <div className={styles.logo}>
      <div
        className={styles.logoIcon}
        style={{
          width: iconSizes[size],
          height: iconSizes[size],
          fontSize: fontSizes[size]
        }}
      >
        Q
      </div>
      {showText && <span className={styles.logoText}>{get("app.name")}</span>}
    </div>
  );
}
