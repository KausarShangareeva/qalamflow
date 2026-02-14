import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  TrendingUp,
  LogOut,
  LogIn,
  UserPlus,
  PenTool,
} from "lucide-react";
import styles from "./RootLayout.module.css";

export default function RootLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
            <span>QalamFlow</span>
          </Link>
          <div className={styles.links}>
            {user ? (
              <>
                <Link to="/dashboard" className={styles.navLink}>
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link to="/books" className={styles.navLink}>
                  <BookOpen size={18} />
                  <span>Books</span>
                </Link>
                <Link to="/schedule" className={styles.navLink}>
                  <Calendar size={18} />
                  <span>Schedule</span>
                </Link>
                <Link to="/roadmap" className={styles.navLink}>
                  <TrendingUp size={18} />
                  <span>Roadmap</span>
                </Link>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.navLink}>
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
                <Link to="/register" className={styles.navLink}>
                  <UserPlus size={18} />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        &copy; {new Date().getFullYear()} QalamFlow
      </footer>
    </>
  );
}
