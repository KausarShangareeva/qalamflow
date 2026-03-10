import { useState } from "react";
import { useCopy } from "../../../hooks/useCopy";
import SectionHeader from "../../../components/SectionHeader";
import styles from "./EnvelopePreview.module.css";

export default function EnvelopePreview() {
  const { get } = useCopy();
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <section id="envelope" className={styles.previewSection}>
      <SectionHeader
        title={get("envelopePreview.title")}
        subtitle={get("envelopePreview.subtitle")}
        titleWidth="60%"
      />

      <div className={styles.envelopeWrapper}>
        <div className={styles.envelope}>
          {/* Front base of envelope */}
          <div className={styles.coverLeft} />
          <div className={styles.coverRight} />

          {/* Cards inside */}
          <button
            type="button"
            className={`${styles.card} ${styles.cardLeft}`}
            onClick={() => setLightbox("/example-1.png")}
            aria-label="View schedule example 1"
          >
            <img
              src="/example-1.png"
              alt="Schedule example 1"
              className={styles.cardImg}
              loading="lazy"
            />
          </button>
          <button
            type="button"
            className={`${styles.card} ${styles.cardRight}`}
            onClick={() => setLightbox("/example-2.png")}
            aria-label="View schedule example 2"
          >
            <img
              src="/example-2.png"
              alt="Schedule example 2"
              className={styles.cardImg}
              loading="lazy"
            />
          </button>

          {/* Central placeholder */}
          <div className={styles.placeholder} />

          {/* Back flap of envelope */}
          <div className={styles.flap} />
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Schedule preview"
        >
          <img
            src={lightbox}
            alt="Schedule preview"
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setLightbox(null)}
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
}
