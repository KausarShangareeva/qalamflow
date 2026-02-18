import { useRef, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { usePlans } from "./hooks/usePlans";
import type { ScheduleEntry } from "./types";
import styles from "./Workspace.module.css";
import PDFPlanList from "./components/PDFPlanList";
import WeekPlan from "./components/WeekPlan";

type Orientation = "vertical" | "horizontal";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "🌙 Доброй ночи";
  if (h < 12) return "☀️ Доброе утро";
  if (h < 18) return "🌤️ Добрый день";
  return "🌅 Добрый вечер";
}

export default function Workspace() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "";

  const { plans, activePlanId, setActivePlanId, savePlan, updatePlan, loadPlan, deletePlan } =
    usePlans();

  const pageRef = useRef<HTMLDivElement>(null);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [orientation, setOrientation] = useState<Orientation>("vertical");

  const handleScheduleChange = useCallback((newSchedule: ScheduleEntry[]) => {
    setSchedule(newSchedule);
  }, []);

  // Save button in WeekPlan toolbar
  const handleSave = useCallback(() => {
    if (schedule.length === 0) return;
    if (activePlanId) {
      updatePlan(activePlanId, schedule, orientation);
    } else {
      const plan = savePlan(schedule, orientation);
      setActivePlanId(plan.id);
    }
  }, [schedule, orientation, activePlanId, updatePlan, savePlan, setActivePlanId]);

  // "Создать новый план" in PDFPlanList
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

  // Click on a saved plan card
  const handleLoadPlan = useCallback(
    (planId: string) => {
      const plan = loadPlan(planId);
      if (plan) {
        setSchedule(plan.schedule);
        setOrientation(plan.orientation);
      }
    },
    [loadPlan],
  );

  // Delete plan
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
        <div className={styles.heroText}>
          <p className={styles.greeting}>{getGreeting()},</p>
          <h1 className={styles.name}>{firstName}</h1>
          <p className={styles.subtitle}>Спланируй свою неделю</p>
        </div>
        <div className={styles.heroAccent} aria-hidden />
      </header>

      <WeekPlan
        schedule={schedule}
        onScheduleChange={handleScheduleChange}
        orientation={orientation}
        onOrientationChange={setOrientation}
        onSave={handleSave}
        canSave={schedule.length > 0}
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
