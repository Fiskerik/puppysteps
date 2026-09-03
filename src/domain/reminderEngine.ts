import type {
  AppSettings,
  Dog,
  EliminationEvent,
  ReminderPlan,
  RoutineEvent,
  ToiletCheckIn,
} from "./models";

const MIN_INTERVAL = 30;
const MAX_INTERVAL = 240;

const ageInterval = (ageMonths: number): number => {
  if (ageMonths <= 1) return 40;
  if (ageMonths <= 2) return 50;
  if (ageMonths <= 3) return 70;
  if (ageMonths <= 4) return 90;
  if (ageMonths <= 6) return 120;
  if (ageMonths <= 9) return 150;
  return 180;
};

export const ageInMonths = (dog: Dog, now = new Date()): number => {
  if (!dog.birthDate) return 3;
  const birth = new Date(dog.birthDate);
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
  return Math.max(1, Math.min(18, months - (now.getDate() < birth.getDate() ? 1 : 0)));
};

const minutesSince = (iso: string, now: Date): number => Math.max(0, (now.getTime() - new Date(iso).getTime()) / 60_000);

const sortByTime = <T extends { occurredAt: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

const inQuietHours = (date: Date, settings: AppSettings): boolean => {
  const current = date.getHours() * 60 + date.getMinutes();
  const [startHour = 22, startMinute = 0] = settings.quietStart.split(":").map(Number);
  const [endHour = 7, endMinute = 0] = settings.quietEnd.split(":").map(Number);
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  return start > end ? current >= start || current < end : current >= start && current < end;
};

const movePastQuietHours = (date: Date, settings: AppSettings): Date => {
  if (!inQuietHours(date, settings)) return date;
  const [endHour = 7, endMinute = 0] = settings.quietEnd.split(":").map(Number);
  const next = new Date(date);
  next.setHours(endHour, endMinute, 0, 0);
  if (next <= date) next.setDate(next.getDate() + 1);
  return next;
};

const reasonForTrigger = (kind: RoutineEvent["kind"]): ReminderPlan["reasonCode"] => {
  if (kind === "wake") return "after_wake";
  if (kind === "meal" || kind === "drink") return "after_meal";
  return "after_play";
};

const triggerDelay = (kind: RoutineEvent["kind"]): number => {
  if (kind === "wake") return 5;
  if (kind === "meal" || kind === "drink") return 15;
  return 10;
};

export const getNextReminder = ({
  dog,
  checkIns,
  eliminations,
  routineEvents,
  settings,
  now = new Date(),
}: {
  dog: Dog;
  checkIns: ToiletCheckIn[];
  eliminations: EliminationEvent[];
  routineEvents: RoutineEvent[];
  settings: AppSettings;
  now?: Date;
}): ReminderPlan => {
  const dogCheckIns = checkIns.filter((item) => item.dogId === dog.id);
  const dogEliminations = eliminations.filter((item) => item.dogId === dog.id);
  const dogRoutine = routineEvents.filter((item) => item.dogId === dog.id);
  const pees = sortByTime(dogEliminations.filter((item) => item.kind === "pee"));
  const poos = sortByTime(dogEliminations.filter((item) => item.kind === "poo"));
  const latestCheckIn = sortByTime(dogCheckIns)[0];
  const latestPee = pees[0];
  const latestPoo = poos[0];
  const ageBaseline = ageInterval(ageInMonths(dog, now));
  const outdoorPees = pees.filter((event) => event.location === "outside");
  let cleanStreak = 0;
  for (const event of pees) {
    if (event.location !== "outside") break;
    cleanStreak += 1;
  }
  const learnedIntervals = outdoorPees.slice(0, 8).slice(0, -1).map((event, index) => {
    const next = outdoorPees[index + 1];
    if (!next) return 0;
    return Math.round(Math.abs(new Date(event.occurredAt).getTime() - new Date(next.occurredAt).getTime()) / 60_000);
  }).filter((interval) => interval >= MIN_INTERVAL && interval <= MAX_INTERVAL);
  const learnedBaseline = learnedIntervals.length
    ? learnedIntervals.reduce((sum, interval) => sum + interval, 0) / learnedIntervals.length
    : ageBaseline;
  const latestIndoorPee = pees.find((event) => event.location === "inside");
  const indoorPeeWasRecent = latestIndoorPee ? minutesSince(latestIndoorPee.occurredAt, now) < 24 * 60 : false;
  // Blend the age curve with the dog's observed rhythm. A clean streak can
  // lengthen the interval gradually, while a recent accident pulls it back.
  let bladderInterval = Math.round(ageBaseline * 0.55 + learnedBaseline * 0.45);
  if (cleanStreak >= 3 && !indoorPeeWasRecent) bladderInterval += Math.min(45, (cleanStreak - 2) * 5);
  if (latestPee?.location === "inside") bladderInterval = Math.max(MIN_INTERVAL, bladderInterval - 10);
  const currentlyQuiet = inQuietHours(now, settings);
  if (settings.nightMode && currentlyQuiet) bladderInterval = Math.min(MAX_INTERVAL, Math.round(bladderInterval * 1.35));

  let bladderAt = new Date((latestPee ? new Date(latestPee.occurredAt) : now).getTime() + bladderInterval * 60_000);
  let reasonCode: ReminderPlan["reasonCode"] = latestPee?.location === "inside" ? "recent_pee_accident" : "age_baseline";
  const recentTrigger = sortByTime(dogRoutine).find((event) => ["wake", "meal", "drink", "play", "walk"].includes(event.kind) && minutesSince(event.occurredAt, now) < 90);
  if (recentTrigger) {
    const triggerAt = new Date(new Date(recentTrigger.occurredAt).getTime() + triggerDelay(recentTrigger.kind) * 60_000);
    if (triggerAt > now && triggerAt < bladderAt) {
      bladderAt = triggerAt;
      reasonCode = reasonForTrigger(recentTrigger.kind);
    }
  }

  let selectedAt = bladderAt;
  let selectedReason = reasonCode;
  if (latestCheckIn?.nothing && new Date(latestCheckIn.occurredAt).getTime() >= (latestPee ? new Date(latestPee.occurredAt).getTime() : 0)) {
    const followUpAt = new Date(new Date(latestCheckIn.occurredAt).getTime() + 15 * 60_000);
    if (followUpAt > now) {
      selectedAt = followUpAt;
      selectedReason = "follow_up";
    }
  }

  const bowelMinutes = latestPoo?.location === "inside" ? 75 : latestPoo ? 120 : 150;
  const latestMeal = sortByTime(dogRoutine.filter((event) => event.kind === "meal" || event.kind === "wake"))[0];
  const bowelAt = latestMeal && minutesSince(latestMeal.occurredAt, now) < 180
    ? new Date(new Date(latestMeal.occurredAt).getTime() + 20 * 60_000)
    : new Date((latestPoo ? new Date(latestPoo.occurredAt) : now).getTime() + bowelMinutes * 60_000);
  if (bowelAt > now && bowelAt < selectedAt) {
    selectedAt = bowelAt;
    selectedReason = "bowel_pattern";
  }

  if (selectedAt <= now) {
    selectedAt = new Date(now.getTime() + Math.max(MIN_INTERVAL, ageBaseline) * 60_000);
    selectedReason = "age_baseline";
  }

  // Night mode spaces reminders out instead of suppressing them. Turning
  // night mode off restores the older quiet-hours behavior.
  if (!settings.nightMode) selectedAt = movePastQuietHours(selectedAt, settings);
  const confidence: ReminderPlan["confidence"] = dogEliminations.length < 3
    ? "starter"
    : dogEliminations.length < 10
      ? "learning"
      : "personalized";
  const intervalMinutes = Math.max(1, Math.round((selectedAt.getTime() - now.getTime()) / 60_000));
  const label = selectedReason === "follow_up"
    ? "Följ upp en lugn runda"
    : selectedReason === "recent_pee_accident"
      ? "Lite tidigare efter en olycka"
      : selectedReason === "bowel_pattern"
        ? "Mönster efter mat och morgon"
        : selectedReason === "after_wake"
          ? "Efter vila"
          : selectedReason === "after_meal"
            ? "Efter mat eller vatten"
            : selectedReason === "after_play"
              ? "Efter lek eller träning"
              : "Åldersanpassad starttid";

  return {
    dogId: dog.id,
    at: selectedAt.toISOString(),
    reasonCode: selectedReason,
    confidence,
    intervalMinutes: Math.min(MAX_INTERVAL, Math.max(MIN_INTERVAL, intervalMinutes)),
    label,
  };
};
