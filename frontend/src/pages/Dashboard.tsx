import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import type { Book, ForecastResponse } from "../api/types";
import { BookOpen, BookCheck, FileText, TrendingUp, Calendar, TrendingUpIcon, ArrowRight } from "lucide-react";
import styles from "./Dashboard.module.css";

const MOTIVATIONS = [
  "Every page brings you closer to knowledge. Keep going!",
  "Consistency is the key to mastery. You're doing great!",
  "The ink of a scholar is more precious than the blood of a martyr.",
  "Small steps every day lead to great achievements.",
  "Your dedication today shapes your tomorrow.",
];

export default function Dashboard() {
  const { user } = useAuth();
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
  const motivation = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];

  const nearest = forecast?.books
    .filter((b) => b.estimatedDaysLeft !== null)
    .sort((a, b) => (a.estimatedDaysLeft ?? 999) - (b.estimatedDaysLeft ?? 999))[0];

  return (
    <div className={styles.wrapper}>
      {/* Hero */}
      <div className={styles.hero}>
        <h1 className={styles.greeting}>
          Assalamu Alaykum, {user?.name}!
        </h1>
        <p className={styles.motivation}>{motivation}</p>
      </div>

      {/* Stats */}
      {!loading && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Your Progress</h2>
          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <div className={styles.statIcon}><BookOpen size={32} /></div>
              <div className={styles.statValue}>{studying.length}</div>
              <div className={styles.statLabel}>Books in Progress</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statIcon}><BookCheck size={32} /></div>
              <div className={styles.statValue}>{completed.length}</div>
              <div className={styles.statLabel}>Books Completed</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statIcon}><FileText size={32} /></div>
              <div className={styles.statValue}>{totalRead}</div>
              <div className={styles.statLabel}>Pages Read</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statIcon}><TrendingUp size={32} /></div>
              <div className={styles.statValue}>
                {totalPages > 0 ? Math.round((totalRead / totalPages) * 100) : 0}%
              </div>
              <div className={styles.statLabel}>Overall Progress</div>
            </div>
          </div>
        </div>
      )}

      {/* Reminder */}
      {nearest && (
        <div className={styles.reminder}>
          At your current pace, you'll finish <strong>{nearest.title}</strong> in{" "}
          <strong>{nearest.estimatedDaysLeft} days</strong>. Keep it up!
        </div>
      )}

      {/* Navigation cards */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Access</h2>
        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.cardIcon}><BookOpen size={40} /></div>
            <h3>My Books</h3>
            <p>Add new books, track what you're studying, and update your reading progress.</p>
            <Link to="/books" className={styles.cardLink}>
              Manage Books <ArrowRight size={16} />
            </Link>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}><Calendar size={40} /></div>
            <h3>My Schedule</h3>
            <p>Plan your weekly study sessions and never miss a lesson.</p>
            <Link to="/schedule" className={styles.cardLink}>
              View Schedule <ArrowRight size={16} />
            </Link>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}><TrendingUpIcon size={40} /></div>
            <h3>My Roadmap</h3>
            <p>See your learning forecast and when you'll reach your goals.</p>
            <Link to="/roadmap" className={styles.cardLink}>
              View Roadmap <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
