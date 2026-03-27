import styles from "./UndoToast.module.css";

interface UndoToastProps {
  message: string;
  onUndo: () => void;
}

export default function UndoToast({ message, onUndo }: UndoToastProps) {
  return (
    <div className={styles.toast}>
      <span>
        «{message}» удалён —{" "}
        <span className={styles.ctrlHint}>нажмите <kbd className={styles.kbd}>Ctrl+Z</kbd> или </span>
      </span>
      <button className={styles.btn} onClick={onUndo}>
        ↩ Вернуть
      </button>
    </div>
  );
}
