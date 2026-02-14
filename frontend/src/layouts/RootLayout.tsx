import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
            QalamFlow
          </Link>
          <div className={styles.links}>
            {user ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/books">Books</Link>
                <Link to="/schedule">Schedule</Link>
                <Link to="/roadmap">Roadmap</Link>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
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
