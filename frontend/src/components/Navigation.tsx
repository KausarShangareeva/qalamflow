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
  Sparkles,
  MessagesSquare,
  Menu,
  X,
  Home,
  LayoutDashboard,
  BookOpen,
  Zap,
  Printer,
} from "lucide-react";
import styles from "./Navigation.module.css";

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
                      <a
                        href="https://t.me/kausar_code"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.dropdownItem}
                      >
                        <img
                          src="/avatar_logo.png"
                          alt=""
                          className={styles.navAvatar}
                        />
                        {get("navigation.messageAuthor")}
                      </a>
                      <Link to="/donate" className={styles.dropdownItem}>
                        <img
                          src="/buymeacoffee.png"
                          alt=""
                          className={styles.navAvatar}
                        />
                        {get("navigation.buyMeCoffee")}
                      </Link>
                      <Link
                        to="/suggest-project"
                        className={styles.dropdownItem}
                      >
                        <Sparkles size={16} />
                        {get("navigation.suggestProject")}
                      </Link>
                      <Link to="/feedback" className={styles.dropdownItem}>
                        <MessagesSquare size={16} />
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
                      <a
                        href="https://t.me/kausar_code"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.dropdownItem}
                      >
                        <img
                          src="/avatar_logo.png"
                          alt=""
                          className={styles.navAvatar}
                        />
                        {get("navigation.messageAuthor")}
                      </a>
                      <Link to="/donate" className={styles.dropdownItem}>
                        <img
                          src="/buymeacoffee.png"
                          alt=""
                          className={styles.navAvatar}
                        />
                        {get("navigation.buyMeCoffee")}
                      </Link>
                      <Link
                        to="/suggest-project"
                        className={styles.dropdownItem}
                      >
                        <Sparkles size={16} />
                        {get("navigation.suggestProject")}
                      </Link>
                      <Link to="/feedback" className={styles.dropdownItem}>
                        <MessagesSquare size={16} />
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
              className={styles.mobileNavLink}
              onClick={closeMenu}
            >
              <img
                src="/buymeacoffee.png"
                alt=""
                className={styles.navAvatar}
              />
              {get("navigation.buyMeCoffee")}
            </Link>
            <Link
              to="/suggest-project"
              className={styles.mobileNavLink}
              onClick={closeMenu}
            >
              <Sparkles size={18} />
              {get("navigation.suggestProject")}
            </Link>
            <Link
              to="/feedback"
              className={styles.mobileNavLink}
              onClick={closeMenu}
            >
              <MessagesSquare size={18} />
              {get("navigation.feedback")}
            </Link>

            <div className={styles.mobileDivider} />

            <button
              className={styles.mobileNavLink}
              onClick={toggleTheme}
              style={{ cursor: "pointer" }}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              {theme === "dark" ? get("navigation.lightTheme") : get("navigation.darkTheme")}
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
              className={styles.mobileNavLink}
              onClick={closeMenu}
            >
              <img
                src="/buymeacoffee.png"
                alt=""
                className={styles.navAvatar}
              />
              {get("navigation.buyMeCoffee")}
            </Link>
            <Link
              to="/suggest-project"
              className={styles.mobileNavLink}
              onClick={closeMenu}
            >
              <Sparkles size={18} />
              {get("navigation.suggestProject")}
            </Link>
            <Link
              to="/feedback"
              className={styles.mobileNavLink}
              onClick={closeMenu}
            >
              <MessagesSquare size={18} />
              {get("navigation.feedback")}
            </Link>

            <div className={styles.mobileDivider} />

            <button
              className={styles.mobileNavLink}
              onClick={toggleTheme}
              style={{ cursor: "pointer" }}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              {theme === "dark" ? get("navigation.lightTheme") : get("navigation.darkTheme")}
            </button>

            <Link
              to="/login"
              className={styles.mobileNavLink}
              onClick={closeMenu}
            >
              <ArrowUpRight size={18} />
              {localStorage.getItem("hasAccount") ? get("navigation.logIn") : get("navigation.getStarted")}
            </Link>
          </>
        )}
      </div>
    </>
  );
}
