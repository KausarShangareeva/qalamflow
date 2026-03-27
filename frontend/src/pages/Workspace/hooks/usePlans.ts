import { useState, useEffect, useCallback, useRef } from "react";
import type { SavedPlan, ScheduleEntry } from "../types";
import {
  generatePlanTitle,
  generatePlanDescription,
  getDominantColor,
} from "../utils/planHelpers";
import { api } from "../../../api/client";

const ACTIVE_PLAN_KEY = "qalamflow_active_plan_id";
const LEGACY_STORAGE_KEY = "qalamflow_saved_plans";
const MIGRATION_DONE_KEY = "qalamflow_plans_migrated";

const OLD_DAY_MAP: Record<string, string> = {
  Mon: "Понедельник",
  Tue: "Вторник",
  Wed: "Среда",
  Thu: "Четверг",
  Fri: "Пятница",
  Sat: "Суббота",
  Sun: "Воскресенье",
  Monday: "Понедельник",
  Tuesday: "Вторник",
  Wednesday: "Среда",
  Thursday: "Четверг",
  Friday: "Пятница",
  Saturday: "Суббота",
  Sunday: "Воскресенье",
};

function migratePlan(plan: SavedPlan): SavedPlan {
  const needsMigration = plan.schedule.some((e) => OLD_DAY_MAP[e.day]);
  if (!needsMigration) return plan;
  return {
    ...plan,
    schedule: plan.schedule.map((e) => ({
      ...e,
      day: OLD_DAY_MAP[e.day] ?? e.day,
    })),
  };
}

function buildPlanMeta(schedule: ScheduleEntry[], orientation: "vertical" | "horizontal") {
  return {
    color: getDominantColor(schedule),
    title: generatePlanTitle(schedule),
    description: generatePlanDescription(schedule),
    schedule,
    orientation,
  };
}

export function usePlans() {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [plansReady, setPlansReady] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(
    localStorage.getItem(ACTIVE_PLAN_KEY),
  );
  const loadedRef = useRef(false);

  // Load plans from server on mount, migrate localStorage plans if needed
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    api.get<SavedPlan[]>("/plans")
      .then(async (serverPlans) => {
        const migrated = serverPlans.map(migratePlan);

        // One-time migration: upload localStorage plans not yet on server
        const alreadyMigrated = localStorage.getItem(MIGRATION_DONE_KEY);
        if (!alreadyMigrated) {
          try {
            const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
            const localPlans: SavedPlan[] = raw ? JSON.parse(raw) : [];
            const serverIds = new Set(migrated.map((p) => p.id));
            const toUpload = localPlans
              .map(migratePlan)
              .filter((p) => !serverIds.has(p.id));

            if (toUpload.length > 0) {
              const uploaded = await Promise.all(
                toUpload.map((p) => api.post<SavedPlan>("/plans", p).catch(() => null))
              );
              const successful = uploaded.filter(Boolean) as SavedPlan[];
              setPlans([...migrated, ...successful]);
            } else {
              setPlans(migrated);
            }
          } catch {
            setPlans(migrated);
          }
          localStorage.setItem(MIGRATION_DONE_KEY, "1");
        } else {
          setPlans(migrated);
        }
        setPlansReady(true);
      })
      .catch(() => {
        // Not logged in or network error — start empty
        setPlans([]);
        setPlansReady(true);
      });
  }, []);

  useEffect(() => {
    if (activePlanId) {
      localStorage.setItem(ACTIVE_PLAN_KEY, activePlanId);
    } else {
      localStorage.removeItem(ACTIVE_PLAN_KEY);
    }
  }, [activePlanId]);

  const savePlan = useCallback(
    (schedule: ScheduleEntry[], orientation: "vertical" | "horizontal"): SavedPlan => {
      const newPlan: SavedPlan = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...buildPlanMeta(schedule, orientation),
      };
      setPlans((prev) => [newPlan, ...prev]);
      api.post("/plans", newPlan).catch(() => {});
      return newPlan;
    },
    [],
  );

  const updatePlan = useCallback(
    (id: string, schedule: ScheduleEntry[], orientation: "vertical" | "horizontal") => {
      const meta = buildPlanMeta(schedule, orientation);
      setPlans((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...meta } : p)),
      );
      api.put(`/plans/${id}`, meta).catch(() => {});
    },
    [],
  );

  const loadPlan = useCallback(
    (planId: string): SavedPlan | undefined => {
      const plan = plans.find((p) => p.id === planId);
      if (plan) setActivePlanId(planId);
      return plan;
    },
    [plans],
  );

  const deletePlan = useCallback((planId: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    setActivePlanId((prev) => (prev === planId ? null : prev));
    api.delete(`/plans/${planId}`).catch(() => {});
  }, []);

  const restorePlan = useCallback((plan: SavedPlan) => {
    setPlans((prev) => [plan, ...prev.filter((p) => p.id !== plan.id)]);
    api.post("/plans", plan).catch(() => {});
  }, []);

  return { plans, plansReady, activePlanId, setActivePlanId, savePlan, updatePlan, loadPlan, deletePlan, restorePlan };
}
