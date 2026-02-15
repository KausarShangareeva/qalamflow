import styles from "./SectionHeader.module.css";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  subtitleEn?: string;
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  subtitleEn,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`${styles.sectionHeader} ${className}`}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
    </div>
  );
}
