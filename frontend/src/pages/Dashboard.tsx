import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCopy } from "../hooks/useCopy";
import { api } from "../api/client";
import type { Book, ForecastResponse } from "../api/types";
import { BookOpen, BookCheck, FileText, TrendingUp, Calendar, TrendingUpIcon, ArrowRight } from "lucide-react";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { user } = useAuth();
  const { get, getRandomMotivation } = useCopy();
  const [books, setBooks] = useState<Book[]>([]);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Book[]>("/books").catch(() => []),
      api.get<ForecastResponse>("/forecast").catch(() => ({ books: [] })),
    ]).then(([booksData, forecastData]) => {
      setBooks(booksData);
      setForecast(forecastData);
      setLoading(false);
    });
  }, []);

  const studying = books.filter((b) => b.status === "studying");
  const completed = books.filter((b) => b.status === "completed");
  const totalPages = books.reduce((s, b) => s + b.pages, 0);
  const totalRead = books.reduce((s, b) => s + b.progress, 0);
  const motivation = getRandomMotivation();

  const nearest = forecast?.books
    .filter((b) => b.estimatedDaysLeft !== null)
    .sort((a, b) => (a.estimatedDaysLeft ?? 999) - (b.estimatedDaysLeft ?? 999))[0];

  return (
    <div className={styles.wrapper}>
      {/* Hero */}
      <div className={styles.hero}>
        <h1 className={styles.greeting}>
          {get("dashboard.greeting", { name: user?.name || "User" })}
        </h1>
        <p className={styles.motivation}>{motivation}</p>
      </div>

      {/* Stats */}
      {!loading && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{get("dashboard.stats.title")}</h2>
          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <div className={styles.statIcon}><BookOpen size={32} /></div>
              <div className={styles.statValue}>{studying.length}</div>
              <div className={styles.statLabel}>{get("dashboard.stats.booksInProgress")}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statIcon}><BookCheck size={32} /></div>
              <div className={styles.statValue}>{completed.length}</div>
              <div className={styles.statLabel}>{get("dashboard.stats.booksCompleted")}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statIcon}><FileText size={32} /></div>
              <div className={styles.statValue}>{totalRead}</div>
              <div className={styles.statLabel}>{get("dashboard.stats.pagesRead")}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statIcon}><TrendingUp size={32} /></div>
              <div className={styles.statValue}>
                {totalPages > 0 ? Math.round((totalRead / totalPages) * 100) : 0}%
              </div>
              <div className={styles.statLabel}>{get("dashboard.stats.overallProgress")}</div>
            </div>
          </div>
        </div>
      )}

      {/* Reminder */}
      {nearest && (
        <div className={styles.reminder}>
          {get("dashboard.reminder", {
            bookTitle: nearest.title,
            days: nearest.estimatedDaysLeft
          })}
        </div>
      )}

      {/* Navigation cards */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{get("dashboard.quickAccess.title")}</h2>
        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.cardIcon}><BookOpen size={40} /></div>
            <h3>{get("dashboard.quickAccess.books.title")}</h3>
            <p>{get("dashboard.quickAccess.books.description")}</p>
            <Link to="/books" className={styles.cardLink}>
              {get("dashboard.quickAccess.books.link")} <ArrowRight size={16} />
            </Link>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}><Calendar size={40} /></div>
            <h3>{get("dashboard.quickAccess.schedule.title")}</h3>
            <p>{get("dashboard.quickAccess.schedule.description")}</p>
            <Link to="/schedule" className={styles.cardLink}>
              {get("dashboard.quickAccess.schedule.link")} <ArrowRight size={16} />
            </Link>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}><TrendingUpIcon size={40} /></div>
            <h3>{get("dashboard.quickAccess.roadmap.title")}</h3>
            <p>{get("dashboard.quickAccess.roadmap.description")}</p>
            <Link to="/roadmap" className={styles.cardLink}>
              {get("dashboard.quickAccess.roadmap.link")} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
