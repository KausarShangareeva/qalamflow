import { Link } from "react-router-dom";
import { useCopy } from "../hooks/useCopy";
import Logo from "./Logo";
import {
  GithubIcon,
  LinkedinIcon,
  Sparkles,
  MessagesSquare,
  ClipboardList,
  GraduationCap,
  Heart,
  Users,
  BookMarked,
  Baby,
  Lightbulb,
  Key,
  Shirt,
  Library,
} from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
  const { get } = useCopy();

  return (
    <footer className={styles.footer}>
      {/* Main columns */}
      <div className={styles.main}>
        <div className={styles.brand}>
          <Logo size="medium" />
          <p className={styles.tagline}>{get("app.tagline")}</p>

          <a
            href="https://t.me/student_writes_code"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.authorCard}
          >
            <div className={styles.avatarWrapper}>
              <img
                src="/avatar.png"
                alt="Kausar"
                className={styles.authorAvatar}
              />
              <img
                src="/telegram.svg"
                alt="Telegram"
                className={styles.avatarBadge}
              />
            </div>
            <div className={styles.authorInfo}>
              <span className={styles.authorName}>
                {get("navigation.telegramChannel")}
              </span>
              <span className={styles.authorEmail}>
                {get("footer.telegram")}
              </span>
            </div>
          </a>
        </div>

        <div className={styles.columns}>
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>{get("footer.connect")}</h4>
            <nav className={styles.links}>
              <a
                href="https://t.me/kausar_code"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/avatar_logo.png"
                  alt=""
                  className={styles.linkAvatar}
                />
                {get("footer.messageAuthor")}
              </a>
              <Link to="/donate">
                <img
                  src="/buymeacoffee.png"
                  alt=""
                  className={styles.linkAvatar}
                />
                {get("footer.buyMeCoffee")}
              </Link>
              <Link to="/suggest-project">
                <Sparkles size={15} />
                {get("footer.suggestProject")}
              </Link>
              <Link to="/feedback">
                <MessagesSquare size={15} />
                {get("footer.feedback")}
              </Link>
              {/* <a
                href="https://github.com/KausarShangareeva/qalamflow"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubIcon size={15} />
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/kausar-shangareeva-312a8b27a"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedinIcon size={15} />
                LinkedIn
              </a> */}
            </nav>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>{get("footer.quickLinks")}</h4>
            <nav className={styles.links}>
              <a href="#hero">{get("footer.home")}</a>
              <a href="#features">{get("footer.features")}</a>
              <a href="#how-it-works">{get("footer.howItWorks")}</a>
              <a href="#envelope">{get("footer.envelope")}</a>
              <a href="#pdf-export">{get("footer.pdfExport")}</a>
            </nav>
          </div>

          <div className={styles.column}>
            <div className={styles.projectsHeader}>
              <h4 className={styles.columnTitle}>
                Проекты в процессе <span className={styles.hourglass}>⏳</span>
              </h4>
              <span className={styles.soonBadge}>Скоро</span>
            </div>
            <nav className={`${styles.links} ${styles.projectsLinks}`}>
              <span className={styles.projectItem}>
                <ClipboardList size={15} style={{ color: "#22c55e" }} />
                <span className={styles.projectName}>DeenPlanner</span>
                <span className={styles.projectDesc}>
                  – чек-листы для студентов
                </span>
              </span>
              <span className={styles.projectItem}>
                <GraduationCap size={15} style={{ color: "#3b82f6" }} />
                <span className={styles.projectName}>UstazFlow</span>
                <span className={styles.projectDesc}>
                  – планнер преподавателя
                </span>
              </span>
              <span className={styles.projectItem}>
                <Heart size={15} style={{ color: "#f43f5e" }} />
                <span className={styles.projectName}>UmmaFlow</span>
                <span className={styles.projectDesc}>– планнер для мамы</span>
              </span>
              <span className={styles.projectItem}>
                <Users size={15} style={{ color: "#a855f7" }} />
                <span className={styles.projectName}>UsraFlow</span>
                <span className={styles.projectDesc}>– семейный планнер</span>
              </span>
              <span className={styles.projectItem}>
                <BookMarked size={15} style={{ color: "#14b8a6" }} />
                <span className={styles.projectName}>HifzFlow</span>
                <span className={styles.projectDesc}>
                  – трекер заучивания Корана
                </span>
              </span>
              <span className={styles.projectItem}>
                <Baby size={15} style={{ color: "#f59e0b" }} />
                <span className={styles.projectName}>LittleUmmah</span>
                <span className={styles.projectDesc}>– истории для детей</span>
              </span>
              <span className={styles.projectItem}>
                <Lightbulb size={15} style={{ color: "#f97316" }} />
                <span className={styles.projectName}>NoorRoom</span>
                <span className={styles.projectDesc}>
                  – комната в арабском стиле
                </span>
              </span>
              <span className={styles.projectItem}>
                <Key size={15} style={{ color: "#06b6d4" }} />
                <span className={styles.projectName}>Madrasa Key</span>
                <span className={styles.projectDesc}>– ГДЗ по арабскому</span>
              </span>
              <span className={styles.projectItem}>
                <Shirt size={15} style={{ color: "#6366f1" }} />
                <span className={styles.projectName}>HijabPlanner</span>
                <span className={styles.projectDesc}>
                  – планировщик гардероба
                </span>
              </span>
              <span className={styles.projectItem}>
                <Library size={15} style={{ color: "#84cc16" }} />
                <span className={styles.projectName}>ShelfMind</span>
                <span className={styles.projectDesc}>
                  – твоя домашняя библиотека
                </span>
              </span>
            </nav>
          </div>
        </div>
      </div>

      {/* Divider with centered logo */}
      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <img
          src="/Logo_green_bg.svg"
          alt="QalamFlow"
          className={styles.dividerIcon}
        />
        <span className={styles.dividerLine} />
      </div>

      <p className={styles.madeWith}>
        {get("footer.madeWithFull")}{" "}
        <a
          href="https://shanstudio.app/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.madeWithLink}
        >
          {get("footer.shanStudio")}
        </a>
      </p>
    </footer>
  );
}
