import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useCopy } from "../hooks/useCopy";
import Logo from "./Logo";
import {
  LogOut,
  Sun,
  Moon,
  ArrowUpRight,
  MessageCircle,
  Coffee,
  Sparkles,
  MessagesSquare,
  Menu,
  X,
  Home,
  LayoutDashboard,
} from "lucide-react";
import styles from "./Navigation.module.css";

export default function Navigation() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { get } = useCopy();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link to={user ? "/workspace" : "/"} className={styles.logoLink}>
            <Logo size="medium" />
          </Link>

          <nav className={styles.nav}>
            <div className={styles.links}>
              {user ? (
                <>
                  <Link to="/" className={styles.navLink}>
                    Главная
                  </Link>

                  <Link to="workspace" className={styles.navLink}>
                    Моя страница
                  </Link>

                  <div className={styles.dropdownWrapper}>
                    <button className={styles.contactLink}>
                      <span className={styles.onlineIndicator} />
                      {get("nav.contact")}
                    </button>
                    <div className={styles.dropdown}>
                      <a
                        href="https://t.me/kausarsh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.dropdownItem}
                      >
                        <MessageCircle size={16} />
                        Написать автору
                      </a>
                      <a
                        href="https://buymeacoffee.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.dropdownItem}
                      >
                        <Coffee size={16} />
                        Купить автору кофе
                      </a>
                      <a
                        href="https://t.me/kausarsh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.dropdownItem}
                      >
                        <Sparkles size={16} />
                        Предложить проект
                      </a>
                      <a
                        href="https://t.me/kausarsh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.dropdownItem}
                      >
                        <MessagesSquare size={16} />
                        Оставить отзыв
                      </a>
                    </div>
                  </div>

                  <span className={styles.divider}></span>

                  <button
                    onClick={toggleTheme}
                    className={styles.themeBtn}
                    title={theme === "dark" ? "Светлая тема" : "Темная тема"}
                  >
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  </button>

                  <button onClick={handleLogout} className={styles.logoutBtn}>
                    Выйти
                    <LogOut size={18} />
                  </button>

                  <button
                    className={styles.burgerBtn}
                    onClick={() => setMenuOpen(true)}
                  >
                    <Menu size={20} />
                  </button>
                </>
              ) : (
                <>
                  <Link to="#" className={styles.navLink}>
                    Как это работает
                  </Link>
                  <Link to="#" className={styles.navLink}>
                    Возможности
                  </Link>

                  <div className={styles.dropdownWrapper}>
                    <button className={styles.contactLink}>
                      <span className={styles.onlineIndicator} />
                      {get("nav.contact")}
                    </button>
                    <div className={styles.dropdown}>
                      <a
                        href="https://t.me/kausarsh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.dropdownItem}
                      >
                        <MessageCircle size={16} />
                        Написать автору
                      </a>
                      <a
                        href="https://buymeacoffee.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.dropdownItem}
                      >
                        <Coffee size={16} />
                        Купить автору кофе
                      </a>
                      <a
                        href="https://t.me/kausarsh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.dropdownItem}
                      >
                        <Sparkles size={16} />
                        Предложить проект
                      </a>
                      <a
                        href="https://t.me/kausarsh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.dropdownItem}
                      >
                        <MessagesSquare size={16} />
                        Оставить отзыв
                      </a>
                    </div>
                  </div>

                  <Link to="/login" className={styles.contactBtn}>
                    {localStorage.getItem("hasAccount") ? "Войти" : "Начать"}
                    <ArrowUpRight size={16} />
                  </Link>

                  <span className={styles.divider}></span>
                  <button
                    onClick={toggleTheme}
                    className={styles.themeBtn}
                    title={theme === "dark" ? "Светлая тема" : "Темная тема"}
                  >
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  </button>

                  <button
                    className={styles.burgerBtn}
                    onClick={() => setMenuOpen(true)}
                  >
                    <Menu size={20} />
                  </button>
                </>
              )}
            </div>
          </nav>
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
          <Logo size="medium" showText={false} />
          <button className={styles.mobileCloseBtn} onClick={closeMenu}>
            <X size={20} />
          </button>
        </div>

        {user ? (
          <>
            <Link to="/" className={styles.mobileNavLink} onClick={closeMenu}>
              <Home size={18} />
              Главная
            </Link>
            <Link
              to="/workspace"
              className={styles.mobileNavLink}
              onClick={closeMenu}
            >
              <LayoutDashboard size={18} />
              Моя страница
            </Link>

            <div className={styles.mobileDivider} />

            <a
              href="https://t.me/kausarsh"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileNavLink}
            >
              <MessageCircle size={18} />
              Написать автору
            </a>
            <a
              href="https://buymeacoffee.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileNavLink}
            >
              <Coffee size={18} />
              Купить автору кофе
            </a>
            <a
              href="https://t.me/kausarsh"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileNavLink}
            >
              <Sparkles size={18} />
              Предложить проект
            </a>
            <a
              href="https://t.me/kausarsh"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileNavLink}
            >
              <MessagesSquare size={18} />
              Оставить отзыв
            </a>

            <div className={styles.mobileDivider} />

            <button
              className={styles.mobileNavLink}
              onClick={toggleTheme}
              style={{ cursor: "pointer" }}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
            </button>

            <button
              className={styles.mobileLogoutBtn}
              onClick={() => {
                handleLogout();
                closeMenu();
              }}
            >
              <LogOut size={18} />
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="#" className={styles.mobileNavLink} onClick={closeMenu}>
              Как это работает
            </Link>
            <Link to="#" className={styles.mobileNavLink} onClick={closeMenu}>
              Возможности
            </Link>

            <div className={styles.mobileDivider} />

            <a
              href="https://t.me/kausarsh"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileNavLink}
            >
              <MessageCircle size={18} />
              Написать автору
            </a>
            <a
              href="https://buymeacoffee.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileNavLink}
            >
              <Coffee size={18} />
              Купить автору кофе
            </a>

            <div className={styles.mobileDivider} />

            <button
              className={styles.mobileNavLink}
              onClick={toggleTheme}
              style={{ cursor: "pointer" }}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
            </button>

            <Link
              to="/login"
              className={styles.mobileNavLink}
              onClick={closeMenu}
            >
              <ArrowUpRight size={18} />
              {localStorage.getItem("hasAccount") ? "Войти" : "Начать"}
            </Link>
          </>
        )}
      </div>
    </>
  );
}
