import { useRef, useState, useCallback, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCopy } from "../../hooks/useCopy";
import TagIcon from "../../components/TagIcon";
import { useAvatar } from "../../hooks/useAvatar";
import UserAvatar from "../../components/UserAvatar";
import { usePlans } from "./hooks/usePlans";
import type { ScheduleEntry, SavedPlan } from "./types";
import styles from "./Workspace.module.css";
import PDFPlanList from "./components/PDFPlanList";
import UndoToast from "../../components/UndoToast";
import WeekPlan from "./components/WeekPlan";
import AudioPlayer from "./components/AudioPlayer";

type Orientation = "vertical" | "horizontal";

function getGreetingEmoji(): string {
  const h = new Date().getHours();
  if (h < 6) return "🌙";
  if (h < 12) return "☀️";
  if (h < 18) return "🌤️";
  return "✨";
}

function getGreetingKey(): string {
  const h = new Date().getHours();
  if (h < 6) return "workspace.greetingNight";
  if (h < 12) return "workspace.greetingMorning";
  if (h < 18) return "workspace.greetingAfternoon";
  return "workspace.greetingEvening";
}

export default function Workspace() {
  const { user } = useAuth();
  const { get } = useCopy();
  const firstName = user?.name?.split(" ")[0] ?? "";
  const { uploadAvatar } = useAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    plans,
    plansReady,
    activePlanId,
    setActivePlanId,
    savePlan,
    updatePlan,
    loadPlan,
    deletePlan,
    restorePlan,
  } = usePlans();

  const pageRef = useRef<HTMLDivElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activePlanIdRef = useRef(activePlanId);
  activePlanIdRef.current = activePlanId;

  const [schedule, setSchedule] = useState<ScheduleEntry[]>(() => {
    try {
      const raw = localStorage.getItem("qalamflow_draft_schedule");
      return raw ? (JSON.parse(raw) as ScheduleEntry[]) : [];
    } catch { return []; }
  });
  const [orientation, setOrientation] = useState<Orientation>(() => {
    return (localStorage.getItem("qalamflow_draft_orientation") as Orientation) || "vertical";
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedScheduleLength, setSavedScheduleLength] = useState(0);
  const [deletedPlan, setDeletedPlan] = useState<SavedPlan | null>(null);
  const deletedPlanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ctrl+Z to undo plan deletion
  const deletedPlanRef = useRef<SavedPlan | null>(null);
  deletedPlanRef.current = deletedPlan;
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && deletedPlanRef.current) {
        restorePlan(deletedPlanRef.current);
        setDeletedPlan(null);
        if (deletedPlanTimerRef.current) clearTimeout(deletedPlanTimerRef.current);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [restorePlan]);

  // 1. Save raw draft immediately on every change (survives any crash/reload)
  useEffect(() => {
    localStorage.setItem("qalamflow_draft_schedule", JSON.stringify(schedule));
    localStorage.setItem("qalamflow_draft_orientation", orientation);
  }, [schedule, orientation]);

  // 2. Also auto-save into PDFPlanList after 800ms of no activity
  useEffect(() => {
    if (!plansReady) return;
    if (schedule.length === 0) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (activePlanIdRef.current) {
        updatePlan(activePlanIdRef.current, schedule, orientation);
      } else {
        const plan = savePlan(schedule, orientation);
        setActivePlanId(plan.id);
      }
      setHasUnsavedChanges(false);
      setSavedScheduleLength(schedule.length);
    }, 800);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [plansReady, schedule, orientation, savePlan, updatePlan, setActivePlanId]);

  const handleScheduleChange = useCallback((newSchedule: ScheduleEntry[]) => {
    setSchedule(newSchedule);
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    if (schedule.length === 0) return;
    if (activePlanId) {
      updatePlan(activePlanId, schedule, orientation);
    } else {
      const plan = savePlan(schedule, orientation);
      setActivePlanId(plan.id);
    }
    setHasUnsavedChanges(false);
    setSavedScheduleLength(schedule.length);
  }, [schedule, orientation, activePlanId, updatePlan, savePlan, setActivePlanId]);

  const handleCreateNew = useCallback(() => {
    if (schedule.length > 0) {
      if (activePlanId) {
        updatePlan(activePlanId, schedule, orientation);
      } else {
        savePlan(schedule, orientation);
      }
    }
    setSchedule([]);
    setActivePlanId(null);
    localStorage.removeItem("qalamflow_draft_schedule");
    localStorage.removeItem("qalamflow_draft_orientation");
    pageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [schedule, orientation, activePlanId, updatePlan, savePlan, setActivePlanId]);

  const handleLoadPlan = useCallback(
    (planId: string) => {
      const plan = loadPlan(planId);
      if (plan) {
        setSchedule(plan.schedule);
        setOrientation(plan.orientation);
        setHasUnsavedChanges(false);
        setSavedScheduleLength(plan.schedule.length);
        pageRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    },
    [loadPlan],
  );

  const handleDeletePlan = useCallback(
    (planId: string) => {
      const plan = plans.find((p) => p.id === planId);
      if (plan) {
        setDeletedPlan(plan);
        if (deletedPlanTimerRef.current) clearTimeout(deletedPlanTimerRef.current);
        deletedPlanTimerRef.current = setTimeout(() => setDeletedPlan(null), 10000);
      }
      deletePlan(planId);
      if (activePlanId === planId) {
        setSchedule([]);
        setActivePlanId(null);
      }
    },
    [deletePlan, activePlanId, setActivePlanId, plans],
  );

  return (
    <div className={styles.page} ref={pageRef}>
      <header className={styles.hero}>
        <div className={styles.heroLeft}>
          <UserAvatar
            name={firstName}
            size={64}
            isCurrentUser
            showEditOverlay
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadAvatar(file);
              e.target.value = "";
            }}
          />
          <div className={styles.heroText}>
            <p className={styles.greeting}>
              <TagIcon icon={getGreetingEmoji()} size={22} /> {get(getGreetingKey())}, <span className={styles.name}>{firstName}</span>
            </p>
            <p className={styles.subtitle}>{get("workspace.subtitle")}</p>
          </div>
        </div>
        <AudioPlayer />
        <div className={styles.heroAccent} aria-hidden />
      </header>

      <WeekPlan
        schedule={schedule}
        onScheduleChange={handleScheduleChange}
        orientation={orientation}
        onOrientationChange={setOrientation}
        onSave={handleSave}
        canSave={hasUnsavedChanges && schedule.length > 0}
        savedScheduleLength={savedScheduleLength}
      />

      <PDFPlanList
        plans={plans}
        activePlanId={activePlanId}
        onLoadPlan={handleLoadPlan}
        onCreateNew={handleCreateNew}
        onDeletePlan={handleDeletePlan}
      />

      {deletedPlan && (
        <UndoToast
          message={deletedPlan.title}
          onUndo={() => {
            restorePlan(deletedPlan);
            setDeletedPlan(null);
            if (deletedPlanTimerRef.current) clearTimeout(deletedPlanTimerRef.current);
          }}
        />
      )}
    </div>
  );
}
