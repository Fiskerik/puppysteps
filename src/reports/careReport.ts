import type { Dog, EliminationEvent, RoutineEvent, RoutineEventKind, ToiletCheckIn } from "../domain/models";

export type CareReportRow = {
  label: string;
  value: string;
  icon: string;
};

export type CareReportSection = {
  title: string;
  rows: CareReportRow[];
};

export type CareReportLabels = {
  title: string;
  profile: string;
  routine: string;
  progress: string;
  breed: string;
  weight: string;
  allergies: string;
  microchip: string;
  walks: string;
  meals: string;
  drinks: string;
  sleep: string;
  outdoorPottyWins: string;
  loggedMoments: string;
  lessonsCompleted: string;
  points: string;
  notRecorded: string;
  noneRecorded: string;
  notEnoughData: string;
};

export type CareReportInput = {
  dog: Dog;
  locale: string;
  routineEvents: RoutineEvent[];
  eliminationEvents: EliminationEvent[];
  checkIns: ToiletCheckIn[];
  completedLessons: number;
  points: number;
  tierName: string;
  includeMicrochip: boolean;
  /** A safe-to-embed `data:image/...;base64,...` string, created by the native layer when needed. */
  photoDataUri?: string | null;
  generatedAt?: Date;
  labels?: Partial<CareReportLabels>;
};

export type CareReport = {
  title: string;
  dogName: string;
  dogAvatar: string;
  photoDataUri: string | null;
  generatedAt: Date;
  sections: CareReportSection[];
};

export const DEFAULT_CARE_REPORT_LABELS: CareReportLabels = {
  title: "Puppysteps care report",
  profile: "Profile",
  routine: "Usual routine",
  progress: "Recent progress",
  breed: "Breed",
  weight: "Weight",
  allergies: "Allergies",
  microchip: "Microchip",
  walks: "Walks",
  meals: "Meals",
  drinks: "Drinks",
  sleep: "Sleep",
  outdoorPottyWins: "Outdoor potty wins",
  loggedMoments: "Logged moments",
  lessonsCompleted: "Lessons completed",
  points: "Points",
  notRecorded: "Not recorded",
  noneRecorded: "None recorded",
  notEnoughData: "Not enough data yet",
};

