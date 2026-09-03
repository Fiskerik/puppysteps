import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { i18n } from "../i18n";
import { getNextReminder } from "../domain/reminderEngine";
import type {
  AppSettings,
  AppSnapshot,
  Dog,
  EliminationEvent,
  Lesson,
  Milestone,
  ReminderPlan,
  RoutineEvent,
  ToiletCheckIn,
} from "../domain/models";
import {
  DEFAULT_SETTINGS,
  clearLocalData,
  deleteCheckIn,
  exportCsv,
  exportJson,
  initDatabase,
  insertCheckIn,
  insertDog,
  insertMilestone,
  insertRoutineEvent,
  loadSnapshot,
  makeId,
  saveLessonProgress,
  savePlan,
  saveSettings,
  updateMilestone,
} from "../db/database";
import { cancelReminder, scheduleReminder } from "../notifications/scheduler";

export type LogSelection = {
  pee: EliminationEvent["location"] | null;
  poo: EliminationEvent["location"] | null;
  nothing: boolean;
  occurredAt?: string;
  source?: ToiletCheckIn["source"];
  notes?: string | null;
};

export type StoreContextValue = {
  snapshot: AppSnapshot;
  selectedDogId: string;
  selectedDog: Dog;
  setSelectedDogId: (dogId: string) => void;
  addDog: (input: Pick<Dog, "name" | "breed" | "birthDate" | "avatar">) => boolean;
  logCheckIn: (selection: LogSelection) => void;
  removeCheckIn: (checkInId: string) => void;
  addRoutine: (kind: RoutineEvent["kind"]) => void;
  addMilestone: (title: string) => void;
  toggleMilestone: (milestone: Milestone) => void;
  markLesson: (lesson: Lesson, state: "in_progress" | "completed") => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  enableReminders: () => Promise<boolean>;
  toggleResponsible: () => void;
  planFor: (dogId: string) => ReminderPlan | null;
  exportData: (format: "csv" | "json") => string;
  deleteLocalData: () => void;
};

const createFallbackSnapshot = (): AppSnapshot => ({
  dogs: [{ id: "dog_luna", name: "Luna", avatar: "🐕", birthDate: new Date(Date.now() - 90 * 86_400_000).toISOString(), arrivalDate: new Date(Date.now() - 14 * 86_400_000).toISOString(), breed: null, sex: "unknown", weightKg: null, chipNumber: null, createdAt: new Date().toISOString() }],
  checkIns: [], eliminations: [], routineEvents: [], milestones: [], lessonProgress: {}, plans: {}, settings: DEFAULT_SETTINGS,
});

