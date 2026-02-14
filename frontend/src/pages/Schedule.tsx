import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api/client";
import type { ScheduleItem, Book } from "../api/types";
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

  const byDay = (day: string) => items.filter((i) => i.dayOfWeek === day);

  if (loading) return <p>Loading schedule...</p>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1>My Weekly Schedule</h1>
        <button className={styles.addButton} onClick={() => openAdd()}>+ Add Session</button>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>
          No study sessions planned yet.<br />
          Organize your week — consistency is the path to mastery!
        </p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Day</th>
              <th>Sessions</th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => {
              const sessions = byDay(day);
              return (
                <tr key={day}>
                  <td className={styles.dayLabel}>{day}</td>
                  <td>
                    {sessions.length === 0 ? (
                      <span style={{ color: "var(--color-text-muted)", fontSize: "var(--fs-xs)" }}>—</span>
                    ) : (
                      sessions.map((s) => (
                        <span key={s._id} className={styles.sessionChip}>
                          <span className={styles.sessionTime}>{s.time}</span>
                          <span className={styles.sessionActivity}>{s.activity}</span>
                          <span className={styles.chipActions}>
                            <button className={styles.chipBtn} onClick={() => openEdit(s)}>edit</button>
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
              {editingId ? "Edit Session" : "Add Study Session"}
            </h2>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <label className={styles.label}>
                  Day
                  <select
                    value={form.dayOfWeek}
                    onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </label>
                <label className={styles.label}>
                  Time
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    required
                  />
                </label>
              </div>
              <label className={styles.label}>
                Activity
                <input
                  type="text"
                  placeholder="e.g. Read Nahw chapter 3"
                  value={form.activity}
                  onChange={(e) => setForm({ ...form, activity: e.target.value })}
                  required
                />
              </label>
              <label className={styles.label}>
                Linked Book (optional)
                <select
                  value={form.bookId}
                  onChange={(e) => setForm({ ...form, bookId: e.target.value })}
                >
                  <option value="">— None —</option>
                  {books.map((b) => (
                    <option key={b._id} value={b._id}>{b.title}</option>
                  ))}
                </select>
              </label>
              <div className={styles.formActions}>
                <button type="submit" className={styles.saveBtn}>
                  {editingId ? "Save Changes" : "Add Session"}
                </button>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
