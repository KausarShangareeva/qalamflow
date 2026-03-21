import { useRef, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCopy } from "../../hooks/useCopy";
import TagIcon from "../../components/TagIcon";
import { useAvatar } from "../../hooks/useAvatar";
import UserAvatar from "../../components/UserAvatar";
import { usePlans } from "./hooks/usePlans";
import type { ScheduleEntry } from "./types";
import styles from "./Workspace.module.css";
import PDFPlanList from "./components/PDFPlanList";
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
    activePlanId,
    setActivePlanId,
    savePlan,
    updatePlan,
    loadPlan,
    deletePlan,
  } = usePlans();

  const pageRef = useRef<HTMLDivElement>(null);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [orientation, setOrientation] = useState<Orientation>("vertical");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedScheduleLength, setSavedScheduleLength] = useState(0);

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
      deletePlan(planId);
      if (activePlanId === planId) {
        setSchedule([]);
        setActivePlanId(null);
      }
    },
    [deletePlan, activePlanId, setActivePlanId],
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
    </div>
  );
}
