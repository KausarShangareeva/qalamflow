import { useAuth } from "../../../context/AuthContext";
import { useCopy } from "../../../hooks/useCopy";
import SectionHeader from "../../../components/SectionHeader";
import CTAButton from "../../../components/CTAButton";
import styles from "./FinalCTA.module.css";

export default function FinalCTA() {
  const { user } = useAuth();
  const { get } = useCopy();
  return (
    <section id="cta" className={styles.section}>
      <SectionHeader
        title={get("finalCta.title")}
        subtitle={get("finalCta.subtitle")}
        titleWidth="100%"
      />
      <div className={styles.card}>
        <div className={styles.illustration}>
          <img
            src="/example_portable.jpg"
            alt="Schedule preview"
            className={styles.illustrationImg}
            loading="lazy"
          />
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>{get("finalCta.heading")}</h3>
          <p className={styles.description}>{get("finalCta.description")}</p>
          <CTAButton align="left" to={user ? "/workspace" : "/register"}>
            {get("finalCta.button")}
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
