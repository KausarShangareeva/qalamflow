import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Home.module.css";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Your Path to Knowledge Starts Here</h1>
      <p className={styles.subtitle}>
        QalamFlow helps you organize your Islamic studies — track the books you're reading,
        plan your weekly schedule, and see a clear roadmap to completing your courses.
        Every page you read brings you closer to your goals.
      </p>
      {user ? (
        <Link to="/dashboard" className={styles.cta}>Go to Dashboard</Link>
      ) : (
        <Link to="/register" className={styles.cta}>Start Your Journey</Link>
      )}
    </div>
  );
}
