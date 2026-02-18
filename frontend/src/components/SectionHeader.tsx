import styles from "./SectionHeader.module.css";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  subtitleEn?: string;
  className?: string;
  titleWidth?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  className = "",
  titleWidth,
}: SectionHeaderProps) {
  return (
    <div className={`${styles.sectionHeader} ${className}`}>
      <h2
        className={styles.sectionTitle}
        style={titleWidth ? { "--title-width": titleWidth } as React.CSSProperties : undefined}
      >
        {title}
      </h2>
      {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
    </div>
  );
}
