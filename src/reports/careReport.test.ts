import type { Dog, EliminationEvent, RoutineEvent, ToiletCheckIn } from "../domain/models";
import { buildCareReport, buildCareReportHtml, routinePattern } from "./careReport";

const dog: Dog = {
  id: "dog-1",
  name: "Milo & <friends>",
  avatar: "🐶",
  photoUri: null,
  birthDate: null,
  arrivalDate: null,
  breed: "Lab <mix>",
  allergies: "Chicken & fish",
  sex: "male",
  weightKg: 8.5,
  chipNumber: "985141000<123",
  createdAt: "2026-09-04T08:00:00.000Z",
};

const routine = (kind: RoutineEvent["kind"], occurredAt: string): RoutineEvent => ({ id: `${kind}-${occurredAt}`, dogId: dog.id, kind, occurredAt });
const checkIn: ToiletCheckIn = { id: "check", dogId: dog.id, occurredAt: "2026-09-04T08:00:00.000Z", source: "manual", nothing: false, notes: null, photoUri: null, createdAt: "2026-09-04T08:00:00.000Z" };
const outside: EliminationEvent = { id: "outside", checkInId: checkIn.id, dogId: dog.id, kind: "pee", location: "outside", occurredAt: checkIn.occurredAt };

const baseInput = {
  dog,
  locale: "en-GB",
  routineEvents: [routine("walk", "2026-09-04T08:00:00.000Z"), routine("walk", "2026-09-03T18:30:00.000Z"), routine("meal", "2026-09-04T07:30:00.000Z")],
  eliminationEvents: [outside],
  checkIns: [checkIn],
  completedLessons: 2,
  points: 42,
  tierName: "New arrival",
  includeMicrochip: false,
  generatedAt: new Date("2026-09-04T12:00:00.000Z"),
};

describe("care report builder", () => {
  it("uses current routine events and safely falls back when data is absent", () => {
    const pattern = routinePattern(baseInput.routineEvents, "walk", "en-GB");
    expect(pattern).not.toBe("Not enough data yet");
    const formatter = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
    expect(pattern).toBe(`${formatter.format(new Date("2026-09-04T08:00:00.000Z"))} · ${formatter.format(new Date("2026-09-03T18:30:00.000Z"))}`);
    expect(routinePattern([], "sleep", "en-GB")).toBe("Not enough data yet");
  });

  it("keeps microchip data out unless the caller explicitly opts in", () => {
    const withoutChip = buildCareReport(baseInput);
    const withChip = buildCareReport({ ...baseInput, includeMicrochip: true });
    expect(withoutChip.sections[0]?.rows.some((row) => row.label === "Microchip")).toBe(false);
    expect(withChip.sections[0]?.rows.find((row) => row.label === "Microchip")?.value).toBe(dog.chipNumber);
  });

  it("includes a photo fallback and escapes all user-entered HTML", () => {
    const fallbackHtml = buildCareReportHtml(buildCareReport(baseInput));
    expect(fallbackHtml).toContain("avatar-fallback");
    expect(fallbackHtml).toContain("Milo &amp; &lt;friends&gt;");
    expect(fallbackHtml).toContain("Lab &lt;mix&gt;");
    expect(fallbackHtml).not.toContain("Milo & <friends>");
    expect(fallbackHtml).not.toContain(">dog<");
    expect(fallbackHtml).not.toContain(">walk<");

    const photoHtml = buildCareReportHtml(buildCareReport({ ...baseInput, photoDataUri: "data:image/jpeg;base64,abc123" }));
    expect(photoHtml).toContain("avatar-image");
    expect(photoHtml).toContain("data:image/jpeg;base64,abc123");
  });

  it("summarizes profile, routine, and current progress", () => {
    const report = buildCareReport(baseInput);
    expect(report.sections.map((section) => section.title)).toEqual(["Profile", "Usual routine", "Recent progress"]);
    expect(report.sections[2]?.rows.find((row) => row.label === "Outdoor potty wins")?.value).toBe("1");
    expect(report.sections[2]?.rows.find((row) => row.label === "Logged moments")?.value).toBe("4");
  });
});
