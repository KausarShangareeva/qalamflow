import { Link } from "react-router-dom";
import { useCopy } from "../hooks/useCopy";
import { PenTool, MessageCircle } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
  const { get } = useCopy();

  return (
    <footer className={styles.footerWrapper}>
      <div className={styles.footerCard}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <div className={styles.footerBrand}>
              <PenTool size={28} />
              <h3>{get("app.name")}</h3>
            </div>
            <p className={styles.footerTagline}>{get("app.tagline")}</p>
          </div>

          <div className={styles.footerSection}>
            <h4>{get("footer.quickLinks")}</h4>
            <div className={styles.footerLinks}>
              <Link to="/books">{get("nav.books")}</Link>
              <Link to="/schedule">{get("nav.schedule")}</Link>
              <Link to="/roadmap">{get("nav.roadmap")}</Link>
            </div>
          </div>

          <div className={styles.footerSection}>
            <h4>{get("footer.connect")}</h4>
            <div className={styles.footerLinks}>
              <a href="https://t.me/kausarsh" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} />
                Telegram
              </a>
              <a href="https://github.com/KausarShangareeva/qalamflow" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>&copy; {new Date().getFullYear()} {get("app.copyright")}</span>
          <span>{get("footer.madeWithLove")}</span>
        </div>
      </div>
    </footer>
  );
}
