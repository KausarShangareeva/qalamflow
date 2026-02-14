import { useState, useEffect } from "react";
import { useCopy } from "../hooks/useCopy";
import styles from "./PWAInstallPrompt.module.css";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const { get } = useCopy();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Show manual instructions if browser doesn't support install prompt
      setShowInstructions(true);
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  // Don't show if dismissed previously
  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissed) {
      setShowPrompt(false);
    }
  }, []);

  if (!showPrompt && !showInstructions) return null;

  return (
    <>
      {showPrompt && (
        <div className={styles.banner}>
          <div className={styles.content}>
            <div className={styles.icon}>📱</div>
            <div className={styles.text}>
              <strong>{get("pwa.install.banner.title")}</strong>
              <p>{get("pwa.install.banner.description")}</p>
            </div>
            <div className={styles.actions}>
              <button className={styles.installBtn} onClick={handleInstallClick}>
                {get("pwa.install.banner.installButton")}
              </button>
              <button className={styles.dismissBtn} onClick={handleDismiss}>
                {get("pwa.install.banner.dismissButton")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInstructions && (
        <div className={styles.overlay} onClick={() => setShowInstructions(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{get("pwa.install.modal.title")}</h2>
              <button className={styles.closeBtn} onClick={() => setShowInstructions(false)}>
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <section className={styles.section}>
                <h3>{get("pwa.install.modal.ios.title")}</h3>
                <ol>
                  <li>{get("pwa.install.modal.ios.step1")}<strong>{get("pwa.install.modal.ios.safari")}</strong></li>
                  <li>{get("pwa.install.modal.ios.step2")}<strong>{get("pwa.install.modal.ios.shareButton")}</strong>{get("pwa.install.modal.ios.step2b")}</li>
                  <li>{get("pwa.install.modal.ios.step3")}<strong>{get("pwa.install.modal.ios.addToHomeScreen")}</strong></li>
                  <li>{get("pwa.install.modal.ios.step4")}<strong>{get("pwa.install.modal.ios.tapAdd")}</strong>{get("pwa.install.modal.ios.step4b")}</li>
                </ol>
              </section>

              <section className={styles.section}>
                <h3>{get("pwa.install.modal.android.title")}</h3>
                <ol>
                  <li>{get("pwa.install.modal.android.step1")}<strong>{get("pwa.install.modal.android.chrome")}</strong></li>
                  <li>{get("pwa.install.modal.android.step2")}<strong>{get("pwa.install.modal.android.menu")}</strong>{get("pwa.install.modal.android.step2b")}</li>
                  <li>{get("pwa.install.modal.android.step3")}<strong>{get("pwa.install.modal.android.addToHome")}</strong>{get("pwa.install.modal.android.step3b")}<strong>{get("pwa.install.modal.android.installApp")}</strong></li>
                  <li>{get("pwa.install.modal.android.step4")}<strong>{get("pwa.install.modal.android.install")}</strong>{get("pwa.install.modal.android.step4b")}</li>
                </ol>
              </section>

              <section className={styles.section}>
                <h3>{get("pwa.install.modal.desktop.title")}</h3>
                <ol>
                  <li>{get("pwa.install.modal.desktop.step1")}<strong>{get("pwa.install.modal.desktop.installIcon")}</strong>{get("pwa.install.modal.desktop.step1b")}</li>
                  <li>{get("pwa.install.modal.desktop.step2")}<strong>{get("pwa.install.modal.desktop.menu")}</strong>{get("pwa.install.modal.desktop.step2b")}</li>
                  <li>{get("pwa.install.modal.desktop.step3")}<strong>{get("pwa.install.modal.desktop.installQalamFlow")}</strong>{get("pwa.install.modal.desktop.step3b")}<strong>{get("pwa.install.modal.desktop.createShortcut")}</strong></li>
                  <li>{get("pwa.install.modal.desktop.step4")}<strong>{get("pwa.install.modal.desktop.install")}</strong>{get("pwa.install.modal.desktop.step4b")}</li>
                </ol>
              </section>

              <div className={styles.benefits}>
                <h4>{get("pwa.install.modal.benefits.title")}</h4>
                <ul>
                  <li>✅ {get("pwa.install.modal.benefits.fastLoading")}</li>
                  <li>✅ {get("pwa.install.modal.benefits.worksOffline")}</li>
                  <li>✅ {get("pwa.install.modal.benefits.nativeExperience")}</li>
                  <li>✅ {get("pwa.install.modal.benefits.quickAccess")}</li>
                  <li>✅ {get("pwa.install.modal.benefits.noAppStore")}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
