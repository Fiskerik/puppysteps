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
  deleteRoutineEvent,
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
  savePrepChecklistItem,
  updateCheckIn,
  updateDog,
  updateMilestone,
  updateRoutineEvent,
} from "../db/database";
import { cancelAllReminders, cancelReminder, scheduleReminder } from "../notifications/scheduler";

export type LogSelection = {
  dogId?: string;
  pee: EliminationEvent["location"] | null;
  poo: EliminationEvent["location"] | null;
  nothing: boolean;
  occurredAt?: string;
  source?: ToiletCheckIn["source"];
  notes?: string | null;
  photoUri?: string | null;
};

export type DogDraft = { name: string; breed: string | null; allergies?: string | null; birthDate: string | null; avatar: string; photoUri?: string | null; sex?: Dog["sex"]; weightKg?: number | null; chipNumber?: string | null; arrivalDate?: string | null };

export type StoreContextValue = {
  snapshot: AppSnapshot;
  selectedDogId: string;
  selectedDog: Dog;
  setSelectedDogId: (dogId: string) => void;
  addDog: (input: DogDraft) => boolean;
  updateDog: (dog: Dog) => boolean;
  logCheckIn: (selection: LogSelection) => boolean;
  updateCheckIn: (checkIn: ToiletCheckIn, events: EliminationEvent[]) => boolean;
  removeCheckIn: (checkInId: string) => boolean;
  addRoutine: (kind: RoutineEvent["kind"]) => boolean;
  updateRoutine: (event: RoutineEvent) => boolean;
  removeRoutine: (eventId: string) => boolean;
  addMilestone: (input: Pick<Milestone, "title" | "date" | "description" | "photoUri">) => boolean;
  updateMilestone: (milestone: Milestone) => boolean;
  toggleMilestone: (milestone: Milestone) => boolean;
  togglePrepItem: (id: string) => boolean;
  markLesson: (lesson: Lesson, state: "in_progress" | "completed") => boolean;
  updateSettings: (patch: Partial<AppSettings>) => void;
  enableReminders: () => Promise<boolean>;
  toggleResponsible: () => void;
  planFor: (dogId: string) => ReminderPlan | null;
  exportData: (format: "csv" | "json") => string;
  deleteLocalData: () => Promise<void>;
};

