import { Link } from "react-router-dom";
import { useCopy } from "../hooks/useCopy";
import styles from "./NotFound.module.css";

export default function NotFound() {
  const { get } = useCopy();

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.text}>{get("notFound.title")}</p>
      <Link to="/" className={styles.link}>
        {get("notFound.goHome")}
      </Link>
    </div>
  );
}
