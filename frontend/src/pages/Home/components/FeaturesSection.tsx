import { useCopy } from "../../../hooks/useCopy";
import {
  TrendingUp,
  CheckCircle,
  Calendar,
  MessageCircle,
  Download,
  Zap,
} from "lucide-react";
import styles from "./FeaturesSection.module.css";

const featureIcons = [
  TrendingUp,
  CheckCircle,
  Calendar,
  MessageCircle,
  Download,
  Zap,
];

export default function FeaturesSection() {
  const { getArray, get } = useCopy();
  const features = getArray("home.features.items");

  return (
    <section className={styles.features}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{get("home.features.title")}</h2>
        <p className={styles.sectionSubtitle}>
          {get("home.features.subtitle")}
        </p>
      </div>
      <div className={styles.featuresGrid}>
        {features.map((feature, index) => {
          const Icon = featureIcons[index];
          return (
            <div key={index} className={styles.featureCard}>
              <div
                className={`${styles.featureIcon} ${styles[`iconGradient${index}`]}`}
              >
                <Icon size={28} color="white" strokeWidth={2} />
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
              <p className={styles.featureSubtitle}>{feature.subtitle}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
