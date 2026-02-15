import { useCopy } from "../../../hooks/useCopy";
import SectionHeader from "../../../components/SectionHeader";
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
      <SectionHeader
        title={get("home.features.title")}
        subtitle={get("home.features.subtitle")}
        subtitleEn={get("home.features.subtitleEn")}
      />
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
