import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useCopy } from "../hooks/useCopy";
import Logo from "./Logo";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  TrendingUp,
  LogOut,
  LogIn,
  UserPlus,
  MessageCircle,
  Sun,
  Moon,
} from "lucide-react";
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
      <nav className={styles.nav}>
        <Link to={user ? "/dashboard" : "/"} className={styles.logoLink}>
          <Logo size="medium" />
        </Link>
        <div className={styles.links}>
          {user ? (
            <>
              <Link to="/dashboard" className={styles.navLink}>
                <LayoutDashboard size={18} />
                <span>{get("nav.dashboard")}</span>
              </Link>
              <Link to="/books" className={styles.navLink}>
                <BookOpen size={18} />
                <span>{get("nav.books")}</span>
              </Link>
              <Link to="/schedule" className={styles.navLink}>
                <Calendar size={18} />
                <span>{get("nav.schedule")}</span>
              </Link>
              <Link to="/roadmap" className={styles.navLink}>
                <TrendingUp size={18} />
                <span>{get("nav.roadmap")}</span>
              </Link>
              <a
                href="https://t.me/kausarsh"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.navLink}
              >
                <MessageCircle size={18} />
                <span>{get("nav.contact")}</span>
              </a>
              <button
                onClick={toggleTheme}
                className={styles.themeBtn}
                title={theme === "dark" ? "Светлая тема" : "Темная тема"}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                <LogOut size={18} />
                <span>{get("nav.logout")}</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.navLink}>
                <LogIn size={18} />
                <span>{get("nav.login")}</span>
              </Link>
              <Link to="/register" className={styles.navLink}>
                <UserPlus size={18} />
                <span>{get("nav.register")}</span>
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
      </nav>
    </header>
  );
}
