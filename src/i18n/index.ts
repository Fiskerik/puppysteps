import i18n from "i18next";
import { getLocales } from "expo-localization";
import { initReactI18next } from "react-i18next";
import type { Locale } from "../domain/models";

const sv = {
  nav: { today: "Idag", log: "Logg", learn: "Träna", journey: "Resan", profile: "Profil" },
  common: { save: "Spara", cancel: "Avbryt", close: "Stäng", add: "Lägg till", done: "Klart", undo: "Ångra", now: "Nu", outside: "Ute", inside: "Inne", nothing: "Inget ännu", today: "Idag", allDogs: "Alla hundar" },
  today: { eyebrow: "En lugnare dag med", next: "Nästa förslag", reason: "Varför just nu?", log: "Logga snabbt", routine: "Rutin", wake: "Vaknade", meal: "Åt", play: "Lek", noReminder: "Ingen påminnelse ännu", noReminderBody: "Slå på notiser när du är redo – du kan ändra när som helst.", enable: "Visa min rutin", agenda: "Dagens hundar", last: "Senaste händelser", responsible: "Jag ansvarar nu", away: "Jag är inte ansvarig just nu", age: "Åldersanpassad starttid", tip: "Belöna lugnt direkt ute.", subtle: "Följ nästa lilla steg och låt olyckor vara neutrala." },
  log: { title: "Vad hände?", subtitle: "Välj en händelse för varje sak – kiss och bajs kan sparas tillsammans.", pee: "Kiss", poo: "Bajs", outside: "Ute", inside: "Inne", nothing: "Inget ännu", time: "När hände det?", notes: "Anteckning (valfritt)", saved: "Sparat", accident: "Det händer. Vi provar lite tidigare nästa gång.", pooSaved: "Sparat. Det hjälper oss se mönstret.", followUp: "Prova en lugn kissrunda om 15 minuter.", history: "Senaste händelser", hint: "Håll inne en rad för att ta bort och räkna om nästa förslag.", emptyTitle: "Loggen börjar med en liten stund ute", emptyBody: "Spara kiss, bajs eller Inget ännu så lär sig förslagen er vardag.", deleteConfirm: "Ta bort den här händelsen?", deleteAction: "Ta bort" },
  learn: { title: "Små steg, stor skillnad", subtitle: "Korta, granskade övningar när ni behöver dem.", reviewed: "Granskad", minutes: "min", start: "Börja", practice: "Öva igen", video: "Kort video", search: "Sök efter ett problem", noResults: "Inget hittades ännu." },
  journey: { title: "Lunas resa", subtitle: "Spara de små ögonblicken som blir stora minnen.", growthTitle: "växer varje dag", growthBody: "Milstolparna är till för minnen, inte prestation.", milestones: "Milstolpar", add: "Lägg till milstolpe", empty: "Din tidslinje börjar här.", emptyBody: "Lägg till hemkomst, första kursen eller något ni vill minnas.", addPrompt: "Vad vill du minnas?", custom: "Egen milstolpe" },
  profile: { title: "Tryggt för hela familjen", dogs: "Hundar", addDog: "Lägg till hund", settings: "Inställningar", language: "Språk", reminders: "Påminnelser", quiet: "Tysta timmar", support: "Hjälp och support", privacy: "Integritet", export: "Exportera min data", delete: "Radera lokal data", local: "Lokal data", localBody: "Du behöver inget konto för att komma igång. Dina loggar sparas på den här enheten.", swedish: "Svenska", notificationOn: "Påminnelser är aktiverade", notificationOff: "Påminnelser är avstängda", noDog: "Lägg till din första hund", noDogBody: "En liten profil räcker för att börja.", deleteConfirm: "Detta raderar hundprofiler, loggar, milstolpar, lokala media och väntande notiser från den här enheten.", deleteAction: "Radera", exportError: "Export kunde inte startas", localeHint: "Fullt granskade språk släpps stegvis. Språkväljaren och kärnflödet är förberedda från dag ett.", supportHint: "Support ska vara åtkomligt i appen · Ingen annonsering eller beteendeförsäljning." },
  reason: { age_baseline: "Åldersanpassad starttid", after_wake: "Efter vila", after_meal: "Efter mat eller vatten", after_play: "Efter lek eller träning", recent_pee_accident: "Lite tidigare efter en olycka", bowel_pattern: "Mönster efter mat och morgon", manual: "Manuell justering", follow_up: "Följ upp en lugn runda" },
  dog: { name: "Hundens namn", breed: "Ras eller blandras", unknown: "Blandras/okänd", birth: "Födelsedatum (ungefär går bra)", added: "Hund tillagd", limit: "Version 1 stöder två hundar på den här enheten." },
  notifications: { title: "Påminnelser när ni behöver dem", body: "Puppysteps räknar ut nästa förslag lokalt på telefonen. Leverans beror på iOS inställningar.", allow: "Visa min första påminnelse", later: "Inte nu", disabled: "Notiser är inte tillåtna. Du kan aktivera dem i Inställningar." },
  onboarding: { title: "Börja med er hund", body: "En liten profil räcker. Du kan komplettera och ändra allt senare.", start: "Skapa hundprofil" },
};

