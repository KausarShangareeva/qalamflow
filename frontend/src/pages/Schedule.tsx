import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api/client";
import type { ScheduleItem, Book } from "../api/types";
import { useAuth } from "../context/AuthContext";
import { useCopy } from "../hooks/useCopy";
import { generateSchedulePDF } from "../utils/pdfGenerator";
import styles from "./Schedule.module.css";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

interface ScheduleForm {
  dayOfWeek: string;
  time: string;
  activity: string;
  bookId: string;
}

const EMPTY_FORM: ScheduleForm = { dayOfWeek: "monday", time: "09:00", activity: "", bookId: "" };

export default function Schedule() {
  const { user } = useAuth();
  const { get } = useCopy();
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ScheduleForm>(EMPTY_FORM);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [sched, bks] = await Promise.all([
        api.get<ScheduleItem[]>("/schedule"),
        api.get<Book[]>("/books"),
      ]);
      setItems(sched);
      setBooks(bks);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = (day?: string) => {
    setForm({ ...EMPTY_FORM, dayOfWeek: day || "monday" });
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (item: ScheduleItem) => {
    setForm({
      dayOfWeek: item.dayOfWeek,
      time: item.time,
      activity: item.activity,
      bookId: item.bookId?._id || "",
    });
    setEditingId(item._id);
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const body = { ...form, bookId: form.bookId || null };
    try {
      if (editingId) {
        await api.put(`/schedule/${editingId}`, body);
      } else {
        await api.post("/schedule", body);
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/schedule/${id}`);
    fetchData();
  };

  const handleExportPDF = () => {
    generateSchedulePDF(items, user?.name || "User");
  };

  const byDay = (day: string) => items.filter((i) => i.dayOfWeek === day);

  if (loading) return <p>{get("common.loading")}</p>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1>{get("schedule.title")}</h1>
        <div className={styles.headerActions}>
          {items.length > 0 && (
            <button className={styles.pdfButton} onClick={handleExportPDF}>
              {get("schedule.exportPDF")}
            </button>
          )}
          <button className={styles.addButton} onClick={() => openAdd()}>{get("schedule.addSession")}</button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>
          {get("schedule.emptyState")}
        </p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{get("schedule.table.day")}</th>
              <th>{get("schedule.table.sessions")}</th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => {
              const sessions = byDay(day);
              return (
                <tr key={day}>
                  <td className={styles.dayLabel}>{get(`schedule.days.${day}`)}</td>
                  <td>
                    {sessions.length === 0 ? (
                      <span style={{ color: "var(--color-text-muted)", fontSize: "var(--fs-xs)" }}>—</span>
                    ) : (
                      sessions.map((s) => (
                        <span key={s._id} className={styles.sessionChip}>
                          <span className={styles.sessionTime}>{s.time}</span>
                          <span className={styles.sessionActivity}>{s.activity}</span>
                          <span className={styles.chipActions}>
                            <button className={styles.chipBtn} onClick={() => openEdit(s)}>{get("common.editLower")}</button>
                            <button className={styles.chipBtn} onClick={() => handleDelete(s._id)}>x</button>
                          </span>
                        </span>
                      ))
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className={styles.overlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {editingId ? get("schedule.modal.titleEdit") : get("schedule.modal.titleAdd")}
            </h2>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <label className={styles.label}>
                  {get("schedule.form.day")}
                  <select
                    value={form.dayOfWeek}
                    onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{get(`schedule.days.${d}`)}</option>
                    ))}
                  </select>
                </label>
                <label className={styles.label}>
                  {get("schedule.form.time")}
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    required
                  />
                </label>
              </div>
              <label className={styles.label}>
                {get("schedule.form.activity")}
                <input
                  type="text"
                  placeholder={get("schedule.form.activityPlaceholder")}
                  value={form.activity}
                  onChange={(e) => setForm({ ...form, activity: e.target.value })}
                  required
                />
              </label>
              <label className={styles.label}>
                {get("schedule.form.linkedBook")}
                <select
                  value={form.bookId}
                  onChange={(e) => setForm({ ...form, bookId: e.target.value })}
                >
                  <option value="">{get("schedule.form.noneOption")}</option>
                  {books.map((b) => (
                    <option key={b._id} value={b._id}>{b.title}</option>
                  ))}
                </select>
              </label>
              <div className={styles.formActions}>
                <button type="submit" className={styles.saveBtn}>
                  {editingId ? get("schedule.form.saveChanges") : get("schedule.form.addSession")}
                </button>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>
                  {get("common.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
