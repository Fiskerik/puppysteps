export type Locale = "sv-SE" | "en-GB" | "fr-FR" | "de-DE" | "da-DK" | "fi-FI" | "nb-NO";
export type EliminationKind = "pee" | "poo";
export type EliminationLocation = "outside" | "inside";
export type CheckInSource = "manual" | "notification";

export type Dog = {
  id: string;
  name: string;
  avatar: string;
  birthDate: string | null;
  arrivalDate: string | null;
  breed: string | null;
  sex: "female" | "male" | "unknown";
  weightKg: number | null;
  chipNumber: string | null;
  createdAt: string;
};

export type ToiletCheckIn = {
  id: string;
  dogId: string;
  occurredAt: string;
  source: CheckInSource;
  nothing: boolean;
  notes: string | null;
  createdAt: string;
};

export type EliminationEvent = {
  id: string;
  checkInId: string;
  dogId: string;
  kind: EliminationKind;
  location: EliminationLocation;
  occurredAt: string;
};

export type RoutineEventKind = "wake" | "meal" | "drink" | "play" | "car" | "sleep";

export type RoutineEvent = {
  id: string;
  dogId: string;
  kind: RoutineEventKind;
  occurredAt: string;
};

export type Milestone = {
  id: string;
  dogId: string;
  title: string;
  date: string;
  completed: boolean;
  custom: boolean;
};

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  duration: string;
  steps: string[];
  tags: string[];
  status: "reviewed" | "draft";
};

export type ReminderReason =
  | "age_baseline"
  | "after_wake"
  | "after_meal"
  | "after_play"
  | "recent_pee_accident"
  | "bowel_pattern"
  | "manual"
  | "follow_up";

export type ReminderPlan = {
  dogId: string;
  at: string;
  reasonCode: ReminderReason;
  confidence: "starter" | "learning" | "personalized";
  intervalMinutes: number;
  label: string;
};

export type AppSettings = {
  locale: Locale;
  quietStart: string;
  quietEnd: string;
  nightMode: boolean;
  responsible: boolean;
  remindersEnabled: boolean;
};

export type AppSnapshot = {
  dogs: Dog[];
  checkIns: ToiletCheckIn[];
  eliminations: EliminationEvent[];
  routineEvents: RoutineEvent[];
  milestones: Milestone[];
  lessonProgress: Record<string, "not_started" | "in_progress" | "completed">;
  plans: Record<string, ReminderPlan>;
  settings: AppSettings;
};
