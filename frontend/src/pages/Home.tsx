import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCopy } from "../hooks/useCopy";
import styles from "./Home.module.css";

export default function Home() {
  const { user } = useAuth();
  const { get } = useCopy();

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>{get("home.title")}</h1>
      <p className={styles.subtitle}>
        {get("home.subtitle")}
      </p>
      {user ? (
        <Link to="/dashboard" className={styles.cta}>{get("home.cta.dashboard")}</Link>
      ) : (
        <Link to="/register" className={styles.cta}>{get("home.cta.register")}</Link>
      )}
    </div>
  );
}
