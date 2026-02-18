import { Link } from "react-router-dom";
import styles from "./CTAButton.module.css";

interface CTAButtonProps {
  children: React.ReactNode;
  to?: string;
  onClick?: () => void;
  className?: string;
}

export default function CTAButton({ children, to, onClick, className }: CTAButtonProps) {
  const btnClass = `${styles.ctaButton} ${className ?? ""}`;

  if (to) {
    return (
      <div className={styles.ctaContainer}>
        <Link to={to} className={btnClass}>
          {children}
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.ctaContainer}>
      <button className={btnClass} onClick={onClick}>
        {children}
      </button>
    </div>
  );
}
