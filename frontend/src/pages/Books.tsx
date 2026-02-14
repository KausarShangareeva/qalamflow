import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api/client";
import type { Book } from "../api/types";
import styles from "./Books.module.css";

interface BookForm {
  title: string;
  author: string;
  level: Book["level"];
  pages: string;
}

const EMPTY_FORM: BookForm = { title: "", author: "", level: "beginner", pages: "" };

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BookForm>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [progressInputs, setProgressInputs] = useState<Record<string, string>>({});

  const fetchBooks = async () => {
    try {
      const data = await api.get<Book[]>("/books");
      setBooks(data);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchBooks(); }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (book: Book) => {
    setForm({
      title: book.title,
      author: book.author,
      level: book.level,
      pages: String(book.pages),
    });
    setEditingId(book._id);
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const body = { ...form, pages: Number(form.pages) };
    try {
      if (editingId) {
        await api.put(`/books/${editingId}`, body);
      } else {
        await api.post("/books", body);
      }
      setShowForm(false);
      fetchBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    await api.delete(`/books/${id}`);
    fetchBooks();
  };

  const handleLogProgress = async (bookId: string) => {
    const pages = Number(progressInputs[bookId]);
    if (!pages || pages <= 0) return;
    try {
      await api.post("/progress", { bookId, pagesRead: pages, timeSpent: 0 });
      setProgressInputs((prev) => ({ ...prev, [bookId]: "" }));
      fetchBooks();
    } catch { /* empty */ }
  };

  const pct = (book: Book) =>
    book.pages > 0 ? Math.min(100, Math.round((book.progress / book.pages) * 100)) : 0;

  if (loading) return <p>Loading books...</p>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1>My Books</h1>
        <button className={styles.addButton} onClick={openAdd}>+ Add Book</button>
      </div>

      {books.length === 0 ? (
        <p className={styles.empty}>
          You haven't added any books yet.<br />
          Start your journey — add your first book!
        </p>
      ) : (
        <div className={styles.list}>
          {books.map((book) => (
            <div key={book._id} className={styles.bookCard}>
              <div className={styles.bookTop}>
                <div className={styles.bookInfo}>
                  <h3>{book.title}</h3>
                  <div className={styles.bookMeta}>
                    <span>by {book.author}</span>
                    <span>{book.pages} pages</span>
                    <span className={`${styles.badge} ${
                      book.status === "completed" ? styles.badgeCompleted : styles.badgeStudying
                    }`}>
                      {book.status === "completed" ? "Completed" : "Studying"}
                    </span>
                    <span className={styles.badge}>{book.level}</span>
                  </div>
                </div>
                <div className={styles.bookActions}>
                  <button className={styles.editBtn} onClick={() => openEdit(book)}>Edit</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(book._id)}>Delete</button>
                </div>
              </div>

              <div className={styles.progressSection}>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${pct(book)}%` }} />
                </div>
                <span className={styles.progressText}>{book.progress}/{book.pages} ({pct(book)}%)</span>
                <input
                  type="number"
                  className={styles.progressInput}
                  placeholder="pages"
                  min={1}
                  value={progressInputs[book._id] || ""}
                  onChange={(e) =>
                    setProgressInputs((prev) => ({ ...prev, [book._id]: e.target.value }))
                  }
                />
                <button className={styles.progressBtn} onClick={() => handleLogProgress(book._id)}>
                  Log
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className={styles.overlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {editingId ? "Edit Book" : "Add a New Book"}
            </h2>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.label}>
                Book Title
                <input
                  type="text"
                  placeholder="e.g. Al-Ajurrumiyyah"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </label>
              <label className={styles.label}>
                Author
                <input
                  type="text"
                  placeholder="e.g. Ibn Ajurrum"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  required
                />
              </label>
              <div className={styles.formRow}>
                <label className={styles.label}>
                  Level
                  <select
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value as Book["level"] })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </label>
                <label className={styles.label}>
                  Total Pages
                  <input
                    type="number"
                    placeholder="e.g. 120"
                    min={1}
                    value={form.pages}
                    onChange={(e) => setForm({ ...form, pages: e.target.value })}
                    required
                  />
                </label>
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.saveBtn}>
                  {editingId ? "Save Changes" : "Add Book"}
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
