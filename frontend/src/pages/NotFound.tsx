import { Link } from "react-router-dom";
import { useCopy } from "../hooks/useCopy";
import { ArrowUpRight } from "lucide-react";
import styles from "./NotFound.module.css";

export default function NotFound() {
  const { get } = useCopy();

  return (
    <div className={styles.wrapper}>
      <p className={styles.code}>{get("notFound.code")}</p>
      <section className={styles.card} aria-label="Not found page">
        <h1 className={styles.title}>{get("notFound.oops")} {get("notFound.title")}</h1>
        <p className={styles.description}>{get("notFound.description")}</p>
        <Link to="/" className={styles.cta}>
          {get("notFound.backHome")}
          <span className={styles.ctaIcon}>
            <ArrowUpRight size={16} />
          </span>
        </Link>
      </section>
    </div>
  );
}
