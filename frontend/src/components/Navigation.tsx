import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useCopy } from "../hooks/useCopy";
import Logo from "./Logo";
import { LogOut, Sun, Moon, ArrowUpRight } from "lucide-react";
import styles from "./Navigation.module.css";

export default function Navigation() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { get } = useCopy();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to={user ? "/dashboard" : "/"} className={styles.logoLink}>
          <Logo size="medium" />
        </Link>

        <nav className={styles.navone}>
          <div className={styles.links}>
            <Link to="#" className={styles.navLink}>
              Главная
            </Link>
            <Link to="#" className={styles.navLink}>
              Как это работает
            </Link>
            <Link to="#" className={styles.navLink}>
              Возможности
            </Link>
          </div>
        </nav>

        <nav className={styles.nav}>
          <div className={styles.links}>
            {user ? (
              <>
                <Link to="/dashboard" className={styles.navLink}>
                  {get("nav.dashboard")}
                </Link>
                <Link to="/books" className={styles.navLink}>
                  {get("nav.books")}
                </Link>
                <Link to="/schedule" className={styles.navLink}>
                  {get("nav.schedule")}
                </Link>
                <Link to="/roadmap" className={styles.navLink}>
                  {get("nav.roadmap")}
                </Link>
                <a
                  href="https://t.me/kausarsh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactBtn}
                >
                  {get("nav.contact")}
                </a>
                <button
                  onClick={toggleTheme}
                  className={styles.themeBtn}
                  title={theme === "dark" ? "Светлая тема" : "Темная тема"}
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </>
            ) : (
              <>
                <a
                  href="https://t.me/kausarsh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  <span className={styles.onlineIndicator}></span>
                  {get("nav.contact")}
                </a>
                <Link to="/login" className={styles.contactBtn}>
                  Начать
                  <ArrowUpRight size={16} />
                </Link>
                <button
                  onClick={toggleTheme}
                  className={styles.themeBtn}
                  title={theme === "dark" ? "Светлая тема" : "Темная тема"}
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </>
            )}
          </div>
          {user && (
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <LogOut size={18} />
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
