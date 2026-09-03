export type TimelineStage = {
  id: string;
  minDays: number;
  maxDays: number;
  ageLabel: string;
  title: string;
  summary: string;
  icon: string;
  actions: string[];
  safety: string;
  sourceLabel: string;
  sourceUrl: string;
};

export const PUPPY_TIMELINE: TimelineStage[] = [
  {
    id: "birth_to_8_weeks",
    minDays: 0,
    maxDays: 56,
    ageLabel: "Birth–8 weeks",
    title: "Build the base",
    summary: "This stage is mainly led by the breeder or rescue: safe early experiences, handling, rest, and life with the litter.",
    icon: "🧺",
    actions: [
      "Ask for vaccination, health, ID, feeding, and insurance records before handover.",
      "Ask what household sounds, surfaces, people, handling, and calm dogs the puppy has experienced.",
      "Prepare a quiet bed, secure travel setup, puppy-safe room, and fast route to the toilet area.",
      "Plan a calm first week with very few visitors and no pressure to perform.",
    ],
    safety: "In Sweden, puppies should normally stay with their mother until at least eight weeks. Treat earlier handover as a welfare issue and ask a veterinarian or authority for advice.",
    sourceLabel: "Jordbruksverket: caring for dogs",
    sourceUrl: "https://jordbruksverket.se/djur/hundar-katter-och-smadjur/hundar/sa-skoter-du-din-hund",
  },
  {
    id: "8_to_10_weeks",
    minDays: 56,
    maxDays: 70,
    ageLabel: "8–10 weeks",
    title: "Feel safe at home",
    summary: "Keep life small and predictable. Security, sleep, toilet opportunities, and gentle connection come first.",
    icon: "🏡",
    actions: [
      "Offer a toilet trip after sleep, food, water, and play; reward outdoors and handle accidents neutrally.",
      "Practise the name and eye contact for one minute, two or three times a day.",
      "Pair one-second touches of shoulders, paws, ears, collar, and mouth with food.",
      "Protect undisturbed rest and let your puppy choose when to approach people.",
      "Confirm an individual vaccination and health plan with your veterinarian.",
    ],
    safety: "Do not leave a young puppy for long periods. Begin separation only after they are settled, using seconds rather than minutes.",
    sourceLabel: "SKK: Welcome puppy",
    sourceUrl: "https://www.skk.se/globalassets/globala-filer/broschyrer/valkommen-valp-m54.pdf",
  },
  {
    id: "10_to_12_weeks",
    minDays: 70,
    maxDays: 84,
    ageLabel: "10–12 weeks",
    title: "Discover the world gently",
    summary: "Early socialisation is about calm, positive observation—not meeting everyone or being forced closer.",
    icon: "🌍",
    actions: [
      "Introduce one or two small experiences a day: a lift, traffic at a distance, a car ride, a visitor, or a new surface.",
      "Let your puppy watch from a comfortable distance and reward calm choices.",
      "Choose brief meetings with known, healthy, socially appropriate dogs instead of crowded dog parks.",
      "Start recall indoors and loose-leash steps in a quiet place.",
      "Consider a clean, reward-based puppy class that matches your veterinarian’s safety guidance.",
    ],
    safety: "Never force a frightened puppy towards something. Increase distance or leave, and ask your veterinarian which environments are appropriate during vaccination.",
    sourceLabel: "SKK: puppy life stages",
    sourceUrl: "https://www.skk.se/aga-hund/hundens-vardag/hundens-olika-aldrarfaser/",
  },
  {
    id: "12_to_16_weeks",
    minDays: 84,
    maxDays: 112,
    ageLabel: "12–16 weeks",
    title: "Practise foundations through play",
    summary: "Short, successful repetitions now make everyday skills easier later.",
    icon: "🎓",
    actions: [
      "Practise recall on a long line, dropping or trading objects, and settling while you move nearby.",
      "Continue short positive visits to calm public places, transport, grooming, and suitable dogs.",
      "Increase alone time in tiny steps, returning before your puppy becomes worried.",
      "Keep toilet breaks frequent and use the log to spot each puppy’s real pattern.",
      "Record vaccinations and follow the schedule agreed with your veterinarian.",
    ],
    safety: "Seek veterinary help for pain, limping, repeated vomiting or diarrhoea, poor appetite, or sudden behaviour change. Persistent fear or distress deserves qualified behaviour support.",
    sourceLabel: "SVA: vaccination of dogs",
    sourceUrl: "https://www.sva.se/djurhaelsa/djurslag-a-oe/sport-och-saellskapsdjur/hund/vaccination-av-hund/",
  },
  {
    id: "4_to_6_months",
    minDays: 112,
    maxDays: 183,
    ageLabel: "4–6 months",
    title: "Teething and life skills",
    summary: "Chewing, growing independence, and cooperative care take centre stage.",
    icon: "🦷",
    actions: [
      "Offer puppy-safe chews and redirect biting calmly; protect rest when play becomes frantic.",
      "Build tooth brushing, nail care, brushing, ear checks, and vet handling one easy step at a time.",
      "Practise leave-it, calm greetings, scent games, leash skills, and recall on a long line.",
      "Use self-paced play and sniffing; avoid repetitive high jumps, hard running, and forced exercise.",
      "For dogs living in Sweden, confirm ID marking and registration with Jordbruksverket before four months.",
    ],
    safety: "Growth rate varies greatly by breed and size. Ask your veterinarian about food, body condition, teeth, supplements, and appropriate exercise rather than following a universal schedule.",
    sourceLabel: "Jordbruksverket: ID and registration",
    sourceUrl: "https://jordbruksverket.se/djur/hundar-katter-och-smadjur/hundar/mark-och-registrera-hundar",
  },
  {
    id: "6_to_9_months",
    minDays: 183,
    maxDays: 274,
    ageLabel: "6–9 months",
    title: "Navigate adolescence",
    summary: "Distraction and temporary regression are normal. Lower the difficulty and keep rewarding the basics.",
    icon: "🧭",
    actions: [
      "Return to quiet training locations whenever familiar cues become difficult.",
      "Keep a long line for recall if distractions currently win, and reward spontaneous check-ins.",
      "Practise calm greetings, mat settling, loose leash, and cooperative handling in short sessions.",
      "Balance movement with sniffing, food puzzles, chew time, and adequate rest.",
      "Discuss puberty and any spay or neuter decision individually with your veterinarian.",
    ],
    safety: "Do not label fear, pain, or distress as stubbornness. Seek qualified help for persistent fear, aggression, pain, or separation distress.",
    sourceLabel: "SKK: dog life stages",
    sourceUrl: "https://www.skk.se/aga-hund/hundens-vardag/hundens-olika-aldrarfaser/",
  },
  {
    id: "9_to_12_months",
    minDays: 274,
    maxDays: 366,
    ageLabel: "9–12 months",
    title: "Consolidate adult life skills",
    summary: "Use real-life situations to strengthen the calm, useful behaviours your household needs most.",
    icon: "🌱",
    actions: [
      "Practise recall, leash walking, an emergency U-turn, leave-it, and polite greetings in varied safe places.",
      "Build calm settling during transport, grooming, cafés, visitors, and vet-style handling.",
      "Review the log: choose one improving habit to celebrate and one skill to simplify and repeat.",
      "Maintain predictable rest, outdoor time, sniffing, mental work, and breed-appropriate activity.",
      "Plan a one-year health and behaviour review, including vaccines, food, body condition, teeth, and records.",
    ],
    safety: "Physical maturity can arrive much later in large and giant breeds. Ask your veterinarian before intense running, long hikes, high jumps, or full agility training.",
    sourceLabel: "SKK: dog life stages",
    sourceUrl: "https://www.skk.se/aga-hund/hundens-vardag/hundens-olika-aldrarfaser/",
  },
];

export const ageInDays = (birthDate: string | null): number | null => {
  if (!birthDate) return null;
  const value = new Date(birthDate).getTime();
  if (Number.isNaN(value)) return null;
  return Math.max(0, Math.floor((Date.now() - value) / 86_400_000));
};

export const ageLabelForDays = (days: number | null): string => {
  if (days === null) return "Birth date needed";
  if (days < 112) return `${Math.max(1, Math.floor(days / 7))} weeks old`;
  if (days < 366) return `${Math.max(1, Math.floor(days / 30.44))} months old`;
  return `${(days / 365.25).toFixed(1)} years old`;
};
