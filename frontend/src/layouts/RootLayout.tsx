import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCopy } from "../hooks/useCopy";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  TrendingUp,
  LogOut,
  LogIn,
  UserPlus,
  PenTool,
  MessageCircle,
} from "lucide-react";
import styles from "./RootLayout.module.css";

export default function RootLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { get } = useCopy();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link to={user ? "/dashboard" : "/"} className={styles.logo}>
            <PenTool size={24} />
            <span>{get("app.name")}</span>
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
                <a href="https://t.me/kausarsh" target="_blank" rel="noopener noreferrer" className={styles.navLink}>
                  <MessageCircle size={18} />
                  <span>{get("nav.contact")}</span>
                </a>
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
              </>
            )}
          </div>
        </nav>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

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
    </>
  );
}
