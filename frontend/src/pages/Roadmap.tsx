import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Book, DetailedForecast, WhatIfResponse } from "../api/types";
import { useCopy } from "../hooks/useCopy";
import styles from "./Roadmap.module.css";

export default function Roadmap() {
  const { get } = useCopy();
  const [books, setBooks] = useState<Book[]>([]);
  const [forecasts, setForecasts] = useState<Record<string, DetailedForecast>>({});
  const [loading, setLoading] = useState(true);

  // What-if state per book
  const [whatIfInputs, setWhatIfInputs] = useState<Record<string, number>>({});
  const [whatIfResults, setWhatIfResults] = useState<Record<string, WhatIfResponse | null>>({});

  // Pace override state per book
  const [overrideInputs, setOverrideInputs] = useState<Record<string, string>>({});
  const [savingOverride, setSavingOverride] = useState<string | null>(null);

  const load = async () => {
    try {
      const bks = await api.get<Book[]>("/books");
      const studying = bks.filter((b) => b.status === "studying");
      setBooks(studying);

      const results: Record<string, DetailedForecast> = {};
      await Promise.all(
        studying.map(async (b) => {
          try {
            results[b._id] = await api.get<DetailedForecast>(`/forecast/${b._id}`);
          } catch { /* empty */ }
        })
      );
      setForecasts(results);

      // Init override inputs from existing overrides
      const inputs: Record<string, string> = {};
      for (const [id, fc] of Object.entries(results)) {
        inputs[id] = fc.paceOverride ? String(fc.paceOverride.pagesPerDay) : "";
      }
      setOverrideInputs(inputs);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const paceClass = (rating: string | null) => {
    switch (rating) {
      case "slow": return styles.paceSlow;
      case "normal": return styles.paceNormal;
      case "fast": return styles.paceFast;
      case "very_fast": return styles.paceVeryFast;
      default: return styles.paceNormal;
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "\u2014";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // What-if handler
  const handleWhatIf = async (bookId: string) => {
    const ppd = whatIfInputs[bookId];
    if (!ppd || ppd <= 0) return;
    try {
      const result = await api.post<WhatIfResponse>(`/forecast/${bookId}/whatif`, { pagesPerDay: ppd });
      setWhatIfResults((prev) => ({ ...prev, [bookId]: result }));
    } catch { /* empty */ }
  };

  // Pace override handlers
  const handleSaveOverride = async (bookId: string) => {
    const val = parseFloat(overrideInputs[bookId]);
    if (!val || val <= 0) return;
    setSavingOverride(bookId);
    try {
      await api.put(`/forecast/${bookId}/pace-override`, { pagesPerDay: val });
      await load();
    } catch { /* empty */ }
    setSavingOverride(null);
  };

  const handleRemoveOverride = async (bookId: string) => {
    setSavingOverride(bookId);
    try {
      await api.delete(`/forecast/${bookId}/pace-override`);
      setOverrideInputs((prev) => ({ ...prev, [bookId]: "" }));
      await load();
    } catch { /* empty */ }
    setSavingOverride(null);
  };

  // Weekly chart: find max pages across all weeks for scaling
  const getMaxPages = (weeks: DetailedForecast["weeklyBreakdown"]) => {
    return Math.max(1, ...weeks.map((w) => w.pages));
  };

  if (loading) return <p>{get("common.loading")}</p>;

  return (
    <div className={styles.wrapper}>
      <h1>{get("roadmap.title")}</h1>
      <p className={styles.intro}>
        {get("roadmap.intro")}
      </p>

      {books.length === 0 ? (
        <p className={styles.empty}>
          {get("roadmap.emptyState")}
        </p>
      ) : (
        <div className={styles.list}>
          {books.map((book) => {
            const fc = forecasts[book._id];
            const pct = book.pages > 0
              ? Math.min(100, Math.round((book.progress / book.pages) * 100))
              : 0;

            return (
              <div key={book._id} className={styles.card}>
                {/* Header */}
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.cardTitle}>{book.title}</span>
                    <span className={styles.cardMeta}> — {book.author} ({book.level})</span>
                  </div>
                  <div className={styles.badges}>
                    {fc?.paceRating && (
                      <span className={`${styles.paceBadge} ${paceClass(fc.paceRating)}`}>
                        {fc.paceRating.replace("_", " ")}
                      </span>
                    )}
                    {fc?.paceOverride && (
                      <span className={styles.overrideBadge}>{get("roadmap.customPaceBadge")}</span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                </div>
                <div className={styles.progressLabel}>{get("roadmap.progressLabel", { pct, progress: book.progress, pages: book.pages })}</div>

                {fc && !fc.message ? (
                  <>
                    {/* Stats row */}
                    <div className={styles.statsRow}>
                      <div className={styles.statItem}>
                        <div className={styles.statValue}>{fc.effectivePace}</div>
                        <div className={styles.statLabel}>{get("roadmap.stats.effectivePace")}</div>
                      </div>
                      <div className={styles.statItem}>
                        <div className={styles.statValue}>{fc.weightedPagesPerDay}</div>
                        <div className={styles.statLabel}>{get("roadmap.stats.weightedAvg")}</div>
                      </div>
                      <div className={styles.statItem}>
                        <div className={styles.statValue}>{fc.recentPagesPerDay}</div>
                        <div className={styles.statLabel}>{get("roadmap.stats.last7Days")}</div>
                      </div>
                      <div className={styles.statItem}>
                        <div className={styles.statValue}>{fc.pagesRemaining}</div>
                        <div className={styles.statLabel}>{get("roadmap.stats.pagesLeft")}</div>
                      </div>
                      <div className={styles.statItem}>
                        <div className={styles.statValue}>{fc.averageTimePerSession}m</div>
                        <div className={styles.statLabel}>{get("roadmap.stats.avgSession")}</div>
                      </div>
                      <div className={styles.statItem}>
                        <div className={styles.statValue}>{fc.estimatedDaysLeft ?? "\u2014"}</div>
                        <div className={styles.statLabel}>{get("roadmap.stats.daysLeft")}</div>
                      </div>
                    </div>

                    {/* Algorithm details */}
                    <div className={styles.detailsRow}>
                      <span className={styles.detailChip}>
                        {get("roadmap.details.difficulty")}: {fc.difficultyMultiplier}x
                      </span>
                      <span className={styles.detailChip}>
                        {get("roadmap.details.study")}: {fc.studyFrequency.daysPerWeek}d/wk ({fc.studyFrequency.source})
                      </span>
                      <span className={styles.detailChip}>
                        {get("roadmap.details.active")}: {fc.activeDays} days
                      </span>
                    </div>

                    {/* Forecast message */}
                    {fc.estimatedCompletionDate && (
                      <div className={styles.forecastMessage}>
                        {get("roadmap.forecastMessage.prefix")} <strong>{formatDate(fc.estimatedCompletionDate)}</strong>.
                        {fc.paceRating === "fast" || fc.paceRating === "very_fast"
                          ? ` ${get("roadmap.forecastMessage.fast")}`
                          : fc.paceRating === "slow"
                            ? ` ${get("roadmap.forecastMessage.slow")}`
                            : ` ${get("roadmap.forecastMessage.normal")}`}
                      </div>
                    )}

                    {/* Weekly Progress Chart */}
                    {fc.weeklyBreakdown.length > 0 && (
                      <div className={styles.chartSection}>
                        <h3 className={styles.sectionTitle}>{get("roadmap.weeklyProgress.title")}</h3>
                        <div className={styles.barChart}>
                          {fc.weeklyBreakdown.map((week, i) => {
                            const maxP = getMaxPages(fc.weeklyBreakdown);
                            const heightPct = maxP > 0 ? (week.pages / maxP) * 100 : 0;
                            return (
                              <div key={i} className={styles.barColumn}>
                                <div className={styles.barValue}>{week.pages > 0 ? week.pages : ""}</div>
                                <div className={styles.barTrack}>
                                  <div
                                    className={styles.barFill}
                                    style={{ height: `${heightPct}%` }}
                                  />
                                </div>
                                <div className={styles.barLabel}>{week.weekLabel}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Pace Override */}
                    <div className={styles.overrideSection}>
                      <h3 className={styles.sectionTitle}>{get("roadmap.paceOverride.title")}</h3>
                      <p className={styles.overrideHint}>
                        {get("roadmap.paceOverride.hint")}
                      </p>
                      <div className={styles.overrideRow}>
                        <input
                          type="number"
                          min="0.1"
                          step="0.5"
                          placeholder={get("roadmap.paceOverride.placeholder")}
                          className={styles.overrideInput}
                          value={overrideInputs[book._id] || ""}
                          onChange={(e) =>
                            setOverrideInputs((prev) => ({ ...prev, [book._id]: e.target.value }))
                          }
                        />
                        <button
                          className={styles.overrideBtn}
                          onClick={() => handleSaveOverride(book._id)}
                          disabled={savingOverride === book._id}
                        >
                          {savingOverride === book._id ? get("roadmap.paceOverride.saving") : get("roadmap.paceOverride.setPace")}
                        </button>
                        {fc.paceOverride && (
                          <button
                            className={styles.overrideRemoveBtn}
                            onClick={() => handleRemoveOverride(book._id)}
                            disabled={savingOverride === book._id}
                          >
                            {get("roadmap.paceOverride.remove")}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* What-If Scenario */}
                    <div className={styles.whatIfSection}>
                      <h3 className={styles.sectionTitle}>{get("roadmap.whatIf.title")}</h3>
                      <p className={styles.whatIfHint}>
                        {get("roadmap.whatIf.hint")}
                      </p>
                      <div className={styles.whatIfRow}>
                        <input
                          type="range"
                          min="1"
                          max="50"
                          value={whatIfInputs[book._id] || Math.round(fc.effectivePace) || 5}
                          className={styles.whatIfSlider}
                          onChange={(e) =>
                            setWhatIfInputs((prev) => ({ ...prev, [book._id]: Number(e.target.value) }))
                          }
                        />
                        <span className={styles.whatIfValue}>
                          {whatIfInputs[book._id] || Math.round(fc.effectivePace) || 5} {get("roadmap.whatIf.pagesPerDay")}
                        </span>
                        <button
                          className={styles.whatIfBtn}
                          onClick={() => handleWhatIf(book._id)}
                        >
                          {get("roadmap.whatIf.calculate")}
                        </button>
                      </div>
                      {whatIfResults[book._id] && (
                        <div className={styles.whatIfResult}>
                          {get("roadmap.whatIf.result", {
                            pagesPerDay: whatIfResults[book._id]!.pagesPerDay,
                            daysLeft: whatIfResults[book._id]!.estimatedDaysLeft,
                            completionDate: formatDate(whatIfResults[book._id]!.estimatedCompletionDate)
                          })}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className={styles.noData}>
                    {fc?.message || get("roadmap.noData")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