const createFallbackSnapshot = (): AppSnapshot => ({
  dogs: [{ id: "dog_luna", name: "Luna", avatar: "🐕", photoUri: null, birthDate: new Date(Date.now() - 90 * 86_400_000).toISOString(), arrivalDate: new Date(Date.now() - 14 * 86_400_000).toISOString(), breed: null, allergies: null, sex: "unknown", weightKg: null, chipNumber: null, createdAt: new Date().toISOString() }],
  checkIns: [], eliminations: [], routineEvents: [], milestones: [], lessonProgress: {}, plans: {}, prepChecklist: {}, settings: DEFAULT_SETTINGS,
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

  useEffect(() => { void i18n.changeLanguage(snapshot.settings.locale); }, [snapshot.settings.locale]);

  const logCheckIn = useCallback((selection: LogSelection): boolean => {
    const occurredAt = selection.occurredAt ?? new Date().toISOString();
    const dogId = selection.dogId ?? selectedDogId;
    const checkIn: ToiletCheckIn = { id: makeId("checkin"), dogId, occurredAt, source: selection.source ?? "manual", nothing: selection.nothing || (!selection.pee && !selection.poo), notes: selection.notes ?? null, photoUri: selection.photoUri ?? null, createdAt: new Date().toISOString() };
    const events: EliminationEvent[] = [];
    if (!checkIn.nothing && selection.pee) events.push({ id: makeId("pee"), checkInId: checkIn.id, dogId, kind: "pee", location: selection.pee, occurredAt });
    if (!checkIn.nothing && selection.poo) events.push({ id: makeId("poo"), checkInId: checkIn.id, dogId, kind: "poo", location: selection.poo, occurredAt });
    try {
      insertCheckIn(checkIn, events);
    } catch (error) {
      console.warn("Could not save check-in", error);
      return false;
    }
    // Update the in-memory snapshot from the same objects written to SQLite.
    // This avoids a stale reload racing the synchronous SQLite transaction.
    setSnapshot((current) => recompute({ ...current, checkIns: [checkIn, ...current.checkIns], eliminations: [...events, ...current.eliminations] }));
    return true;
  }, [recompute, selectedDogId]);

  const addDog = useCallback((input: DogDraft): boolean => {
    if (snapshot.dogs.length >= 2 || !input.name.trim()) return false;
    const dog: Dog = { id: makeId("dog"), name: input.name.trim(), avatar: input.avatar, photoUri: input.photoUri ?? null, birthDate: input.birthDate, arrivalDate: input.arrivalDate ?? new Date().toISOString(), breed: input.breed?.trim() || null, allergies: input.allergies?.trim() || null, sex: input.sex ?? "unknown", weightKg: input.weightKg ?? null, chipNumber: input.chipNumber?.trim() || null, createdAt: new Date().toISOString() };
    try { insertDog(dog); } catch (error) { console.warn("Could not save dog", error); return false; }
    setSelectedDogId(dog.id);
    // Reflect the committed row immediately; the next provider mount reloads it
    // from SQLite through loadSnapshot().
    setSnapshot((current) => recompute({ ...current, dogs: [...current.dogs, dog] }));
    return true;
  }, [recompute, snapshot.dogs.length]);
  const saveDog = useCallback((dog: Dog): boolean => {
    try { updateDog(dog); } catch (error) { console.warn("Could not update dog", error); return false; }
    setSnapshot((current) => recompute({ ...current, dogs: current.dogs.map((item) => item.id === dog.id ? dog : item) }));
    return true;
  }, [recompute]);

  const removeCheckIn = useCallback((checkInId: string): boolean => {
    try { deleteCheckIn(checkInId); } catch (error) { console.warn("Could not delete check-in", error); return false; }
    setSnapshot((current) => recompute({ ...current, checkIns: current.checkIns.filter((item) => item.id !== checkInId), eliminations: current.eliminations.filter((item) => item.checkInId !== checkInId) }));
    return true;
  }, [recompute]);
  const saveCheckIn = useCallback((checkIn: ToiletCheckIn, events: EliminationEvent[]): boolean => {
    try { updateCheckIn(checkIn, events); } catch (error) { console.warn("Could not update check-in", error); return false; }
    setSnapshot((current) => recompute({ ...current, checkIns: current.checkIns.map((item) => item.id === checkIn.id ? checkIn : item), eliminations: [...events, ...current.eliminations.filter((item) => item.checkInId !== checkIn.id)] }));
    return true;
  }, [recompute]);
  const addRoutine = useCallback((kind: RoutineEvent["kind"]): boolean => {
    const event: RoutineEvent = { id: makeId("routine"), dogId: selectedDogId, kind, occurredAt: new Date().toISOString() };
    try { insertRoutineEvent(event); } catch (error) { console.warn("Could not save routine", error); return false; }
    setSnapshot((current) => recompute({ ...current, routineEvents: [event, ...current.routineEvents] }));
    return true;
  }, [recompute, selectedDogId]);
  const saveRoutine = useCallback((event: RoutineEvent): boolean => {
    try { updateRoutineEvent(event); } catch (error) { console.warn("Could not update routine", error); return false; }
    setSnapshot((current) => recompute({ ...current, routineEvents: current.routineEvents.map((item) => item.id === event.id ? event : item) }));
    return true;
  }, [recompute]);
  const removeRoutine = useCallback((eventId: string): boolean => {
    try { deleteRoutineEvent(eventId); } catch (error) { console.warn("Could not delete routine", error); return false; }
    setSnapshot((current) => recompute({ ...current, routineEvents: current.routineEvents.filter((item) => item.id !== eventId) }));
    return true;
  }, [recompute]);
  const addMilestone = useCallback((input: Pick<Milestone, "title" | "date" | "description" | "photoUri">): boolean => {
    if (!input.title.trim()) return false;
    const milestone: Milestone = { id: makeId("milestone"), dogId: selectedDogId, title: input.title.trim(), date: input.date, description: input.description?.trim() || null, photoUri: input.photoUri ?? null, completed: false, custom: true };
    try { insertMilestone(milestone); } catch (error) { console.warn("Could not save milestone", error); return false; }
    setSnapshot((current) => ({ ...current, milestones: [...current.milestones, milestone] }));
    return true;
  }, [selectedDogId]);
  const saveMilestone = useCallback((milestone: Milestone): boolean => {
    try { updateMilestone(milestone); } catch (error) { console.warn("Could not update milestone", error); return false; }
    setSnapshot((current) => ({ ...current, milestones: current.milestones.map((item) => item.id === milestone.id ? milestone : item) }));
    return true;
  }, []);
  const toggleMilestone = useCallback((milestone: Milestone): boolean => {
    const updated = { ...milestone, completed: !milestone.completed };
    try { updateMilestone(updated); } catch (error) { console.warn("Could not update milestone", error); return false; }
    setSnapshot((current) => ({ ...current, milestones: current.milestones.map((item) => item.id === updated.id ? updated : item) }));
    return true;
  }, []);
  const togglePrepItem = useCallback((id: string): boolean => {
    const completed = !snapshot.prepChecklist[id];
    try { savePrepChecklistItem(id, completed); } catch (error) { console.warn("Could not save preparation checklist", error); return false; }
    setSnapshot((current) => ({ ...current, prepChecklist: { ...current.prepChecklist, [id]: completed } }));
    return true;
  }, [snapshot.prepChecklist]);
  const markLesson = useCallback((lesson: Lesson, state: "in_progress" | "completed"): boolean => {
    try { saveLessonProgress(lesson, state); } catch (error) { console.warn("Could not save lesson progress", error); return false; }
    setSnapshot((current) => ({ ...current, lessonProgress: { ...current.lessonProgress, [lesson.id]: state } }));
    return true;
  }, []);

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
  const deleteData = useCallback(async () => {
    await cancelAllReminders();
    try { clearLocalData(); } catch (error) { console.warn("Could not clear local data", error); return; }
    setSelectedDogId("");
    setSnapshot({ dogs: [], checkIns: [], eliminations: [], routineEvents: [], milestones: [], lessonProgress: {}, plans: {}, prepChecklist: {}, settings: { ...DEFAULT_SETTINGS } });
  }, []);

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

  const selectedDog = useMemo(() => snapshot.dogs.find((dog) => dog.id === selectedDogId) ?? snapshot.dogs[0] ?? { id: "no-dog", name: "Your dog", avatar: "🐕", photoUri: null, birthDate: null, arrivalDate: null, breed: null, allergies: null, sex: "unknown" as const, weightKg: null, chipNumber: null, createdAt: new Date().toISOString() }, [selectedDogId, snapshot.dogs]);
  const planFor = useCallback((dogId: string) => snapshot.plans[dogId] ?? null, [snapshot.plans]);
  const value = useMemo<StoreContextValue>(() => ({ snapshot, selectedDogId, selectedDog, setSelectedDogId, addDog, updateDog: saveDog, logCheckIn, updateCheckIn: saveCheckIn, removeCheckIn, addRoutine, updateRoutine: saveRoutine, removeRoutine, addMilestone, updateMilestone: saveMilestone, toggleMilestone, togglePrepItem, markLesson, updateSettings, enableReminders, toggleResponsible, planFor, deleteLocalData: deleteData, exportData: (format) => format === "csv" ? exportCsv(snapshot) : exportJson(snapshot) }), [snapshot, selectedDogId, selectedDog, addDog, saveDog, logCheckIn, saveCheckIn, removeCheckIn, addRoutine, saveRoutine, removeRoutine, addMilestone, saveMilestone, toggleMilestone, togglePrepItem, markLesson, updateSettings, enableReminders, toggleResponsible, planFor, deleteData]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useAppStore = (): StoreContextValue => {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useAppStore must be used inside AppStoreProvider");
  return value;
};
