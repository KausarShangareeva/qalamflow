import { useState, useEffect } from "react";
import styles from "./PWAInstallPrompt.module.css";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
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
              <strong>Install QalamFlow</strong>
              <p>Install our app for a better experience!</p>
            </div>
            <div className={styles.actions}>
              <button className={styles.installBtn} onClick={handleInstallClick}>
                Install
              </button>
              <button className={styles.dismissBtn} onClick={handleDismiss}>
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {showInstructions && (
        <div className={styles.overlay} onClick={() => setShowInstructions(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Install QalamFlow</h2>
              <button className={styles.closeBtn} onClick={() => setShowInstructions(false)}>
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <section className={styles.section}>
                <h3>📱 On Mobile (iOS)</h3>
                <ol>
                  <li>Open QalamFlow in <strong>Safari</strong></li>
                  <li>Tap the <strong>Share</strong> button (square with arrow)</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                  <li>Tap <strong>"Add"</strong> to confirm</li>
                </ol>
              </section>

              <section className={styles.section}>
                <h3>📱 On Mobile (Android)</h3>
                <ol>
                  <li>Open QalamFlow in <strong>Chrome</strong></li>
                  <li>Tap the <strong>menu</strong> (three dots)</li>
                  <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></li>
                  <li>Tap <strong>"Install"</strong> to confirm</li>
                </ol>
              </section>

              <section className={styles.section}>
                <h3>💻 On Desktop (Chrome/Edge)</h3>
                <ol>
                  <li>Look for the <strong>install icon</strong> in the address bar</li>
                  <li>Or click the <strong>menu</strong> (three dots)</li>
                  <li>Select <strong>"Install QalamFlow"</strong> or <strong>"Create shortcut"</strong></li>
                  <li>Click <strong>"Install"</strong> to confirm</li>
                </ol>
              </section>

              <div className={styles.benefits}>
                <h4>✨ Benefits of Installing:</h4>
                <ul>
                  <li>✅ Faster loading times</li>
                  <li>✅ Works offline</li>
                  <li>✅ Native app experience</li>
                  <li>✅ Quick access from home screen</li>
                  <li>✅ No app store required</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
