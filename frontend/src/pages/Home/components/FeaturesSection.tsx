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

const iconGradients = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // purple
  "linear-gradient(135deg, #10b981 0%, #059669 100%)", // green
  "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", // orange
  "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", // cyan
  "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", // orange
  "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", // green
];

export default function FeaturesSection() {
  const { getArray, get } = useCopy();
  const features = getArray("home.features.items");

  return (
    <section className={styles.features}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{get("home.features.title")}</h2>
        <p className={styles.sectionSubtitle}>{get("home.features.subtitle")}</p>
        <p className={styles.sectionSubtitleEn}>{get("home.features.subtitleEn")}</p>
      </div>
      <div className={styles.featuresGrid}>
        {features.map((feature, index) => {
          const Icon = featureIcons[index];
          return (
            <div key={index} className={styles.featureCard}>
              <div
                className={styles.featureIcon}
                style={{ background: iconGradients[index] }}
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