const validDate = (value: string): Date | null => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const timeFormatter = (locale: string): Intl.DateTimeFormat => {
  try {
    return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
};

/**
 * Builds a human-readable recent routine pattern. The latest five valid events
 * are used so the report reflects the dog's current rhythm rather than an old
 * historical average.
 */
export function routinePattern(events: RoutineEvent[], kind: RoutineEventKind, locale: string, fallback = DEFAULT_CARE_REPORT_LABELS.notEnoughData): string {
  const formatter = timeFormatter(locale);
  const values = events
    .filter((event) => event.kind === kind)
    .map((event) => ({ event, date: validDate(event.occurredAt) }))
    .filter((item): item is { event: RoutineEvent; date: Date } => item.date !== null)
    .sort((left, right) => right.date.getTime() - left.date.getTime())
    .slice(0, 5)
    .map((item) => ({ label: formatter.format(item.date), minutes: item.date.getHours() * 60 + item.date.getMinutes() }));
  const distinct = [...new Map(values.map((value) => [value.label, value])).values()]
    .sort((left, right) => left.minutes - right.minutes)
    .map((value) => value.label);
  return distinct.length ? distinct.join(" · ") : fallback;
}

export function buildCareReport(input: CareReportInput): CareReport {
  const labels = { ...DEFAULT_CARE_REPORT_LABELS, ...input.labels };
  const routine = (kind: RoutineEventKind) => routinePattern(input.routineEvents, kind, input.locale, labels.notEnoughData);
  const profileRows: CareReportRow[] = [
    { label: labels.breed, value: input.dog.breed?.trim() || labels.notRecorded, icon: "dog" },
    { label: labels.weight, value: input.dog.weightKg === null ? labels.notRecorded : `${input.dog.weightKg} kg`, icon: "scale-bathroom" },
    { label: labels.allergies, value: input.dog.allergies?.trim() || labels.noneRecorded, icon: "alert-circle-outline" },
  ];
  if (input.includeMicrochip) profileRows.splice(2, 0, { label: labels.microchip, value: input.dog.chipNumber?.trim() || labels.notRecorded, icon: "barcode-scan" });

  const outdoorPottyWins = input.eliminationEvents.filter((event) => event.location === "outside").length;
  const loggedMoments = input.checkIns.length + input.routineEvents.length;

  return {
    title: labels.title,
    dogName: input.dog.name.trim() || "Your dog",
    dogAvatar: input.dog.avatar || "🐶",
    photoDataUri: input.photoDataUri ?? null,
    generatedAt: input.generatedAt ?? new Date(),
    sections: [
      { title: labels.profile, rows: profileRows },
      {
        title: labels.routine,
        rows: [
          { label: labels.walks, value: routine("walk"), icon: "walk" },
          { label: labels.meals, value: routine("meal"), icon: "food-variant" },
          { label: labels.drinks, value: routine("drink"), icon: "cup-water" },
          { label: labels.sleep, value: routine("sleep"), icon: "weather-night" },
        ],
      },
      {
        title: labels.progress,
        rows: [
          { label: labels.outdoorPottyWins, value: String(outdoorPottyWins), icon: "paw" },
          { label: labels.loggedMoments, value: String(loggedMoments), icon: "notebook-outline" },
          { label: labels.lessonsCompleted, value: String(input.completedLessons), icon: "school-outline" },
          { label: labels.points, value: `${input.points} · ${input.tierName}`, icon: "medal-outline" },
        ],
      },
    ],
  };
}

/** Escapes user-entered values before they are inserted into printable HTML. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

/**
 * Produces portable, one-page-oriented HTML for Expo Print. It deliberately has
 * no native dependency so it can be tested and reused by another share target.
 */
export function buildCareReportHtml(report: CareReport, locale = "en-GB"): string {
  const generatedAt = (() => {
    try {
      return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(report.generatedAt);
    } catch {
      return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(report.generatedAt);
    }
  })();
  const photo = report.photoDataUri
    ? `<img class="avatar-image" src="${escapeHtml(report.photoDataUri)}" alt="${escapeHtml(report.dogName)}" />`
    : `<div class="avatar-fallback" aria-label="${escapeHtml(report.dogName)}">${escapeHtml(report.dogAvatar)}</div>`;
  const sections = report.sections.map((section) => `
    <section>
      <h2>${escapeHtml(section.title)}</h2>
      <dl>${section.rows.map((row) => `<div class="row"><dt><strong>${escapeHtml(row.label)}</strong></dt><dd>${escapeHtml(row.value)}</dd></div>`).join("")}</dl>
    </section>`).join("");
  return `<!doctype html>
<html lang="${escapeHtml(locale)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      @page { size: A4; margin: 15mm; }
      * { box-sizing: border-box; }
      body { color: #20332B; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 12px; line-height: 1.35; margin: 0; }
      .report { border: 1px solid #E3E8E2; border-radius: 20px; overflow: hidden; }
      header { background: #DDEBE5; display: flex; align-items: center; gap: 14px; padding: 18px; }
      .avatar-image, .avatar-fallback { width: 58px; height: 58px; border-radius: 29px; flex: 0 0 58px; }
      .avatar-image { object-fit: cover; background: #E9C568; }
      .avatar-fallback { align-items: center; background: #E9C568; display: flex; font-size: 29px; justify-content: center; }
      h1 { font-size: 23px; line-height: 1.1; margin: 0 0 4px; }
      .meta { color: #52665D; margin: 0; }
      .content { padding: 4px 18px 14px; }
      section { border-top: 1px solid #E3E8E2; padding: 12px 0 2px; }
      section:first-child { border-top: 0; }
      h2 { color: #235247; font-size: 14px; margin: 0 0 7px; }
      dl { margin: 0; }
      .row { display: flex; justify-content: space-between; gap: 16px; padding: 3px 0; }
      dt, dd { margin: 0; }
      dt { color: #52665D; }
      dd { color: #20332B; font-weight: 700; text-align: right; }
      footer { color: #6F7C75; font-size: 10px; padding: 0 18px 14px; }
    </style>
  </head>
  <body><main class="report"><header>${photo}<div><h1>${escapeHtml(report.dogName)}</h1><p class="meta">${escapeHtml(report.title)} · ${escapeHtml(generatedAt)}</p></div></header><div class="content">${sections}</div><footer>Shared from Puppysteps</footer></main></body>
</html>`;
}