const en = {
  ...sv,
  nav: { today: "Today", log: "Log", learn: "Learn", journey: "Journey", profile: "Profile" },
  common: { ...sv.common, save: "Save", cancel: "Cancel", close: "Close", add: "Add", done: "Done", undo: "Undo", now: "Now", outside: "Outside", inside: "Inside", nothing: "Nothing yet", today: "Today", allDogs: "All dogs" },
  today: { ...sv.today, eyebrow: "A calmer day with", next: "Next suggestion", reason: "Why now?", log: "Quick log", routine: "Routine", wake: "Woke up", meal: "Ate", play: "Play", noReminder: "No reminder yet", noReminderBody: "Turn reminders on when you are ready — you can change this any time.", enable: "Show my routine", agenda: "Today's dogs", last: "Recent events", responsible: "I am responsible now", away: "I am not responsible right now", tip: "Reward calmly outside.", subtle: "Follow the next small step and let accidents stay neutral." },
  log: { ...sv.log, title: "What happened?", subtitle: "Choose one outcome for each function — pee and poo can be saved together.", pee: "Pee", poo: "Poo", outside: "Outside", inside: "Inside", nothing: "Nothing yet", time: "When did it happen?", notes: "Note (optional)", saved: "Saved", accident: "It happens. We will try a little earlier next time.", pooSaved: "Saved. This helps us see the pattern.", followUp: "Try a calm pee trip in 15 minutes.", history: "Recent events", hint: "Hold a row to remove it and recalculate the next suggestion.", emptyTitle: "Your log starts with a small trip outside", emptyBody: "Save pee, poo, or Nothing yet so suggestions learn your day.", deleteConfirm: "Remove this event?", deleteAction: "Remove" },
  learn: { ...sv.learn, title: "Small steps, big difference", subtitle: "Short, reviewed exercises when you need them.", reviewed: "Reviewed", minutes: "min", start: "Start", practice: "Practice again", video: "Short video", search: "Search for a problem", noResults: "Nothing found yet." },
  journey: { ...sv.journey, title: "Your puppy's journey", subtitle: "Keep the small moments that become big memories.", growthTitle: "grows every day", growthBody: "Milestones are for memories, not performance.", milestones: "Milestones", add: "Add milestone", empty: "Your timeline starts here.", emptyBody: "Add coming home, a first class, or something you want to remember.", addPrompt: "What do you want to remember?", custom: "Custom milestone" },
  profile: { ...sv.profile, title: "Safe for the whole household", dogs: "Dogs", addDog: "Add dog", settings: "Settings", language: "Language", reminders: "Reminders", quiet: "Quiet hours", support: "Help and support", privacy: "Privacy", export: "Export my data", delete: "Delete local data", local: "Local data", localBody: "You do not need an account to get started. Your logs are stored on this device.", swedish: "Swedish", notificationOn: "Reminders are on", notificationOff: "Reminders are off", noDog: "Add your first dog", noDogBody: "A small profile is enough to begin.", deleteConfirm: "This deletes dog profiles, logs, milestones, local media, and pending reminders from this device.", deleteAction: "Delete", exportError: "Export could not start", localeHint: "Fully reviewed languages are released in stages. The selector and core flow are prepared from day one.", supportHint: "Support should be available in the app · No advertising or behavioral data sales." },
  reason: { ...sv.reason, age_baseline: "Age-based starting time", after_wake: "After rest", after_meal: "After food or water", after_play: "After play or training", recent_pee_accident: "A little earlier after an accident", bowel_pattern: "Pattern after food and morning", manual: "Manual adjustment", follow_up: "Follow up a calm trip" },
  dog: { ...sv.dog, name: "Dog's name", breed: "Breed or mix", unknown: "Mixed/unknown", birth: "Birth date (estimate is fine)", added: "Dog added", limit: "Version 1 supports two dogs on this device." },
  notifications: { ...sv.notifications, title: "Reminders when you need them", body: "Puppysteps calculates the next suggestion locally on your phone. Delivery depends on iOS settings.", allow: "Show my first reminder", later: "Not now", disabled: "Notifications are not allowed. You can enable them in Settings." },
  onboarding: { ...sv.onboarding, title: "Start with your dog", body: "A small profile is enough. You can complete and change everything later.", start: "Create dog profile" },
};

const smallLocale = (label: string) => ({
  ...en,
  nav: { today: label === "fr" ? "Aujourd’hui" : label === "de" ? "Heute" : label === "da" ? "I dag" : label === "fi" ? "Tänään" : "I dag", log: label === "fr" ? "Journal" : label === "de" ? "Logbuch" : label === "fi" ? "Loki" : "Log", learn: label === "fr" ? "Apprendre" : label === "de" ? "Trainieren" : label === "da" ? "Træn" : label === "fi" ? "Harjoittele" : "Tren", journey: label === "fr" ? "Parcours" : label === "de" ? "Reise" : label === "da" ? "Rejse" : label === "fi" ? "Matka" : "Reise", profile: label === "fr" ? "Profil" : label === "de" ? "Profil" : label === "da" ? "Profil" : label === "fi" ? "Profiili" : "Profil" },
});

const resources = {
  "sv-SE": { translation: sv },
  "en-GB": { translation: en },
  "fr-FR": { translation: smallLocale("fr") },
  "de-DE": { translation: smallLocale("de") },
  "da-DK": { translation: smallLocale("da") },
  "fi-FI": { translation: smallLocale("fi") },
  "nb-NO": { translation: smallLocale("nb") },
};

const supported: Locale[] = ["sv-SE", "en-GB", "fr-FR", "de-DE", "da-DK", "fi-FI", "nb-NO"];
const detected = getLocales()[0]?.languageTag;
const initialLocale = supported.find((locale) => locale === detected) ?? supported.find((locale) => locale.startsWith(detected?.split("-")[0] ?? "")) ?? "sv-SE";

// i18next exposes `use` on its default instance; this is the documented setup API.
// eslint-disable-next-line import/no-named-as-default-member
void i18n.use(initReactI18next).init({ resources, lng: initialLocale, fallbackLng: "en-GB", interpolation: { escapeValue: false }, returnNull: false });

export { i18n, supported };
