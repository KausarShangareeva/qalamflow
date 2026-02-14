import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCopy } from "../hooks/useCopy";
import {
  TrendingUp,
  CheckCircle,
  Calendar,
  Lightbulb,
  BookOpen,
  MessageCircle,
  Download,
  Zap,
} from "lucide-react";
import styles from "./Home.module.css";

const featureIcons = [
  TrendingUp,
  CheckCircle,
  Calendar,
  Lightbulb,
  BookOpen,
  MessageCircle,
  Download,
  Zap,
];

const iconColors = [
  "#8b5cf6", // purple
  "#10b981", // green
  "#f59e0b", // orange
  "#ef4444", // red
  "#3b82f6", // blue
  "#06b6d4", // cyan
  "#f97316", // orange
  "#22c55e", // green
];

export default function Home() {
  const { user } = useAuth();
  const { get, getArray } = useCopy();
  const features = getArray("home.features.items");

  return (
    <>
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

      <section className={styles.features}>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => {
            const Icon = featureIcons[index];
            return (
              <div key={index} className={styles.featureCard}>
                <div
                  className={styles.featureIcon}
                  style={{ backgroundColor: iconColors[index] + '20' }}
                >
                  <Icon size={28} color={iconColors[index]} strokeWidth={2} />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
                <p className={styles.featureSubtitle}>{feature.subtitle}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
