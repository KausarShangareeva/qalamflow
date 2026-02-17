import { useAuth } from "../../context/AuthContext";
import styles from "./Workspace.module.css";
import WeekPlan from "./components/WeekPlan";

export default function Workspace() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <h1>{user?.name}, добро пожаловать в QalamFlow</h1>
      <p className={styles.subtitle}>Давай спланируем твою неделю ✨</p>
      <WeekPlan />
    </div>
  );
}
