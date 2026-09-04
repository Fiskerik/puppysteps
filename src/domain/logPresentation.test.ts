import {
  ALL_DOGS_FILTER,
  buildLogEntryAccessibilityLabel,
  getLogActivityPresentation,
  resolveLogDogFilter,
  shouldShowDogIdentity,
  type LogActivityLabels,
} from "./logPresentation";

const labels: LogActivityLabels = {
  pee: "Pee",
  poo: "Poo",
  nothing: "Nothing yet",
  routine: { wake: "Wake", meal: "Eat", drink: "Drink", play: "Play", walk: "Walk", sleep: "Sleep", car: "Car" },
};

describe("log presentation", () => {
  it("uses All dogs by default for a multi-dog household", () => {
    expect(resolveLogDogFilter(["luna", "max"])).toBe(ALL_DOGS_FILTER);
    expect(shouldShowDogIdentity(ALL_DOGS_FILTER, 2)).toBe(true);
    expect(shouldShowDogIdentity("luna", 2)).toBe(false);
  });

  it("uses a valid dog-specific deep link and safely falls back for an unknown id", () => {
    expect(resolveLogDogFilter(["luna", "max"], "max")).toBe("max");
    expect(resolveLogDogFilter(["luna", "max"], ["luna"])).toBe("luna");
    expect(resolveLogDogFilter(["luna", "max"], "unknown")).toBe(ALL_DOGS_FILTER);
  });

  it("maps toilet and routine activities to consistent icons and accessible labels", () => {
    expect(getLogActivityPresentation({ type: "checkIn", nothing: false, eliminationKinds: ["pee", "poo"] }, labels)).toEqual({ icons: ["water", "emoticon-poop"], label: "Pee · Poo" });
    expect(getLogActivityPresentation({ type: "checkIn", nothing: true, eliminationKinds: [] }, labels)).toEqual({ icons: ["circle-outline"], label: "Nothing yet" });
    expect(getLogActivityPresentation({ type: "routine", kind: "meal" }, labels)).toEqual({ icons: ["food"], label: "Eat" });
    expect(getLogActivityPresentation({ type: "routine", kind: "drink" }, labels)).toEqual({ icons: ["cup-water"], label: "Drink" });
    expect(getLogActivityPresentation({ type: "routine", kind: "play" }, labels)).toEqual({ icons: ["tennis-ball"], label: "Play" });
    expect(getLogActivityPresentation({ type: "routine", kind: "walk" }, labels)).toEqual({ icons: ["walk"], label: "Walk" });
    expect(buildLogEntryAccessibilityLabel("Luna", "Pee · Poo", "3 Sep 2026, 10:14")).toBe("Luna, Pee · Poo, 3 Sep 2026, 10:14");
  });
});
