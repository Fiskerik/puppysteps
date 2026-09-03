import * as SQLite from "expo-sqlite";
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

const database = SQLite.openDatabaseSync("puppysteps.db");

export const makeId = (prefix: string): string => {
  const random = globalThis.crypto?.randomUUID?.();
  return `${prefix}_${random ?? `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`}`;
};

export const DEFAULT_SETTINGS: AppSettings = {
  locale: "en-GB",
  quietStart: "22:00",
  quietEnd: "07:00",
  nightMode: true,
  responsible: true,
  remindersEnabled: false,
};

const createSchema = (): void => {
  database.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS dogs (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT NOT NULL,
      birth_date TEXT,
      arrival_date TEXT,
      breed TEXT,
      sex TEXT NOT NULL,
      weight_kg REAL,
      chip_number TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS check_ins (
      id TEXT PRIMARY KEY NOT NULL,
      dog_id TEXT NOT NULL,
      occurred_at TEXT NOT NULL,
      source TEXT NOT NULL,
      nothing INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS eliminations (
      id TEXT PRIMARY KEY NOT NULL,
      check_in_id TEXT NOT NULL,
      dog_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      location TEXT NOT NULL,
      occurred_at TEXT NOT NULL,
      UNIQUE(check_in_id, kind)
    );
    CREATE TABLE IF NOT EXISTS routine_events (
      id TEXT PRIMARY KEY NOT NULL,
      dog_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      occurred_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY NOT NULL,
      dog_id TEXT NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      custom INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS lesson_progress (
      lesson_id TEXT PRIMARY KEY NOT NULL,
      state TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reminder_plans (
      dog_id TEXT PRIMARY KEY NOT NULL,
      payload TEXT NOT NULL
    );
  `);
};

const upsertSetting = (key: string, value: string): void => {
  database.runSync("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, value]);
};

const readSettings = (): AppSettings => {
  const rows = database.getAllSync<{ key: string; value: string }>("SELECT key, value FROM settings");
  const settings = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    if (row.key === "locale") settings.locale = row.value as AppSettings["locale"];
    if (row.key === "quietStart") settings.quietStart = row.value;
    if (row.key === "quietEnd") settings.quietEnd = row.value;
    if (row.key === "nightMode") settings.nightMode = row.value === "true";
    if (row.key === "responsible") settings.responsible = row.value === "true";
    if (row.key === "remindersEnabled") settings.remindersEnabled = row.value === "true";
  }
  return settings;
};

export const initDatabase = (): void => {
  createSchema();
  const initialized = database.getFirstSync<{ value: string }>("SELECT value FROM settings WHERE key = 'initialized'");
  if (initialized?.value !== "true") {
    upsertSetting("locale", DEFAULT_SETTINGS.locale);
    upsertSetting("quietStart", DEFAULT_SETTINGS.quietStart);
    upsertSetting("quietEnd", DEFAULT_SETTINGS.quietEnd);
    upsertSetting("nightMode", String(DEFAULT_SETTINGS.nightMode));
    upsertSetting("responsible", String(DEFAULT_SETTINGS.responsible));
    upsertSetting("remindersEnabled", String(DEFAULT_SETTINGS.remindersEnabled));
    upsertSetting("initialized", "true");
  } else {
    // Existing MVP databases were initialized with Swedish as the default.
    // Migrate that one-time default while preserving any later language choice.
    const localeDefaultVersion = database.getFirstSync<{ value: string }>("SELECT value FROM settings WHERE key = 'english_default_v1'");
    if (localeDefaultVersion?.value !== "true") {
      const locale = database.getFirstSync<{ value: string }>("SELECT value FROM settings WHERE key = 'locale'");
      if (!locale?.value || locale.value === "sv-SE") upsertSetting("locale", DEFAULT_SETTINGS.locale);
      upsertSetting("english_default_v1", "true");
    }
  }
};

export const loadSnapshot = (): AppSnapshot => {
  initDatabase();
  const dogs = database.getAllSync<{
    id: string; name: string; avatar: string; birth_date: string | null; arrival_date: string | null;
    breed: string | null; sex: Dog["sex"]; weight_kg: number | null; chip_number: string | null; created_at: string;
  }>("SELECT * FROM dogs ORDER BY created_at ASC").map((row) => ({
    id: row.id, name: row.name, avatar: row.avatar, birthDate: row.birth_date, arrivalDate: row.arrival_date,
    breed: row.breed, sex: row.sex, weightKg: row.weight_kg, chipNumber: row.chip_number, createdAt: row.created_at,
  }));
  const checkIns = database.getAllSync<{ id: string; dog_id: string; occurred_at: string; source: ToiletCheckIn["source"]; nothing: number; notes: string | null; created_at: string }>("SELECT * FROM check_ins ORDER BY occurred_at DESC").map((row) => ({
    id: row.id, dogId: row.dog_id, occurredAt: row.occurred_at, source: row.source, nothing: row.nothing === 1, notes: row.notes, createdAt: row.created_at,
  }));
  const eliminations = database.getAllSync<{ id: string; check_in_id: string; dog_id: string; kind: EliminationEvent["kind"]; location: EliminationEvent["location"]; occurred_at: string }>("SELECT * FROM eliminations ORDER BY occurred_at DESC").map((row) => ({
    id: row.id, checkInId: row.check_in_id, dogId: row.dog_id, kind: row.kind, location: row.location, occurredAt: row.occurred_at,
  }));
  const routineEvents = database.getAllSync<{ id: string; dog_id: string; kind: RoutineEvent["kind"]; occurred_at: string }>("SELECT * FROM routine_events ORDER BY occurred_at DESC").map((row) => ({ id: row.id, dogId: row.dog_id, kind: row.kind, occurredAt: row.occurred_at }));
  const milestones = database.getAllSync<{ id: string; dog_id: string; title: string; date: string; completed: number; custom: number }>("SELECT * FROM milestones ORDER BY date ASC").map((row) => ({ id: row.id, dogId: row.dog_id, title: row.title, date: row.date, completed: row.completed === 1, custom: row.custom === 1 }));
  const progressRows = database.getAllSync<{ lesson_id: string; state: "not_started" | "in_progress" | "completed" }>("SELECT * FROM lesson_progress");
  const plans = database.getAllSync<{ dog_id: string; payload: string }>("SELECT * FROM reminder_plans").reduce<Record<string, ReminderPlan>>((result, row) => { result[row.dog_id] = JSON.parse(row.payload) as ReminderPlan; return result; }, {});
  return { dogs, checkIns, eliminations, routineEvents, milestones, lessonProgress: Object.fromEntries(progressRows.map((row) => [row.lesson_id, row.state])), plans, settings: readSettings() };
};

export const insertDog = (dog: Dog): void => {
  database.runSync("INSERT INTO dogs (id, name, avatar, birth_date, arrival_date, breed, sex, weight_kg, chip_number, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [dog.id, dog.name, dog.avatar, dog.birthDate, dog.arrivalDate, dog.breed, dog.sex, dog.weightKg, dog.chipNumber, dog.createdAt]);
};

export const insertCheckIn = (checkIn: ToiletCheckIn, events: EliminationEvent[]): void => {
  database.withTransactionSync(() => {
    database.runSync("INSERT INTO check_ins (id, dog_id, occurred_at, source, nothing, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [checkIn.id, checkIn.dogId, checkIn.occurredAt, checkIn.source, checkIn.nothing ? 1 : 0, checkIn.notes, checkIn.createdAt]);
    for (const event of events) database.runSync("INSERT INTO eliminations (id, check_in_id, dog_id, kind, location, occurred_at) VALUES (?, ?, ?, ?, ?, ?)", [event.id, event.checkInId, event.dogId, event.kind, event.location, event.occurredAt]);
  });
};

export const deleteCheckIn = (checkInId: string): void => {
  database.withTransactionSync(() => {
    database.runSync("DELETE FROM eliminations WHERE check_in_id = ?", [checkInId]);
    database.runSync("DELETE FROM check_ins WHERE id = ?", [checkInId]);
  });
};

export const insertRoutineEvent = (event: RoutineEvent): void => {
  database.runSync("INSERT INTO routine_events (id, dog_id, kind, occurred_at) VALUES (?, ?, ?, ?)", [event.id, event.dogId, event.kind, event.occurredAt]);
};

export const insertMilestone = (milestone: Milestone): void => {
  database.runSync("INSERT INTO milestones (id, dog_id, title, date, completed, custom) VALUES (?, ?, ?, ?, ?, ?)", [milestone.id, milestone.dogId, milestone.title, milestone.date, milestone.completed ? 1 : 0, milestone.custom ? 1 : 0]);
};

export const updateMilestone = (milestone: Milestone): void => {
  database.runSync("UPDATE milestones SET title = ?, date = ?, completed = ? WHERE id = ?", [milestone.title, milestone.date, milestone.completed ? 1 : 0, milestone.id]);
};

export const savePlan = (plan: ReminderPlan): void => {
  database.runSync("INSERT OR REPLACE INTO reminder_plans (dog_id, payload) VALUES (?, ?)", [plan.dogId, JSON.stringify(plan)]);
};

export const saveSettings = (settings: AppSettings): void => {
  for (const [key, value] of Object.entries(settings)) upsertSetting(key, String(value));
};

export const saveLessonProgress = (lesson: Lesson, state: "not_started" | "in_progress" | "completed"): void => {
  database.runSync("INSERT OR REPLACE INTO lesson_progress (lesson_id, state) VALUES (?, ?)", [lesson.id, state]);
};

export const clearLocalData = (): void => {
  database.withTransactionSync(() => {
    database.execSync("DELETE FROM eliminations; DELETE FROM check_ins; DELETE FROM routine_events; DELETE FROM milestones; DELETE FROM lesson_progress; DELETE FROM reminder_plans; DELETE FROM dogs; DELETE FROM settings;");
    upsertSetting("initialized", "true");
    upsertSetting("locale", DEFAULT_SETTINGS.locale);
    upsertSetting("quietStart", DEFAULT_SETTINGS.quietStart);
    upsertSetting("quietEnd", DEFAULT_SETTINGS.quietEnd);
    upsertSetting("nightMode", String(DEFAULT_SETTINGS.nightMode));
    upsertSetting("responsible", String(DEFAULT_SETTINGS.responsible));
    upsertSetting("remindersEnabled", "false");
    upsertSetting("english_default_v1", "true");
  });
};

export const exportCsv = (snapshot: AppSnapshot): string => {
  const header = "dog,event,kind,location,occurredAt\n";
  const rows = snapshot.eliminations.map((event) => {
    const dog = snapshot.dogs.find((item) => item.id === event.dogId)?.name ?? "";
    return [dog, "elimination", event.kind, event.location, event.occurredAt].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",");
  });
  return header + rows.join("\n");
};

export const exportJson = (snapshot: AppSnapshot): string => JSON.stringify({ ...snapshot, dogs: snapshot.dogs.map(({ chipNumber: _chipNumber, ...dog }) => dog) }, null, 2);
