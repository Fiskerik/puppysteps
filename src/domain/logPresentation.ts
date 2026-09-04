import type { EliminationKind, RoutineEventKind } from "./models";

export const ALL_DOGS_FILTER = "all" as const;

export type LogActivityIcon =
  | "circle-outline"
  | "cup-water"
  | "emoticon-poop"
  | "food"
  | "sleep"
  | "tennis-ball"
  | "walk"
  | "water"
  | "weather-sunny"
  | "car";

export type LogActivityLabels = {
  pee: string;
  poo: string;
  nothing: string;
  routine: Record<RoutineEventKind, string>;
};

export type LogActivity =
  | { type: "checkIn"; nothing: boolean; eliminationKinds: readonly EliminationKind[] }
  | { type: "routine"; kind: RoutineEventKind };

/** Returns the all-dogs view unless a known dog id was supplied by a deep link. */
export const resolveLogDogFilter = (dogIds: readonly string[], deepLinkedDogId?: string | readonly string[]): string => {
  const candidate = Array.isArray(deepLinkedDogId) ? deepLinkedDogId[0] : deepLinkedDogId;
  return candidate && dogIds.includes(candidate) ? candidate : ALL_DOGS_FILTER;
};

export const shouldShowDogIdentity = (dogFilter: string, dogCount: number): boolean => dogFilter === ALL_DOGS_FILTER && dogCount > 1;

/** Maps persisted activity data to UI icon names and a localized, screen-reader-ready label. */
export const getLogActivityPresentation = (activity: LogActivity, labels: LogActivityLabels): { icons: LogActivityIcon[]; label: string } => {
  if (activity.type === "routine") {
    const iconByKind: Record<RoutineEventKind, LogActivityIcon> = {
      wake: "weather-sunny",
      meal: "food",
      drink: "cup-water",
      play: "tennis-ball",
      walk: "walk",
      sleep: "sleep",
      car: "car",
    };
    return { icons: [iconByKind[activity.kind]], label: labels.routine[activity.kind] };
  }

  if (activity.nothing || activity.eliminationKinds.length === 0) return { icons: ["circle-outline"], label: labels.nothing };

  const iconByKind: Record<EliminationKind, LogActivityIcon> = { pee: "water", poo: "emoticon-poop" };
  const labelByKind: Record<EliminationKind, string> = { pee: labels.pee, poo: labels.poo };
  return {
    icons: activity.eliminationKinds.map((kind) => iconByKind[kind]),
    label: activity.eliminationKinds.map((kind) => labelByKind[kind]).join(" · "),
  };
};

export const buildLogEntryAccessibilityLabel = (dogName: string, activityLabel: string, dateTimeLabel: string): string => [dogName, activityLabel, dateTimeLabel].filter(Boolean).join(", ");
