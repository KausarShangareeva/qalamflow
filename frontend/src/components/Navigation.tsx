import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useCopy } from "../hooks/useCopy";
import Logo from "./Logo";
import {
  LogOut,
  Sun,
  Moon,
  ArrowUpRight,
  Send,
  Copy,
  Menu,
  X,
  Home,
  LayoutDashboard,
  BookOpen,
  Zap,
  Printer,
  Coins,
  Sparkles,
  Pencil,
} from "lucide-react";
import styles from "./Navigation.module.css";

const SPARKLES = [
  { top: "18%",  left: "6%",    delay: "0s",    size: "0.65rem" },
  { top: "62%",  left: "14%",   delay: "1.4s",  size: "0.5rem"  },
  { top: "20%",  left: "28%",   delay: "0.7s",  size: "0.55rem" },
  { top: "72%",  left: "40%",   delay: "2.2s",  size: "0.45rem" },
  { top: "15%",  left: "55%",   delay: "1.0s",  size: "0.6rem"  },
  { top: "70%",  left: "65%",   delay: "1.8s",  size: "0.5rem"  },
  { top: "18%",  left: "80%",   delay: "0.3s",  size: "0.65rem" },
  { top: "65%",  left: "90%",   delay: "2.5s",  size: "0.45rem" },
  { top: "-22%", left: "25%",   delay: "1.2s",  size: "0.45rem" },
  { top: "110%", left: "60%",   delay: "0.6s",  size: "0.4rem"  },
  { top: "40%",  left: "-10%",  delay: "1.9s",  size: "0.4rem"  },
  { top: "30%",  left: "108%",  delay: "0.9s",  size: "0.45rem" },
];

function DonateSparkles() {
  return (
    <>
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={styles.donateSparkle}
          style={{ top: s.top, left: s.left, animationDelay: s.delay, fontSize: s.size }}
        >
          ✦
        </span>
      ))}
    </>
  );
}

