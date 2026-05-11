import { useCopy } from "../hooks/useCopy";
import styles from "./UndoToast.module.css";

interface UndoToastProps {
  message: string;
  onUndo: () => void;
}

export default function UndoToast({ message, onUndo }: UndoToastProps) {
  const { get } = useCopy();
  return (
    <div className={styles.toast}>
      <span>
        {get("common.undoToastDeleted", { message })}{" "}
        <span className={styles.ctrlHint}>
          {get("common.undoToastHint")}{" "}
          <kbd className={styles.kbd}>Ctrl+Z</kbd>{" "}
          {get("common.undoToastOr")}{" "}
        </span>
      </span>
      <button className={styles.btn} onClick={onUndo}>
        {get("common.undoToastButton")}
      </button>
    </div>
  );
}
