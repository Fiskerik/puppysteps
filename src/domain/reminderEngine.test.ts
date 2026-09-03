import { getNextReminder } from "./reminderEngine";
import type { AppSettings, Dog, EliminationEvent, RoutineEvent, ToiletCheckIn } from "./models";

const now = new Date("2026-09-03T12:00:00.000Z");
const dog: Dog = { id: "dog_test", name: "Test", avatar: "🐶", birthDate: "2026-06-03T12:00:00.000Z", arrivalDate: null, breed: null, sex: "unknown", weightKg: null, chipNumber: null, createdAt: now.toISOString() };
const settings: AppSettings = { locale: "sv-SE", quietStart: "22:00", quietEnd: "07:00", nightMode: false, responsible: true, remindersEnabled: false };
const elimination = (id: string, kind: EliminationEvent["kind"], location: EliminationEvent["location"], occurredAt: string): EliminationEvent => ({ id, checkInId: `checkin_${id}`, dogId: dog.id, kind, location, occurredAt });

describe("getNextReminder", () => {
  it("shortens after indoor pee without using poo as a bladder signal", () => {
    const indoor = getNextReminder({ dog, checkIns: [], eliminations: [elimination("pee", "pee", "inside", "2026-09-03T11:55:00.000Z")], routineEvents: [], settings, now });
    const pooOnly = getNextReminder({ dog, checkIns: [], eliminations: [elimination("poo", "poo", "inside", "2026-09-03T11:55:00.000Z")], routineEvents: [], settings, now });
    expect(indoor.reasonCode).toBe("recent_pee_accident");
    expect(pooOnly.reasonCode).not.toBe("recent_pee_accident");
  });

  it("creates a 15 minute follow-up for nothing yet", () => {
    const checkIn: ToiletCheckIn = { id: "checkin_nothing", dogId: dog.id, occurredAt: now.toISOString(), source: "manual", nothing: true, notes: null, photoUri: null, createdAt: now.toISOString() };
    const plan = getNextReminder({ dog, checkIns: [checkIn], eliminations: [], routineEvents: [], settings, now });
    expect(plan.reasonCode).toBe("follow_up");
    expect(Math.round((new Date(plan.at).getTime() - now.getTime()) / 60_000)).toBe(15);
  });

  it("uses a separate bowel candidate after a meal", () => {
    const meal: RoutineEvent = { id: "routine_meal", dogId: dog.id, kind: "meal", occurredAt: "2026-09-03T11:50:00.000Z" };
    const plan = getNextReminder({ dog, checkIns: [], eliminations: [], routineEvents: [meal], settings, now });
    expect(plan.reasonCode).toBe("after_meal");
    expect(Math.round((new Date(plan.at).getTime() - now.getTime()) / 60_000)).toBe(5);
  });

  it("never schedules a stale reminder in the past", () => {
    const plan = getNextReminder({ dog, checkIns: [], eliminations: [elimination("old", "pee", "outside", "2026-09-01T08:00:00.000Z")], routineEvents: [], settings, now });
    expect(new Date(plan.at).getTime()).toBeGreaterThan(now.getTime());
  });
});