const readInitialSnapshot = (): AppSnapshot => {
  try {
    initDatabase();
    const loaded = loadSnapshot();
    return { ...loaded, plans: loaded.dogs.reduce<Record<string, ReminderPlan>>((plans, dog) => { plans[dog.id] = getNextReminder({ dog, checkIns: loaded.checkIns, eliminations: loaded.eliminations, routineEvents: loaded.routineEvents, settings: loaded.settings }); return plans; }, {}) };
  } catch (error) {
    console.warn("Puppysteps local storage unavailable; using in-memory data.", error);
    return createFallbackSnapshot();
  }
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<AppSnapshot>(readInitialSnapshot);
  const [selectedDogId, setSelectedDogId] = useState(snapshot.dogs[0]?.id ?? "dog_luna");

  const recompute = useCallback((current: AppSnapshot): AppSnapshot => {
    const plans = current.dogs.reduce<Record<string, ReminderPlan>>((result, dog) => {
      const plan = getNextReminder({ dog, checkIns: current.checkIns, eliminations: current.eliminations, routineEvents: current.routineEvents, settings: current.settings });
      result[dog.id] = plan;
      try { savePlan(plan); } catch (error) { console.warn("Could not persist reminder plan", error); }
      return result;
    }, {});
    return { ...current, plans };
  }, []);

  const persistAndRefresh = useCallback((loadFromDb = true) => {
    setSnapshot((current) => {
      let next = current;
      if (loadFromDb) {
        try { next = loadSnapshot(); } catch (error) { console.warn("Could not reload local data", error); }
      }
      return recompute(next);
    });
  }, [recompute]);

  useEffect(() => { void i18n.changeLanguage(snapshot.settings.locale); }, [snapshot.settings.locale]);

  const logCheckIn = useCallback((selection: LogSelection) => {
    const occurredAt = selection.occurredAt ?? new Date().toISOString();
    if (selection.nothing || (!selection.pee && !selection.poo)) {
      const checkIn: ToiletCheckIn = { id: makeId("checkin"), dogId: selectedDogId, occurredAt, source: selection.source ?? "manual", nothing: true, notes: selection.notes ?? null, createdAt: new Date().toISOString() };
      try { insertCheckIn(checkIn, []); } catch (error) { console.warn("Could not save check-in", error); }
    } else {
      const checkIn: ToiletCheckIn = { id: makeId("checkin"), dogId: selectedDogId, occurredAt, source: selection.source ?? "manual", nothing: false, notes: selection.notes ?? null, createdAt: new Date().toISOString() };
      const events: EliminationEvent[] = [];
      if (selection.pee) events.push({ id: makeId("pee"), checkInId: checkIn.id, dogId: selectedDogId, kind: "pee", location: selection.pee, occurredAt });
      if (selection.poo) events.push({ id: makeId("poo"), checkInId: checkIn.id, dogId: selectedDogId, kind: "poo", location: selection.poo, occurredAt });
      try { insertCheckIn(checkIn, events); } catch (error) { console.warn("Could not save check-in", error); }
    }
    persistAndRefresh();
  }, [persistAndRefresh, selectedDogId]);

  const addDog = useCallback((input: Pick<Dog, "name" | "breed" | "birthDate" | "avatar">): boolean => {
    if (snapshot.dogs.length >= 2 || !input.name.trim()) return false;
    const dog: Dog = { id: makeId("dog"), name: input.name.trim(), avatar: input.avatar, birthDate: input.birthDate, arrivalDate: new Date().toISOString(), breed: input.breed?.trim() || null, sex: "unknown", weightKg: null, chipNumber: null, createdAt: new Date().toISOString() };
    try { insertDog(dog); } catch (error) { console.warn("Could not save dog", error); return false; }
    setSelectedDogId(dog.id);
    persistAndRefresh();
    return true;
  }, [persistAndRefresh, snapshot.dogs.length]);

  const removeCheckIn = useCallback((checkInId: string) => { try { deleteCheckIn(checkInId); } catch (error) { console.warn("Could not delete check-in", error); } persistAndRefresh(); }, [persistAndRefresh]);
  const addRoutine = useCallback((kind: RoutineEvent["kind"]) => { try { insertRoutineEvent({ id: makeId("routine"), dogId: selectedDogId, kind, occurredAt: new Date().toISOString() }); } catch (error) { console.warn("Could not save routine", error); } persistAndRefresh(); }, [persistAndRefresh, selectedDogId]);
  const addMilestone = useCallback((title: string) => { if (!title.trim()) return; const milestone: Milestone = { id: makeId("milestone"), dogId: selectedDogId, title: title.trim(), date: new Date().toISOString(), completed: true, custom: true }; try { insertMilestone(milestone); } catch (error) { console.warn("Could not save milestone", error); } persistAndRefresh(); }, [persistAndRefresh, selectedDogId]);
  const toggleMilestone = useCallback((milestone: Milestone) => { try { updateMilestone({ ...milestone, completed: !milestone.completed }); } catch (error) { console.warn("Could not update milestone", error); } persistAndRefresh(); }, [persistAndRefresh]);
  const markLesson = useCallback((lesson: Lesson, state: "in_progress" | "completed") => { try { saveLessonProgress(lesson, state); } catch (error) { console.warn("Could not save lesson progress", error); } setSnapshot((current) => ({ ...current, lessonProgress: { ...current.lessonProgress, [lesson.id]: state } })); }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    const nextSettings = { ...snapshot.settings, ...patch };
    try { saveSettings(nextSettings); } catch (error) { console.warn("Could not save settings", error); }
    setSnapshot((current) => recompute({ ...current, settings: nextSettings }));
  }, [recompute, snapshot.settings]);

  const enableReminders = useCallback(async (): Promise<boolean> => {
    const allowed = await import("../notifications/scheduler").then(({ requestReminderPermission }) => requestReminderPermission());
    if (allowed) updateSettings({ remindersEnabled: true });
    return allowed;
  }, [updateSettings]);

  const toggleResponsible = useCallback(() => updateSettings({ responsible: !snapshot.settings.responsible }), [snapshot.settings.responsible, updateSettings]);
  const deleteData = useCallback(() => { try { clearLocalData(); } catch (error) { console.warn("Could not clear local data", error); } setSelectedDogId(""); setSnapshot({ dogs: [], checkIns: [], eliminations: [], routineEvents: [], milestones: [], lessonProgress: {}, plans: {}, settings: { ...DEFAULT_SETTINGS } }); }, []);

  useEffect(() => {
    if (!snapshot.settings.remindersEnabled || !snapshot.settings.responsible) {
      for (const dog of snapshot.dogs) void cancelReminder(dog.id);
      return;
    }
    for (const dog of snapshot.dogs) {
      const plan = snapshot.plans[dog.id];
      if (plan) void scheduleReminder(dog, plan, true);
    }
  }, [snapshot.dogs, snapshot.plans, snapshot.settings.remindersEnabled, snapshot.settings.responsible]);

  const selectedDog = useMemo(() => snapshot.dogs.find((dog) => dog.id === selectedDogId) ?? snapshot.dogs[0] ?? { id: "no-dog", name: "Din hund", avatar: "🐕", birthDate: null, arrivalDate: null, breed: null, sex: "unknown" as const, weightKg: null, chipNumber: null, createdAt: new Date().toISOString() }, [selectedDogId, snapshot.dogs]);
  const planFor = useCallback((dogId: string) => snapshot.plans[dogId] ?? null, [snapshot.plans]);
  const value = useMemo<StoreContextValue>(() => ({ snapshot, selectedDogId, selectedDog, setSelectedDogId, addDog, logCheckIn, removeCheckIn, addRoutine, addMilestone, toggleMilestone, markLesson, updateSettings, enableReminders, toggleResponsible, planFor, deleteLocalData: deleteData, exportData: (format) => format === "csv" ? exportCsv(snapshot) : exportJson(snapshot) }), [snapshot, selectedDogId, selectedDog, addDog, logCheckIn, removeCheckIn, addRoutine, addMilestone, toggleMilestone, markLesson, updateSettings, enableReminders, toggleResponsible, planFor, deleteData]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useAppStore = (): StoreContextValue => {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useAppStore must be used inside AppStoreProvider");
  return value;
};