function AuthorCard() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText("kausyarsh@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.authorCard}>
      <div className={styles.authorBody}>
        <div className={styles.authorTop}>
          <img src="/avatar_logo.png" alt="" className={styles.authorAvatar} />
          <div className={styles.authorMeta}>
            <span className={styles.authorName}>Kausar S.</span>
            <span className={styles.authorRole}>Дизайнер + Программист</span>
          </div>
        </div>
        <div className={styles.authorActions}>
          <a
            href="https://t.me/kausar_code"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.authorBtn}
          >
            <Send size={14} />
            Написать в ТГ
          </a>
          <button className={styles.authorBtn} onClick={handleCopyEmail}>
            <Copy size={14} />
            {copied ? "Почта скопирована!" : "Скопировать почту"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Navigation() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { get } = useCopy();
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const closeMenu = () => setMenuOpen(false);

  const scrollToSection = (sectionId: string) => {
    closeMenu();
    if (location.pathname === "/") {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {/* Left: Logo */}
          <Link to={user ? "/workspace" : "/"} className={styles.logoLink}>
            <Logo size="medium" />
          </Link>

          {/* Center: Nav links */}
          <nav className={styles.nav}>
            <div className={styles.links}>
              {user ? (
                <>
                  <Link to="/" className={styles.navLink}>
                    {get("navigation.home")}
                  </Link>
                  <Link to="workspace" className={styles.navLink}>
                    {get("navigation.myStudyPlan")}
                  </Link>
                  <div className={styles.dropdownWrapper}>
                    <button className={styles.contactLink}>
                      <span className={styles.onlineIndicator} />
                      {get("nav.contact")}
                    </button>
                    <div className={styles.dropdown}>
                      <AuthorCard />
                      <Link to="/donate" className={`${styles.dropdownItem} ${styles.donateItem}`}>
                        <DonateSparkles />
                        <Coins size={16} className={styles.dropdownIcon} />
                        {get("navigation.buyMeCoffee")}
                      </Link>
                      <Link
                        to="/suggest-project"
                        className={styles.dropdownItem}
                      >
                        <Sparkles size={16} className={styles.dropdownIcon} />
                        {get("navigation.suggestProject")}
                      </Link>
                      <Link to="/feedback" className={styles.dropdownItem}>
                        <Pencil size={16} className={styles.dropdownIcon} />
                        {get("navigation.feedback")}
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <button
                    className={styles.navLink}
                    onClick={() => scrollToSection("hero")}
                  >
                    {get("navigation.home")}
                  </button>
                  <button
                    className={styles.navLink}
                    onClick={() => scrollToSection("features")}
                  >
                    {get("footer.features")}
                  </button>
                  <button
                    className={styles.navLink}
                    onClick={() => scrollToSection("how-it-works")}
                  >
                    {get("footer.howItWorks")}
                  </button>
                  <button
                    className={styles.navLink}
                    onClick={() => scrollToSection("pdf-export")}
                  >
                    {get("footer.pdfExport")}
                  </button>
                  <div className={styles.dropdownWrapper}>
                    <button className={styles.contactLink}>
                      <span className={styles.onlineIndicator} />
                      {get("nav.contact")}
                    </button>
                    <div className={styles.dropdown}>
                      <AuthorCard />
                      <Link to="/donate" className={`${styles.dropdownItem} ${styles.donateItem}`}>
                        <DonateSparkles />
                        <Coins size={16} className={styles.dropdownIcon} />
                        {get("navigation.buyMeCoffee")}
                      </Link>
                      <Link
                        to="/suggest-project"
                        className={styles.dropdownItem}
                      >
                        <Sparkles size={16} className={styles.dropdownIcon} />
                        {get("navigation.suggestProject")}
                      </Link>
                      <Link to="/feedback" className={styles.dropdownItem}>
                        <Pencil size={16} className={styles.dropdownIcon} />
                        {get("navigation.feedback")}
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Right: CTA + Theme + Burger */}
          <div className={styles.rightActions}>
            {user ? (
              <>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  {get("navigation.logout")}
                  <LogOut size={18} />
                </button>
                <span className={styles.divider} />
              </>
            ) : (
              <>
                <Link to="/login" className={styles.contactBtn}>
                  {localStorage.getItem("hasAccount")
                    ? get("navigation.logIn")
                    : get("navigation.getStarted")}
                  <ArrowUpRight size={16} />
                </Link>
              </>
            )}

            <button
              onClick={toggleTheme}
              className={styles.themeBtn}
              title={theme === "dark" ? "Light theme" : "Dark theme"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              className={styles.burgerBtn}
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-out menu */}
      <div
        className={`${styles.mobileOverlay} ${menuOpen ? styles.mobileOverlayOpen : ""}`}
        onClick={closeMenu}
      />
      <div
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}
      >
        <div className={styles.mobileMenuHeader}>
          <Logo size="medium" showText={true} />
          <button
            className={styles.mobileCloseBtn}
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {user ? (
          <>
            <Link to="/" className={styles.mobileNavLink} onClick={closeMenu}>
              <Home size={18} />
              {get("navigation.home")}
            </Link>
            <Link
              to="/workspace"
              className={styles.mobileNavLink}
              onClick={closeMenu}
            >
              <LayoutDashboard size={18} />
              {get("navigation.myStudyPlan")}
            </Link>

            <div className={styles.mobileDivider} />

            <a
              href="https://t.me/kausar_code"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileNavLink}
            >
              <img src="/avatar_logo.png" alt="" className={styles.navAvatar} />
              {get("navigation.messageAuthor")}
            </a>
            <Link
              to="/donate"
              className={`${styles.mobileNavLink} ${styles.donateItem}`}
              onClick={closeMenu}
            >
              <DonateSparkles />
              <Coins size={16} className={styles.dropdownIcon} />
              {get("navigation.buyMeCoffee")}
            </Link>
            <Link
              to="/suggest-project"
              className={styles.mobileNavLink}
              onClick={closeMenu}
            >
              <Sparkles size={16} className={styles.dropdownIcon} />
              {get("navigation.suggestProject")}
            </Link>
            <Link
              to="/feedback"
              className={styles.mobileNavLink}
              onClick={closeMenu}
            >
              <Pencil size={16} className={styles.dropdownIcon} />
              {get("navigation.feedback")}
            </Link>

            <div className={styles.mobileDivider} />

            <button
              className={styles.mobileNavLink}
              onClick={toggleTheme}
              style={{ cursor: "pointer" }}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              {theme === "dark"
                ? get("navigation.lightTheme")
                : get("navigation.darkTheme")}
            </button>

            <button
              className={styles.mobileLogoutBtn}
              onClick={() => {
                handleLogout();
                closeMenu();
              }}
            >
              <LogOut size={18} />
              {get("navigation.logout")}
            </button>
          </>
        ) : (
          <>
            <button
              className={styles.mobileNavLink}
              onClick={() => scrollToSection("hero")}
            >
              <Home size={18} />
              {get("navigation.home")}
            </button>
            <button
              className={styles.mobileNavLink}
              onClick={() => scrollToSection("features")}
            >
              <Zap size={18} />
              {get("navigation.features")}
            </button>
            <button
              className={styles.mobileNavLink}
              onClick={() => scrollToSection("how-it-works")}
            >
              <BookOpen size={18} />
              {get("navigation.howItWorks")}
            </button>
            <button
              className={styles.mobileNavLink}
              onClick={() => scrollToSection("pdf-export")}
            >
              <Printer size={18} />
              {get("navigation.pdfExport")}
            </button>

            <div className={styles.mobileDivider} />

            <a
              href="https://t.me/kausar_code"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileNavLink}
            >
              <img src="/avatar_logo.png" alt="" className={styles.navAvatar} />
              {get("navigation.messageAuthor")}
            </a>
            <Link
              to="/donate"
              className={`${styles.mobileNavLink} ${styles.donateItem}`}
              onClick={closeMenu}
            >
              <DonateSparkles />
              <Coins size={16} className={styles.dropdownIcon} />
              {get("navigation.buyMeCoffee")}
            </Link>
            <Link
              to="/suggest-project"
              className={styles.mobileNavLink}
              onClick={closeMenu}
            >
              <Sparkles size={16} className={styles.dropdownIcon} />
              {get("navigation.suggestProject")}
            </Link>
            <Link
              to="/feedback"
              className={styles.mobileNavLink}
              onClick={closeMenu}
            >
              <Pencil size={16} className={styles.dropdownIcon} />
              {get("navigation.feedback")}
            </Link>

            <div className={styles.mobileDivider} />

            <button
              className={styles.mobileNavLink}
              onClick={toggleTheme}
              style={{ cursor: "pointer" }}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              {theme === "dark"
                ? get("navigation.lightTheme")
                : get("navigation.darkTheme")}
            </button>

            <Link
              to="/login"
              className={styles.mobileNavLink}
              onClick={closeMenu}
            >
              <ArrowUpRight size={18} />
              {localStorage.getItem("hasAccount")
                ? get("navigation.logIn")
                : get("navigation.getStarted")}
            </Link>
          </>
        )}
      </div>
    </>
  );
}
