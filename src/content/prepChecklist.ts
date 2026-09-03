export type PrepChecklistItem = {
  id: string;
  icon: string;
  title: string;
  detail: string;
};

/** Practical, non-medical essentials to prepare before puppy pick-up. */
export const PREP_CHECKLIST: PrepChecklistItem[] = [
  { id: "safe_space", icon: "🏠", title: "Set up a quiet safe space", detail: "A bed, water, and a place to rest away from busy foot traffic." },
  { id: "food", icon: "🥣", title: "Buy the current food", detail: "Start with the breeder or rescue's food and change gradually if needed." },
  { id: "bowls", icon: "🍽️", title: "Prepare food and water bowls", detail: "Choose stable, easy-to-clean bowls and place fresh water nearby." },
  { id: "toilet", icon: "🧻", title: "Stock up for toilet trips", detail: "Bags, cleaning supplies, and a simple route outside the home." },
  { id: "harness", icon: "🦮", title: "Fit a harness and ID tag", detail: "Check the fit gently and add your phone number to the tag." },
  { id: "chews", icon: "🦴", title: "Choose safe chews and toys", detail: "Have a few options ready for chewing, play, and quiet enrichment." },
  { id: "car", icon: "🚗", title: "Plan the journey home", detail: "Use a secured carrier or harness and bring a towel for the ride." },
  { id: "vet", icon: "🩺", title: "Book a vet appointment", detail: "Bring the puppy's records and agree vaccination and parasite plans." },
  { id: "household", icon: "👨‍👩‍👧", title: "Agree household routines", detail: "Decide who handles meals, toilet trips, rest, and night support." },
];
