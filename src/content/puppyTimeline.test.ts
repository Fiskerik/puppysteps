import { PUPPY_TIMELINE, ageInDays, ageLabelForDays } from "./puppyTimeline";

describe("puppy first-year timeline", () => {
  it("covers the first year without gaps or overlaps", () => {
    expect(PUPPY_TIMELINE[0]?.minDays).toBe(0);
    expect(PUPPY_TIMELINE.at(-1)?.maxDays).toBe(366);
    for (let index = 1; index < PUPPY_TIMELINE.length; index += 1) {
      expect(PUPPY_TIMELINE[index]?.minDays).toBe(PUPPY_TIMELINE[index - 1]?.maxDays);
    }
  });

  it("keeps every stage useful and traceable", () => {
    for (const stage of PUPPY_TIMELINE) {
      expect(stage.actions.length).toBeGreaterThanOrEqual(4);
      expect(stage.safety.length).toBeGreaterThan(30);
      expect(stage.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it("derives a safe non-negative puppy age", () => {
    jest.spyOn(Date, "now").mockReturnValue(new Date("2026-09-03T12:00:00Z").getTime());
    expect(ageInDays("2026-08-06T12:00:00Z")).toBe(28);
    expect(ageInDays("2027-01-01T12:00:00Z")).toBe(0);
    expect(ageInDays(null)).toBeNull();
    expect(ageLabelForDays(70)).toBe("10 weeks old");
    jest.restoreAllMocks();
  });
});
