import { useEffect, useRef, useState, type FormEvent } from "react";
import { Trash2, Pencil, Check, X } from "lucide-react";
import TagIcon from "../components/TagIcon";
import { useAuth } from "../context/AuthContext";
import { useCopy } from "../hooks/useCopy";
import { useAvatar } from "../hooks/useAvatar";
import { api } from "../api/client";
import CTAButton from "../components/CTAButton";
import UserAvatar from "../components/UserAvatar";
import type { FeedbackEntry, FeedbackPayload } from "../api/types";
import styles from "./Feedback.module.css";

const initialForm: FeedbackPayload = {
  name: "",
  email: "",
  rating: 5,
  message: "",
  location: "",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getReactionTag(rating: number): {
  labelKey: string;
  emoji: string;
  className: string;
} {
  if (rating >= 5)
    return {
      labelKey: "feedbackPage.reactionLove",
      emoji: "✨",
      className: "tagLove",
    };
  if (rating >= 3)
    return {
      labelKey: "feedbackPage.reactionDecent",
      emoji: "💛",
      className: "tagDecent",
    };
  return {
    labelKey: "feedbackPage.reactionBad",
    emoji: "🎈",
    className: "tagBad",
  };
}

export default function FeedbackPage() {
  const { user } = useAuth();
  const { get } = useCopy();
  const { customAvatar, uploadAvatar } = useAvatar();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FeedbackPayload>({
    ...initialForm,
    name: user?.name || "",
    email: user?.email || "",
  });
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [editSaving, setEditSaving] = useState(false);

  const formReactionOptions = [
    {
      value: 1,
      emoji: "🎈",
      labelKey: "feedbackPage.reactionBad",
      typeClass: styles.reactionTypeBad,
      activeClass: styles.reactionActiveBad,
    },
    {
      value: 3,
      emoji: "💛",
      labelKey: "feedbackPage.reactionDecent",
      typeClass: styles.reactionTypeDecent,
      activeClass: styles.reactionActiveDecent,
    },
    {
      value: 5,
      emoji: "✨",
      labelKey: "feedbackPage.reactionLove",
      typeClass: styles.reactionTypeLove,
      activeClass: styles.reactionActiveLove,
    },
  ];

  const displayName = (user?.name || form.name || "Guest").trim();

  useEffect(() => {
    api
      .get<FeedbackEntry[]>("/feedback")
      .then((data) => setFeedbackList(data))
      .catch(() => setFeedbackList([]))
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      email: prev.email || user.email || "",
    }));
  }, [user]);

  const isOwn = (entry: FeedbackEntry) => {
    if (!user) return false;
    if (entry.userId !== null && user.id) {
      if (String(entry.userId) === String(user.id)) return true;
    }
    return entry.name.trim() === displayName;
  };

  const startEdit = (entry: FeedbackEntry) => {
    setEditingId(entry._id);
    setEditMessage(entry.message);
    setEditRating(entry.rating);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    setEditSaving(true);
    try {
      const updated = await api.patch<FeedbackEntry>(`/feedback/${id}`, {
        message: editMessage,
        rating: editRating,
      });
      setFeedbackList((prev) => prev.map((e) => (e._id === id ? updated : e)));
      setEditingId(null);
    } catch {
      // silent
    } finally {
      setEditSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await api.delete(`/feedback/${id}`);
      setFeedbackList((prev) => prev.filter((e) => e._id !== id));
    } catch {
      // silent
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const payload: FeedbackPayload = {
      ...form,
      name: user?.name || form.name,
      email: user?.email || form.email,
      avatarUrl: customAvatar || user?.avatar || "",
    };

    // Optimistic update — show immediately without waiting for server
    const tempId = `temp-${Date.now()}`;
    const optimisticEntry: FeedbackEntry = {
      _id: tempId,
      userId: user?.id || null,
      name: payload.name,
      rating: payload.rating,
      message: payload.message,
      location: payload.location || "",
      avatarUrl: payload.avatarUrl || "",
      createdAt: new Date().toISOString(),
    };
    setFeedbackList((prev) => [optimisticEntry, ...prev]);
    setForm({
      ...initialForm,
      name: user?.name || "",
      email: user?.email || "",
    });
    setSubmitting(false);

    // Sync with server in background
    api
      .post<FeedbackEntry>("/feedback", payload)
      .then((created) => {
        setFeedbackList((prev) =>
          prev.map((e) => (e._id === tempId ? created : e)),
        );
      })
      .catch((err) => {
        setFeedbackList((prev) => prev.filter((e) => e._id !== tempId));
        setForm(payload);
        setError(
          err instanceof Error ? err.message : "Failed to submit feedback",
        );
      });
  };

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>
          {get("feedbackPage.heroTitle")}{" "}
          <span className={styles.brand}>
            {get("feedbackPage.heroTitleBrand")}
          </span>{" "}
          {get("feedbackPage.heroTitleSuffix")}
        </h2>
      </header>

      <div className={styles.gap}>
        <aside className={styles.feed}>
          <p className={styles.sectionLabel}>{get("feedbackPage.reviewsLabel")}</p>
          {loadingList && (
            <p className={styles.empty}>{get("feedbackPage.loading")}</p>
          )}
          {!loadingList && !feedbackList.length && (
            <p className={styles.empty}>{get("feedbackPage.empty")}</p>
          )}

          {feedbackList.length > 0 && (
            <div className={styles.list}>
              {feedbackList.map((entry) => {
                const reaction = getReactionTag(entry.rating);
                const own = isOwn(entry);
                const isEditing = editingId === entry._id;

                return (
                  <article key={entry._id} className={styles.card}>
                    <UserAvatar
                      name={entry.name}
                      size={40}
                      isCurrentUser={own}
                      avatarUrl={entry.avatarUrl}
                    />
                    <div className={styles.cardContent}>
                      <div className={styles.cardMeta}>
                        <div className={styles.cardInfo}>
                          <strong className={styles.cardName}>
                            {entry.name}
                            {!entry.userId && (
                              <span className={styles.guestLabel}>
                                {get("feedbackPage.guest")}
                              </span>
                            )}
                          </strong>
                          <span className={styles.cardDate}>
                            {formatDate(entry.createdAt)}
                          </span>
                        </div>
                        {own && !isEditing && (
                          <div className={styles.cardActions}>
                            <button
                              type="button"
                              className={styles.editBtn}
                              onClick={() => startEdit(entry)}
                              aria-label="Edit feedback"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              className={styles.deleteBtn}
                              onClick={() => onDelete(entry._id)}
                              aria-label="Delete feedback"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                        {!isEditing && (
                          <span
                            className={`${styles.reactionTag} ${styles[reaction.className]}`}
                          >
                            <TagIcon icon={reaction.emoji} size={20} />
                            {get(reaction.labelKey)}
                          </span>
                        )}
                      </div>

                      {isEditing ? (
                        <div className={styles.editArea}>
                          <div className={styles.editRatingRow}>
                            {[
                              {
                                value: 1,
                                emoji: "💚",
                                labelKey: "feedbackPage.reactionBad",
                              },
                              {
                                value: 3,
                                emoji: "🌿",
                                labelKey: "feedbackPage.reactionDecent",
                              },
                              {
                                value: 5,
                                emoji: "✨",
                                labelKey: "feedbackPage.reactionLove",
                              },
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                className={`${styles.editRatingBtn} ${editRating === opt.value ? styles.editRatingActive : ""}`}
                                onClick={() => setEditRating(opt.value)}
                              >
                                {opt.emoji} {get(opt.labelKey)}
                              </button>
                            ))}
                          </div>
                          <textarea
                            className={styles.editTextarea}
                            value={editMessage}
                            onChange={(e) => setEditMessage(e.target.value)}
                            rows={3}
                            autoFocus
                          />
                          <div className={styles.editActions}>
                            <button
                              type="button"
                              className={styles.saveBtn}
                              onClick={() => saveEdit(entry._id)}
                              disabled={editSaving || !editMessage.trim()}
                            >
                              <Check size={14} />
                              {editSaving
                                ? get("feedbackPage.saving")
                                : get("feedbackPage.save")}
                            </button>
                            <button
                              type="button"
                              className={styles.cancelBtn}
                              onClick={cancelEdit}
                            >
                              <X size={14} />
                              {get("feedbackPage.cancel")}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className={styles.cardMessage}>{entry.message}</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </aside>

        <form onSubmit={onSubmit} className={styles.form}>
          <p className={styles.sectionLabel}>{get("feedbackPage.formLabel")}</p>
          <div className={styles.authorCard}>
            <div className={styles.authorMain}>
              <UserAvatar
                name={displayName}
                size={44}
                isCurrentUser
                showEditOverlay={!!user}
                onClick={
                  user ? () => avatarInputRef.current?.click() : undefined
                }
              />
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadAvatar(file);
                  e.target.value = "";
                }}
              />
              <div className={styles.authorMeta}>
                <div className={styles.authorNameRow}>
                  <h2>
                    {displayName}
                    {!user && (
                      <span className={styles.guestLabel}>
                        {get("feedbackPage.guest")}
                      </span>
                    )}
                  </h2>
                  <span className={styles.authorDate}>
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date())}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.authorActions}>
              <p className={styles.rateTitle}>
                {get("feedbackPage.rateTitle")}
              </p>
              <div className={styles.reactionGroup}>
                {formReactionOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, rating: option.value }))
                    }
                    className={`${styles.reactionButton} ${option.typeClass} ${form.rating === option.value ? option.activeClass : ""}`}
                  >
                    <TagIcon icon={option.emoji} size={18} />
                    {get(option.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}

          {!user && (
            <div className={styles.row}>
              <label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder={get("feedbackPage.namePlaceholder")} // Текст теперь внутри
                  required
                />
              </label>
            </div>
          )}

          <label className={styles.message}>
            <textarea
              className={styles.messageArea}
              value={form.message}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, message: e.target.value }))
              }
              rows={6}
              placeholder={get("feedbackPage.messagePlaceholder")}
              required
            />
          </label>

          <div className={styles.submitRow}>
            <CTAButton type="submit" disabled={submitting} className={styles.fullWidthBtn} noShadow>
              {submitting
                ? get("feedbackPage.submitting")
                : get("feedbackPage.submit")}
            </CTAButton>
          </div>
        </form>
      </div>
    </section>
  );
}
