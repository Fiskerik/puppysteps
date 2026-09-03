# Puppysteps — product and delivery plan

> Status: proposed plan  
> Research date: 2026-09-03  
> Primary market: Sweden  
> Initial platform: iPhone  
> Technology: React Native + Expo + TypeScript  
> Delivery: GitHub + Codemagic  

## 1. Executive decision

Puppysteps should be a calm, Swedish-first companion for the period from preparing for a puppy through puppyhood and adolescence. Its main job is not to provide the largest content library. Its main job is to answer:

> What should we do with our puppy right now, and what is the next sensible step?

The product wedge is adaptive house-training (`rumsrenhet`): a very fast log, useful local notifications, and a transparent schedule that learns carefully from the puppy's age, routine, and recent outcomes. Training lessons, milestones, health records, breed-aware guidance, and Swedish checklists support that daily loop.

The recommended positioning is:

> The calm, trustworthy Swedish puppy companion that helps the whole household know what to do today.

### What makes it meaningfully different

1. Best-in-class adaptive house-training rather than generic potty articles.
2. Swedish rules, terminology, seasons, services, and everyday living built into the product—not added as a translation later.
3. A low-pressure daily plan with a maximum of a few relevant actions.
4. Household consistency: every caregiver can see what happened and what comes next.
5. Evidence and expert review, with clear boundaries between training guidance and veterinary care.
6. Transparent pricing, accessible support, dependable restore/sync, and privacy-friendly defaults.
7. A path through adolescence so the app remains useful after the first few months.

### Important naming gate

`Puppysteps` must remain a working title until naming clearance is complete. A current App Store competitor is already called **PupSteps: Puppy Training**, with almost the same spelling and the same category. This creates discoverability, customer-confusion, App Review, and possible trademark risk. Apple also prohibits misleading or copycat names and metadata. Complete an App Store, company-name, domain, social-handle, EUIPO, and PRV trademark search with legal review before commissioning the final identity. Do not copy either competitor's logo, illustrations, screenshots, wording, or distinctive trade dress. [PupSteps listing](https://apps.apple.com/us/app/pupsteps-puppy-training/id6789964653) · [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

## 2. Research-derived strategy

### Competitor and review synthesis

All competitor facts below are storefront observations made on 2026-09-03. Ratings, prices, feature claims, language support, accessibility declarations, and minimum OS versions must be rechecked before a pricing decision, design sign-off, or App Store submission.

| Evidence | What works | What fails or is missing | Puppysteps response |
|---|---|---|---|
| **PupSteps** | Calm weekly structure; 52-week plan; warm, low-pressure card UI; editable daily schedule; socialization checklist; growth/vaccine journal; export; iCloud sync; no account, ads, or declared tracking; one-time unlock. | Its current App Store pages have insufficient ratings/reviews for a defensible review trend. The listed iOS 18+ floor excludes older devices; languages are English/French; no accessibility support is declared. US description and IAP metadata show conflicting USD 19.99/USD 49.99 figures, while France metadata differs again, so the true offer requires App Store Connect verification. Its France listing exposes internal placeholder instructions instead of finished copy. | Keep calm structure, privacy, editable plans, useful exports, and a non-punitive tone. Add Swedish relevance, broader device support, rigorous localization QA, accessibility, clearer pricing, adaptive reminders, household use, and a longer lifecycle. |
| **Zigzag** | Highly polished journey; 250+ lessons, many supported by how-to videos and written steps; three manageable daily tasks; age/breed personalization; practice queue; progress feedback; preparation before arrival; playful emotional design. Reviewers often praise clear short lessons, video, reassurance, accountability, and responsive contextual human coaching. | Complaints cluster around surprise/unclear trial pricing, forced-paywall perception, subscription/restore and account-access failures, hard-to-find support, content that feels basic or generic, and inconsistent coach advice. Breed-coverage gaps can damage trust even when later fixed. Independently, puppy-only positioning creates a lifecycle risk. The Swedish listing is English-only and declares no accessibility support. | Use a small daily plan, video plus text, progress and practice loops, and warm reassurance. Make the free core genuinely useful, show price and renewal details early, keep Settings/support outside entitlement gates, preserve data locally, test restore/sync rigorously, review advice locally, provide mixed/unknown fallback plus a breed-request route, and extend through adolescence. |
| **Swedish alternatives** | Svenska Brukshundklubben's Duktig hund demonstrates demand for short Swedish films, consistent family methods, offline access, and links to real courses/instructors at a low one-time price. | A general lesson library does not solve timely routines or adaptive house-training. | Do not compete on video count alone. Own the real-time routine and connect digital guidance to qualified Swedish trainers when useful. |

Evidence: [PupSteps App Store listing](https://apps.apple.com/us/app/pupsteps-puppy-training/id6789964653), [PupSteps France listing](https://apps.apple.com/fr/app/pupsteps-puppy-training/id6789964653), [Zigzag Swedish listing](https://apps.apple.com/se/app/zigzag-puppy-dog-training/id1550121165), [Zigzag official site](https://zigzag.dog/en-us/), [Zigzag UK reviews](https://apps.apple.com/gb/app/zigzag-puppy-dog-training/id1550121165?platform=iphone&see-all=reviews), [Zigzag Google Play reviews](https://play.google.com/store/apps/details?id=nl.navara.zigzag), [Zigzag Trustpilot reviews](https://www.trustpilot.com/review/zigzag.dog), [Duktig hund](https://brukshundklubben.se/utbildning-aktivitet/utbildning/appen-duktig-hund/).

Review caveat: storefront reviews are self-selected and vary by country and version. On the research date, Zigzag showed 4.8/5 from 17 Swedish ratings, roughly 4.8/5 from thousands of UK ratings, about 4.6/5 from 5,000+ Google Play reviews, and 2.9/5 from 17 mixed and partly irrelevant Trustpilot reviews. Treat repeated themes as design signals, not statistically representative market research. PupSteps' storefront explicitly had too few reviews for an overview.

### Visual direction

Visual inspection of the 2026-09-03 storefront screenshots suggests two useful patterns; retain a dated research capture or design-research record before relying on these observations:

- PupSteps uses warm cream/amber surfaces, generous white cards, large headings, circular progress, and a simple five-tab hierarchy.
- Zigzag uses high-energy coral/navy marketing, editorial headings, playful line illustrations, named personalization, clear journey progress, and video-led step screens.

Puppysteps should combine their clarity and warmth while establishing a distinct, testable Scandinavian identity:

- Warm off-white canvas rather than clinical white.
- Pine/forest green as the main action color, with soft moss, muted sky, and terracotta accents.
- Dog photography as the personal anchor; simple original line illustrations for empty states and education.
- Large, rounded cards with one dominant action, not dense dashboards.
- Friendly sans-serif body type with excellent Nordic/Western European glyph coverage; an optional warm display face only for short headings.
- Progress shown as supportive signals—`learning your rhythm`, `a calmer week`—rather than guilt-based streaks.
- Motion limited to short, optional celebrations and respectful of Reduced Motion.

Before production UI work, approve a small originality package: a moodboard with provenance, typography specimens, icon and illustration rules, two materially different Today concepts, two lesson concepts, and Swedish App Store screenshot storyboards. The final design must not imitate Zigzag's mascot treatment, paw/star completion language, journey-card composition, or screenshot framing, nor PupSteps' specific card/progress composition. `Scandinavian` should mean restrained information density, natural material/color references, plain Swedish language, strong typography, and functional motion—not a vague style label.

Preliminary tokens, subject to contrast testing:

| Token | Direction |
|---|---|
| Background | warm oat `#F7F4ED` |
| Text | deep forest `#20332B` |
| Primary | pine `#2F6B5F` |
| Primary tint | pale moss `#DDEBE5` |
| Accent | terracotta `#D97C59` |
| Highlight | muted sun `#E9C568` |
| Success | green `#2F7D5D` plus icon/text |
| Attention | brick `#A94F48` plus icon/text |

These are starting points, not production color pairs. Test every actual foreground/background pair. Terracotta and muted yellow must not be used for small text or as the only status signal.

## 3. Swedish market focus

On 2026-09-03, Jordbruksverket reported approximately 1,079,000 registered dogs and 783,000 registered dog owners; its page cautions that 2025 figures are not directly comparable with earlier years because of a register migration. SKK reported 39,304 pedigree registrations during 2025, not total new dogs. This is a meaningful but bounded market, making trust, referrals, and Nordic expansion more important than advertising-heavy growth. [Jordbruksverket statistics](https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-djur/hundregistret/statistik-ur-hundregistret) · [SKK 2025 registrations](https://www.skk.se/nyheter/2026/1/okad-marknadsandel-2025-nar-fler-valde-rashund/)

### Primary users

1. **First-time puppy owner**  
   Feels overwhelmed, sleep-deprived, and unsure which advice to trust. Needs timely prompts and small, clear actions.

2. **Shared household or co-caregiver**  
   Partner, family member, dog sitter, or co-owner who needs to know when the puppy last ate, slept, peed, or had an accident—and to use the same training method.

3. **Experienced owner with a new or adopted puppy**  
   Does not want beginner content forced in sequence. Needs editable plans, direct access to current problems, and support for an estimated age or incomplete history.

### Acquisition audiences

- Breeders and puppy handover packs.
- Puppy-course instructors and local Brukshundklubben clubs.
- Veterinary clinics and animal hospitals.
- Swedish dog creators/newsletters.
- Insurance and pet-service partners only where editorial independence and privacy remain clear.

### Swedish launch motion

- Lead App Store messaging with the immediate job—`Färre gissningar mellan kissrundorna`—and show the notification → two-second log → explained next suggestion loop in the first three screenshots. Do not claim that the app guarantees faster house-training.
- Test Swedish search language with owners before locking metadata: likely concepts include `valp`, `rumsren`, `valpträning`, `kisschema`, and `hundträning`; validate demand and wording rather than keyword-stuffing.
- Recruit the first cohort through reward-based puppy-course instructors, breeders, clinics, and Brukshundklubben relationships. Give partners an editorially neutral handover link/QR, never access to an owner's behavioral data.
- Build referral around a useful artifact—a printable/shared first-week routine or trainer handoff report—not a manipulative streak or contact upload.
- Prepare five screenshot narratives for Swedish launch: `Vet vad som händer nu`, `Logga på sekunder`, `Ett schema som förklarar sig`, `Samma plan för familjen`, and `Svenska råd, tryggt granskade`. Validate comprehension and originality before production.

### Swedish editorial layer

Swedish content must not simply translate US/UK assumptions:

- All dogs in Sweden must be identified and registered in Jordbruksverket's central dog register; SKK registration does not replace it. Current rules say this normally must happen before four months, with special four-week rules for older or transferred dogs. Legal copy must be dated and versioned because requirements change. [Jordbruksverket](https://jordbruksverket.se/djur/hundar-katter-och-smadjur/hundar/mark-och-registrera-hundar)
- General welfare guidance says adult dogs should normally be taken out at least every six hours in daytime and puppies more often. This is neither a universal statutory deadline nor an appropriate puppy timer, and the app must not present it as either. [Jordbruksverket](https://jordbruksverket.se/djur/hundar-katter-och-smadjur/hundar/sa-skoter-du-din-hund)
- Do not import closed-crate-at-home recommendations without Swedish legal and expert review. Frame appropriate content around a voluntary safe resting place and legally compliant travel/acclimation, while preserving the statutory exceptions for transport, veterinary care, exhibition, and other defined situations. [SKK: Hund i bur](https://www.skk.se/aga-hund/hunden-och-lagen/hund-i-bur/)
- Include seasonally timed nature guidance: from 1 March through 20 August dogs require extra supervision and control so they do not run loose where wildlife may be present; do not incorrectly claim a universal leash rule, and note stricter local rules. [Naturvårdsverket](https://www.naturvardsverket.se/amnesomraden/allemansratten/sa-gor-vi-allemansratt/hundar-i-naturen/)
- Include apartment living, dark-season visibility, snow/cold, road salt, ticks, heat, public transport, and calm urban socialization—but have health/safety material reviewed by a Swedish veterinarian.
- Use positive, reward-based training. Swedish puppy guidance emphasizes frequent outings after sleep, food, and play and says not to punish indoor accidents. [SKK: puppy life stages](https://www.skk.se/aga-hund/hundens-vardag/hundens-olika-aldrarfaser/)

Every legal, registration, welfare, vaccination, parasite, travel, and seasonal item must show `last reviewed` and `effective from` where relevant. Name a Content & Safety Owner before beta; that owner is accountable for authority-source checks before every release, a quarterly freshness review, immediate correction/disable of critical stale content, and documented trainer/veterinary/legal sign-off appropriate to the risk class.

## 4. Product principles

1. **Today before library.** Lead with the next useful action, not a wall of articles.
2. **Log in seconds.** A sleep-deprived user should record an event one-handed in under five seconds.
3. **Guide, do not judge.** Accidents are neutral learning signals; never shame the owner or puppy.
4. **Explain adaptation.** Show why a reminder moved and always allow undo/manual adjustment.
5. **Local-first.** Logging and the next reminder work without internet.
6. **Household-consistent.** Show who logged an event and keep guidance identical for all caregivers.
7. **Evidence-aware.** Display author/reviewer, review date, and escalation boundaries where advice carries risk.
8. **Privacy by default.** No ads, data sale, cross-app tracking, or unnecessary location access.
9. **Accessible by default.** Text, video, progress, and controls must not rely on sight, hearing, color, or precise motion alone.
10. **Localization is product behavior.** Language, market, legal jurisdiction, date/time, units, content, video, notifications, paywall, and support all localize together.

## 5. Information architecture

Recommended bottom navigation:

| Area | Swedish label | Purpose |
|---|---|---|
| Today | `Idag` | Next toilet break, last events, today's one-to-three actions, quick reassurance. |
| Log | `Logg` | Timeline of toilet/routine events, corrections, and simple trends. |
| Learn | `Träna` | Searchable journey, short lessons, saved/practice items, urgent-problem access. |
| Journey | `Resan` | Development phases, milestones, Swedish checklists, memories. |
| Profile | `Profil` | Dog switcher, household, reminders, language, privacy, export, billing, help. |

A persistent central `+` or prominent Today card opens the quick log. Do not rely on a floating button alone; it needs a labeled, accessible alternative.

### Key screens

1. Language/market selection and welcome.
2. Dog setup.
3. Routine and goals.
4. Proposed first reminder plan.
5. Notification permission primer and native request.
6. Today.
7. Toilet check-in sheet.
8. Event history and correction.
9. House-training plan and explanation.
10. Trends.
11. Training journey and search.
12. Lesson with video, steps, transcript, practice rating, and safety notes.
13. Development timeline/milestones.
14. Dog switcher/profile.
15. Household members and invitation.
16. Reminder controls and quiet hours.
17. Privacy/export/delete.
18. Subscription/restore/refund help.
19. Support available before and after sign-in/paywall.

## 6. Public MVP scope

The first App Store release should prove the house-training loop. It should not attempt to ship every idea at once.

### P0 — required for version 1.0

- Swedish onboarding for breeder, adopted/rescue, mixed/unknown breed, and estimated birth date.
- Dog profile: name, photo optional, birth/estimated date, arrival date, sex optional, breed/mix/unknown, current weight optional, registration/chip details optional.
- Multiple dog profiles and an obvious dog switcher. Version 1 supports at least two active dogs locally, and the data model must never assume one dog.
- An `Alla hundar` agenda on Today shows each dog's next outing and recent events without merging their independent schedules; this is the version-one shared calendar/day view.
- Today screen with last pee/poo, next proposed outing, reason, and one-to-three relevant actions.
- Quick logging from Today and from a notification deep link.
- Outdoor pee, outdoor poo, indoor pee, indoor poo, and `nothing yet`; one pee outcome and one poo outcome can be combined only when they belong to the same check-in, while `nothing yet` is exclusive.
- Manual time correction, undo, and notes optional.
- Adaptive rule-based schedule with quiet hours, night mode, snooze, pause, manual override, and an explicit `Hemma / inte ansvarig just nu` device state; this never uses location tracking.
- Optional routine triggers: woke up, ate, drank, played/trained, car trip/excitement.
- Offline persistence plus on-device schedule calculation/recalculation; notification delivery remains best-effort under iOS permissions and system behavior.
- Simple 7-day/30-day history: outdoor share separately for observed pee and poo events, indoor accidents, common time windows, and progress narrative; missing/unlogged periods are excluded.
- Basic development timeline and custom milestones.
- A target launch set of 12 expert-reviewed Swedish lessons with short video, written steps, captions, and transcript; six complete lessons is the minimum cut line.
- Search and direct access to a relevant lesson; do not hard-lock urgent topics behind a linear journey.
- Swedish registration/care checklists with dated authoritative links.
- Multi-caregiver-ready schema. Optional account and one shared household should be included in 1.0 only if the week-four sync prototype meets reliability gates; otherwise ship it intact as 1.1 rather than weakening the offline core. Until sync ships, caregiver access and entitlements are not advertised.
- Settings/help accessible regardless of subscription or sync state.
- In-app data export and deletion; provide timestamped UTF-8 CSV plus machine-readable JSON with a field glossary, excluding chip/registration identifiers unless the user explicitly includes them. Account deletion is in-app if accounts are enabled.
- Localization framework and content schema for all seven planned locales, even though only fully reviewed locales appear in production.
- VoiceOver, Dynamic Type, contrast, reduced-motion, captions, transcripts, and 44×44-point minimum interaction targets.
- Privacy policy, terms, training/veterinary disclaimer, App Privacy inventory, support channel, and App Store metadata.

**Release floor and cut order:** never cut local onboarding, at least two dog profiles, the quick log, reminder engine, offline calculation/recalculation, basic Today/history, Swedish critical-path copy, privacy controls, or accessibility gates. If the 16-week plan slips, move household sync to 1.1 first, keep commerce disabled, reduce the lesson launch set from 12 to six complete items, keep only custom/basic milestones, and move 30-day advanced trends to P1. Do not trade away safety, data-loss, notification, localization, or accessibility validation to keep a date.

The minimum launch slice is therefore: local Swedish onboarding for up to two dogs, per-dog quick logging, explainable bladder and bowel reminder candidates, notification controls, an all-dogs agenda/basic history, six complete reviewed video lessons, a basic timeline, export/delete/support, and all safety/accessibility/release gates. The 16-week date assumes the team in section 18; with fewer people, move the date rather than dropping the two-dog or six-video requirements from the brief.

### P1 — first 8–12 weeks after launch

- Reliable shared household sync and per-device `I'm responsible now` reminders if not in 1.0.
- Full pre-arrival → puppy → adolescence journey.
- 40–60 training lessons and searchable problem guides.
- Breed-aware content pilot for Sweden's most common breeds plus mixed/unknown dogs.
- Growth/weight chart, vaccination record, medication/vet reminders, and PDF handoff report.
- Feeding schedule plus reviewed vaccination, deworming/parasite, medication, and veterinary reminders; never prescribe treatment or replace a veterinary plan.
- Photo memories and richer milestone timeline.
- Advanced house-training insights and weekly summaries.
- English, Norwegian Bokmål, and Danish after native review of the full critical path.
- Clear paid tier and purchase restoration after beta willingness-to-pay testing.

Capturing breed/mix/unknown is P0, but deep breed-specific guidance is deliberately P1. Version 1 may use only broad, expert-reviewed size/trait adaptations that remain useful for mixed and unknown dogs; it must not ship thin breed labels that imply unsupported personalization.

### P2 — later

- Finnish, German, and French content releases.
- Authorized SKK/Jordbruksverket integration if a documented partnership/API becomes available.
- Qualified trainer messaging with explicit service levels and safety QA.
- Vet/trainer directory and puppy-course referrals.
- Maintained Swedish service links and optional location search for puppy courses and dog exercise areas; insurance education may mention providers such as Agria/If only with neutral selection criteria, disclosure of commercial relationships, and no behavioral-data sharing.
- Home-screen widgets and Apple Watch companion actions.
- Android public release.
- Carefully moderated community or peer comparison only if it solves a validated need.
- More sophisticated prediction only after enough consented, high-quality data and prospective validation.

### Explicit non-goals for version 1.0

- Scraping SKK or Jordbruksverket.
- AI diagnosis, symptom diagnosis, or an unconstrained general-purpose AI coach.
- Promising when a puppy will become house-trained.
- A social feed, direct messaging between strangers, marketplace, insurance comparison, or ads.
- GPS tracking or background location.
- Hundreds of lessons.
- Full adult-dog training and veterinary record replacement.

The source suggestions also proposed streaks and a forecast for when a puppy will be house-trained. Version 1 deliberately rejects both: streaks can shame users for accidents or incomplete logs, while a completion date implies unsupported certainty. Reconsider only neutral consistency summaries after user research, and never expose a house-training date estimate without prospective validation.

## 7. Core feature specification: adaptive house-training

### User flow

1. The app schedules one clear local notification for the responsible dog/device: `Dags att kolla Luna – behöver ni gå ut?`
2. Tapping it deep-links to Luna's check-in sheet; it never lands on a generic home page.
3. The user can select:
   - `Kiss ute`
   - `Bajs ute`
   - `Kiss inne`
   - `Bajs inne`
   - `Inget ännu`
4. The sheet enforces one outcome per bodily function: `Kiss ute` and `Kiss inne` are mutually exclusive, as are `Bajs ute` and `Bajs inne`. One pee outcome and one poo outcome may be combined only when they happened in the same check-in. `Inget ännu` clears and excludes every elimination outcome.
5. Time defaults to now but can be edited. Saving requires one tap after selection.
6. Feedback is immediate and factual:
   - Outdoor pee: `Bra fångat. Belöna lugnt direkt ute. Nästa förslag är 10:35.`; the reward tip can be dismissed once learned.
   - Indoor pee: `Det händer. Vi provar 10 minuter tidigare nästa gång.`
   - Outdoor poo-only: `Sparat. Det hjälper oss se mönstret.`
   - Indoor poo-only: `Det händer. Vi lägger nästa jämförbara bajsrunda lite tidigare.`; this never claims to move the bladder interval.
   - Nothing: `Prova en lugn kissrunda om 15 minuter.` with a 15-minute follow-up.
7. `Undo` is available from the confirmation and history.

A later event is a new check-in. For example, pee outside now and a poo accident ten minutes later become two timestamped check-ins; the second is never retroactively merged into the first. A check-in groups the interaction, while each selected bodily function becomes its own elimination event for analytics and deterministic correction.

Notification actions may provide coarse shortcuts (`Ute`, `Olycka`, `15 min`) where reliable, but the app sheet remains the source of truth because a notification action cannot accurately capture every pee/poo combination.

### Version 1 algorithm

Use a bounded, expert-reviewed rule engine—not machine learning—and keep every decision explainable.

Inputs:

- Puppy age band and whether the age is exact or estimated.
- Time since the last confirmed pee, indoors or outdoors, with its location retained as an outcome.
- Recent indoor pee accidents and separate poo history.
- Recent outcome sequence.
- Time-of-day bucket.
- Optional routine triggers: wake, meal, drink, play/training, car/excitement.
- Quiet hours/night preference.
- Manual interval and snooze overrides.
- Per-dog and per-device notification state.

Recommended calculation:

```text
1. Anchor the calculation to the latest confirmed pee, whether it happened indoors or outdoors. If there is no usable history, anchor it to setup/now.
2. Start with an expert-configured interval for the puppy's age band.
3. Apply the dog's slowly changing interval for this time-of-day, bounded by expert min/max values.
4. If a relevant routine trigger is logged, use the earlier trigger deadline.
5. After an indoor pee accident, reduce the interval measured forward from that accident by a small bounded step (for example 10 minutes or 20%, whichever is smaller). The accident empties or partly empties the bladder, so the old outdoor event must not remain the scheduling anchor.
6. After at least three consecutive confirmed outdoor pees with no indoor pee accident, increase by at most five minutes, never beyond the expert maximum.
7. "Nothing yet" does not change the learned interval; it creates a one-time follow-up at now + 15 minutes.
8. A dismissed, missed, late, or undelivered notification is unknown—not a failure—and never trains the model.
9. Calculate a separate bowel candidate from recent poo time-of-day and meal/wake relationships. An indoor poo accident moves the next comparable bowel opportunity earlier by a small expert-bounded step; outdoor poo records/stabilizes that pattern. With insufficient history, use only a reviewed post-meal/wake default. Neither outcome changes the bladder interval.
10. Select the earliest safe candidate among bladder, bowel, and routine-trigger deadlines, then apply quiet-hour policy and manual override.
11. Cancel the previous scheduled notification for that dog/device, save the new identifier, and schedule exactly one next notification.
```

Poo is tracked separately. A poo-only accident updates the bounded bowel/routine candidate—especially around meals and waking—and can therefore make the next general outing earlier, but it must not pretend that the puppy has or has not emptied its bladder. Keep this as a simple reviewed rule rather than a statistical model in version 1.

The source notes propose `age in months + 1 hour` as a starting daytime interval. Treat that only as a candidate product hypothesis, never as an uncapped rule: a Swedish trainer/veterinarian must validate or reject it by age band, set safe minimum/maximum values, and ensure wake/meal/drink/play signals can schedule a substantially earlier outing. The recommended implementation is a reviewed age-band table because a single formula may be too coarse for very young or individual puppies.

All numeric parameters above are product hypotheses until a Swedish qualified trainer/veterinarian approves them. Parameters must be versioned outside presentation code, and each proposed reminder stores the rule version and a `reasonCode` such as `age_baseline`, `after_wake`, `recent_pee_accident`, `bowel_pattern`, `manual`, or `follow_up`.

### Personalization states

- **Starter plan:** insufficient observations; age/routine defaults dominate.
- **Learning Luna's rhythm:** enough recent events to adjust conservatively.
- **Personalized:** stable event history; show the time-of-day pattern and confidence.

Do not call the schedule `AI` and do not imply biological certainty. Show `suggested`, not `predicted`, until a later model is prospectively validated.

### Notification behavior

- Ask for permission only after showing the user the useful schedule they will receive.
- Local notifications are the core mechanism so plans can be calculated and scheduled without internet. Expo's notification library supports scheduled local notifications and deep-link responses. Delivery is best-effort and depends on OS/user settings; remote push is for household sync/content, not the primary timer. [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- Each device chooses which dogs it reminds and can set `I'm responsible now` to reduce duplicate household alerts.
- `Hemma / inte ansvarig just nu` pauses or resumes that device's responsibility explicitly; it does not infer presence from GPS or background location.
- Keep one notification record per dog/device responsibility pair in version 1. The all-dogs agenda can show nearby outings together, but grouped native alerts are P1 only after a `NotificationBundle` model, multi-dog deep link, partial completion, cancellation, and accessibility behavior are specified.
- Reschedule after logging, editing/deleting an event, changing language, time zone, clock, quiet hours, dog profile, or duty status.
- Detect denied permissions and keep a useful in-app countdown; explain how to enable notifications without repeatedly nagging.
- Never claim a reminder is guaranteed—iOS delivery can be affected by user settings and system behavior.

### Core acceptance criteria

- A user can log the common case in no more than three taps and a median target below five seconds.
- Logging plus reminder calculation, cancellation, and scheduling work in airplane mode and after an app restart; actual notification delivery remains subject to iOS permission and system behavior.
- Tapping a notification opens the correct dog and check-in context.
- Only one current next reminder exists for each dog/device responsibility pair.
- An indoor pee accident can never lengthen the bladder interval; a poo-only accident does not change it.
- An outdoor pee can never increase an interval by more than the configured step or beyond expert bounds; outdoor poo alone does not increase it.
- An indoor poo accident cannot move the comparable bowel candidate later; outdoor poo contributes only to the separate bowel pattern.
- `Nothing yet` always schedules the configured follow-up and does not count as success or failure.
- Missed notifications never change the learned schedule.
- Event correction/deletion deterministically recalculates the next reminder.
- Daylight-saving, time-zone, manual-clock, and midnight transitions have automated tests.
- A language change cancels and recreates scheduled notification copy in the selected language.
- Charts never equate missing data with `no accident`.

## 8. Training, journey, and breed content

### Target 12-lesson set

1. First days and creating safety.
2. Reward marker and timing.
3. Name and voluntary contact.
4. House-training routine.
5. Reading toilet signals.
6. Calm handling and grooming preparation.
7. Recall foundations.
8. Loose-leash foundations.
9. Bite inhibition and appropriate chewing.
10. Calm settling and a voluntary resting place.
11. Gradual alone training.
12. Safe, low-pressure environmental/socialization exposure.

If the release uses the six-lesson cut line, ship items 1, 2, 4, 9, 11, and 12 as complete experiences; fold toilet-signal essentials from item 5 into item 4, then add the remaining lessons in the listed order. Content completeness and review status matter more than nominal lesson count.

Each lesson contains:

- Outcome and why it matters.
- Preparation and environment.
- A two-to-four-minute video.
- Numbered steps and approximate session length.
- `If this is difficult` variations.
- Stop/safety conditions and escalation link where relevant.
- Captions, transcript, and audio-independent instructions.
- `Easy / needs practice / not today` reflection; difficult items return to a practice list.
- Author, expert reviewer, reviewed date, next review date, source links, and content version.

### Breed-aware guidance

Breed should shape suggestions without treating a breed stereotype as an individual diagnosis.

- Ask breed, mix, or unknown; never block onboarding because a breed is missing.
- Offer `Blandras/okänd` immediately and a visible `Saknas din ras?` request route; do not make the user contact support to finish onboarding.
- Start with traits/tags—expected adult size, coat, energy pattern, motivation, common working background—rather than separate duplicated journeys.
- Pilot deep content for common Swedish breeds using current SKK registration data, but always include mixed and non-SKK-registered dogs. Labrador retriever, golden retriever, German shepherd, Jämthund, and cocker spaniel led 2025 SKK registrations. [SKK registration list](https://www.skk.se/nyheter/2026/1/okad-marknadsandel-2025-nar-fler-valde-rashund/)
- Phrase content as tendencies and questions to observe, not certainties.
- Separate training adaptation from health-risk information; health content requires veterinary review.

### Content system

Do not embed long-form guidance directly in screen components. A content item should contain at least:

```text
contentId, type, lifecycleStage, ageRange, breedTags,
locale, market, jurisdiction, title, summary, structuredSteps,
media, captions, transcript, sources, author, reviewer,
reviewedAt, reviewDueAt, riskClass, version, status
```

For MVP, keep structured content in version-controlled files bundled for offline use and host optimized videos remotely with download support. Add a localized headless CMS after editorial volume justifies it. High-risk or time-sensitive content needs a remote disable/update path and scheduled review alerts. The Content & Safety Owner owns the source register and review queue; named Swedish trainer and veterinary reviewers approve the relevant classes. Vaccination, parasite, medication, nutrition, seasonal-health, and emergency claims always require veterinary review. [SKK vaccination guidance](https://www.skk.se/aga-hund/halsa-och-skotsel/vaccination/)

Risk classes:

- **Green:** general training and routine guidance.
- **Amber:** behavior concerns, diet, medication reminders, travel, weather/heat/cold.
- **Red:** illness, injury, aggression, severe fear, poisoning, or emergency. Do not diagnose or continue as a normal lesson. Use direct `contact a veterinarian/emergency veterinarian or other applicable emergency service now` and `do not wait for an app reply` language, with locally reviewed routes and effective dates. Aggression/fear paths also direct to an appropriately qualified behavior professional without delaying urgent medical or human-safety help.

## 9. SKK, chip, and registry approach

The product notes propose fetching data using a chip number. Current public SKK Hunddata supports interactive search by registration number, tattoo, chip number, name, and breed. It covers SKK-registered dogs plus some dogs with competition licences; it is not a universal Swedish dog record. A documented public developer API was not found during this research, and SKK states that its web material is copyright-protected. [SKK Hunddata search](https://hundar.skk.se/hunddata/hund_sok.aspx) · [SKK Hunddata scope](https://hundar.skk.se/hunddata/About.aspx?Avdelning=%C3%96VRIGT) · [SKK Avelsdata](https://www.skk.se/uppfodning/avel-inom-skk/avelsdata/)

### Version 1

- Manual dog entry with excellent defaults and correction.
- No automatic chip lookup or silent import. `Open official service` launches SKK/Jordbruksverket in the browser; the user then returns and manually types or confirms the relevant details.
- Optional fields for chip, SKK registration number, and central-register status.
- A chip-format warning, not a hard 15-digit rejection: ISO chips commonly use 15 digits, but imported dogs can have other lengths. [SKK chip terminology](https://www.skk.se/globalassets/media---skk.se/uppfodning/halsa/manualfordigitalrontgenlangversion.pdf?timestamp=20240314123001)
- Official outbound links to SKK Hunddata and Jordbruksverket's register/service.
- A checklist explaining that SKK and Jordbruksverket registration are distinct.
- Chip values excluded from analytics, crash reports, URLs, support screenshots, and ordinary logs.

### Later partnership path

1. Ask SKK and Jordbruksverket for written terms, data scope, update cadence, attribution, privacy basis, rate limits, and support expectations.
2. Use only a documented authorized API or data feed.
3. Show the source and retrieval date and require the user to confirm imported profile data.
4. Cache only fields needed for the stated feature.
5. Provide correction, deletion, and integration-disconnect controls.

Do not scrape the websites or reverse-engineer private endpoints.

## 10. Localization plan

### Locales

The latest brief commits to Swedish, English, French, German, Danish, Finnish, and Norwegian, so it supersedes the older `idea.txt` note that also listed Spanish. Spanish is outside the current committed scope and may be evaluated as a later locale.

| Product language | Locale | Notes |
|---|---|---|
| Swedish | `sv-SE` | Canonical launch language and Swedish market content. |
| English | `en-GB` | European English base; allow regional formatting. |
| French | `fr-FR` | Native editorial and App Store review required. |
| German | `de-DE` | Design for long strings and compound words. |
| Danish | `da-DK` | Local terminology review; do not reuse Swedish copy mechanically. |
| Finnish | `fi-FI` | Independent grammar/plural QA and layout testing. |
| Norwegian | `nb-NO` | Launch as Bokmål; add Nynorsk only if demand supports it. |

### Rollout

1. Version 1.0: complete `sv-SE` product, content, notifications, paywall, support, legal copy, videos, captions, and store metadata.
2. Wave 2: `en-GB`, `nb-NO`, and `da-DK` after the complete critical path passes native review.
3. Wave 3: `fi-FI`, `de-DE`, and `fr-FR`.

The code and schema support every requested locale from the first commit, but version 1.0 ships reviewed Swedish only under this plan. `Translation-ready` means locale-aware code and content—not that untranslated markets are available. A locale is exposed only when its complete user-facing path has been translated and reviewed: UI, onboarding, notification actions/body, lessons, safety/legal guidance, captions/transcripts, paywall and purchase recovery, support, accessibility labels, App Store metadata, screenshots, and privacy documents. This avoids the visible placeholder-copy failure found in PupSteps' France listing. If all seven languages are required on launch day, add parallel native editorial/QA work and re-estimate the 16-week schedule before committing to a date.

### Implementation rules

- Use `expo-localization` plus `react-i18next` and ICU message formatting, or an equivalent ICU-capable setup. Expo provides device locale data and recommends pairing it with a localization library. [Expo Localization](https://docs.expo.dev/versions/latest/sdk/localization/)
- Keep language, region/market, and legal jurisdiction as separate values.
- Never concatenate sentence fragments. Use named variables, plural/gender/select forms, ordinals, and full-sentence keys.
- Use `Intl` for dates, relative time, time, decimal separators, percentages, currency/storefront, lists, and units.
- Store timestamps in UTC plus the event's IANA time zone; render locally.
- Let users override language and measurement units.
- On language change, refresh content and reschedule pending notification text.
- Use a shared dog-training glossary and translation memory.
- Require native reviewers for UI, training content, legal/health disclaimers, paywall, support, and App Store metadata.
- Store content version and reviewer state per locale; a source-language change invalidates the affected translations until reviewed again.
- Swedish launch videos use Swedish audio, captions, and transcripts. Every later locale requires reviewed localized captions, transcripts, poster text, and audio-independent instructions; dubbing/re-recorded audio is optional after quality and budget validation. Never bake essential text into images.
- CI fails on missing critical keys, English fallback in a released locale's high-risk path, invalid ICU syntax, orphaned keys, placeholder mismatches, untranslated media/release metadata, or an unreviewed high-risk item.
- Run pseudo-localization and 30–40% text-expansion tests; include German/Finnish and the smallest supported phone in visual QA.
- For safety/legal material, do not silently fall back to another language. Show an explicit unavailable state or a clearly labeled reviewed fallback.

## 11. Recommended technical architecture

### Mobile

- React Native + Expo with strict TypeScript.
- Pin and verify the latest stable Expo SDK at kickoff. Record the chosen Expo SDK, React Native, Node, package-manager, and Xcode versions in an architecture decision record and lockfile; upgrade intentionally rather than treating the research-date version as permanent. [Expo Router](https://docs.expo.dev/router/introduction/)
- Expo Router for typed file-based navigation and deep links.
- Development builds from the first notification/sync sprint. Expo Go is useful for simple UI work but is not the release test environment.
- `expo-notifications` for local scheduling and notification responses. Implement iOS permission/status/category handling and deep links now; add Android 13+ permission, channel, exact-timing, and manufacturer behavior before Android launch. Both platforms need denial, revocation, time-zone, and DST recovery tests.
- `expo-sqlite` as the on-device source of truth, with WAL enabled and versioned migrations. WAL is neither cloud sync nor backup. Define migration rollback, corruption/out-of-space recovery, export, local deletion, and honest device-loss behavior. Expo notes that sync/conflict handling must be supplied separately. [Expo local-first guide](https://docs.expo.dev/guides/local-first/) · [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- A typed data layer such as Drizzle over SQLite if its Expo compatibility is verified in a short spike; otherwise use a small repository layer over prepared queries.
- TanStack Query for server synchronization/cache and lightweight component/local state for transient UI. Keep the reminder engine as pure domain functions rather than hiding it in UI state.
- `expo-secure-store` for authentication tokens and small secrets, not ordinary app state. [Expo authentication guidance](https://docs.expo.dev/guides/authentication/)
- Error and performance reporting with aggressive redaction: no dog name, chip, notes, photos, precise routine timestamps, or message text.

### Backend

Recommended default for the prototype: an EU-region Postgres/Auth/Object Storage service such as Supabase, behind a small domain API boundary. Vendor approval requires an EU-region guarantee, DPA, sub-processor inventory, international-transfer assessment, backup/restore location, deletion guarantees, exit/export path, and tested outage/offline behavior.

Backend responsibilities:

- Optional account and Sign in with Apple/email link.
- Households, roles, invitation codes/links, and device registrations.
- Append-oriented event sync and tombstones for deletions.
- Content manifest/version checks and remote safety disable.
- Entitlement state and StoreKit server notifications if monetized.
- Export/deletion jobs and audit trail.
- Aggregate, privacy-minimized product metrics.

The house-training engine and next local reminder remain on the device. A network outage must not block logging or scheduling.

### Sync model

- Every record has a UUID, `householdId`, `dogId`, `createdAt`, `updatedAt`, `deletedAt`, `actorId`, `deviceId`, and schema version as applicable.
- Toilet/routine events are append-first; edits create a new revision and deletions create a tombstone.
- Use a local outbox with idempotency keys and retry/backoff.
- Profiles/settings can use field-aware last-write-wins with server timestamps; never use that rule for concurrent event creation.
- A successful remote sync triggers deterministic local schedule recalculation.
- Show `last synced` and offline state without blocking entry.
- Allow each device to choose whether it receives reminders for each dog. Later add shifts/duty handoff if research validates it.
- Test two devices logging nearly simultaneously, long offline periods, reinstall, expired sessions, revoked household access, and deleted dogs.

### Suggested repository structure

```text
app/                         Expo Router routes only
src/
  components/               shared accessible UI primitives
  design/                   tokens, typography, icons, motion
  features/
    onboarding/
    potty/
    today/
    training/
    journey/
    dogs/
    household/
    settings/
  domain/                   pure models, rules, reason codes
  db/                       SQLite schema, migrations, repositories
  sync/                     outbox, API client, conflict handling
  content/                  schemas, selectors, bundled manifests
  i18n/                     setup, locale files, glossary tooling
  notifications/            scheduler adapter and deep-link mapping
  analytics/                redacted event contract
  test/
content/                    reviewed source content by locale
assets/                     original brand/illustration/media assets
scripts/                    content and localization validation
```

### CI/CD with GitHub and Codemagic

Codemagic documents React Native/Expo builds and running `expo prebuild` in CI. Use Expo Continuous Native Generation unless a required native customization proves that committed native projects are safer. Decide this in the technical spike, then keep the workflow consistent. [Codemagic React Native/Expo guide](https://docs.codemagic.io/yaml-quick-start/building-a-react-native-app/)

Pipelines:

1. **Pull request**  
   Install with lockfile, type-check, lint, unit/integration tests, migration tests, content schema/source validation, localization/ICU checks, accessibility static checks, secret scan, and build-config validation.

2. **Main branch**  
   Generate native projects, create a signed internal iOS build, upload artifacts/symbols, and publish to an internal TestFlight group after approval.

3. **Release tag**  
   Re-run all gates, build deterministically, upload to App Store Connect, attach localized metadata, and require manual production submission.

4. **Weekly Android smoke build**  
   Even before Android launch, compile and run core tests so iOS-first decisions do not create a rewrite.

Store signing keys and App Store Connect credentials in Codemagic encrypted environment groups, never in the repository. Use conventional changesets, release notes, semantic app versions, and monotonic iOS build numbers.

The technical spike must prove reproducible CNG builds from `app.config.ts`, config plugins, and the committed lockfile; run `expo-doctor`; pin the Codemagic macOS/Xcode image; validate signing and App Store Connect credentials; and build twice from the same commit. Before subscriptions, separately spike an Expo-compatible StoreKit/IAP implementation and its Codemagic release build rather than assuming library compatibility.

Do not add over-the-air production updates until monitoring, rollback, and review rules exist. If EAS Update is later introduced, define the boundary from Codemagic binary releases, pin runtime compatibility, use signed staged updates, retain rollback, and specify offline behavior. Safety, legal, paywall, and privacy content may not bypass the same named editorial/compliance approval merely because it can ship OTA. [Expo runtime versions](https://docs.expo.dev/eas-update/runtime-versions/) · [Expo update signing](https://docs.expo.dev/eas-update/code-signing/)

## 12. Core data model

| Entity | Key responsibility |
|---|---|
| `User` | Optional account identity and preferences. |
| `Household` | Shared care context. |
| `Membership` | Owner/caregiver/viewer role and status. |
| `Device` | Locale, time zone, notification permission, home/away responsibility, and per-dog duty settings. |
| `Dog` | Profile, age confidence, breed/mix tags, optional protected identifiers. |
| `ToiletCheckIn` | One user interaction/visit with occurred time, source, actor, optional `nothing`, notes, and revision. |
| `EliminationEvent` | Child of a check-in: exactly one kind (`pee` or `poo`), one location (`outside` or `inside`), and occurred time. |
| `RoutineEvent` | Wake, meal, drink, play/training, car/excitement, sleep. |
| `ReminderPlan` | Bladder/bowel/trigger candidates, selected proposed time, reason code, confidence, algorithm version, manual override. |
| `ScheduledNotification` | Native identifier, device/dog, locale snapshot, scheduled time, status. |
| `TrainingProgress` | Lesson version, state, reflection, practice queue. |
| `Milestone` | Suggested/custom milestone and optional memory. |
| `WeightEntry` | Time, value, unit/source. |
| `ContentItem` | Structured reviewed source item. |
| `ConsentRecord` | Purpose, policy version, choice, timestamp, withdrawal. |
| `Entitlement` | Store product, status, expiry, source, last verification. |
| `SyncOperation` | Local outbox/idempotency/retry state. |

Database constraints enforce at most one pee event and one poo event per check-in; the same function cannot be both inside and outside. `Nothing` permits zero elimination events and is exclusive. Pee outside plus poo outside can share a check-in; a later poo accident receives a new check-in and timestamp. This normalized model prevents contradictory states and lets bladder adaptation ignore poo-only events without losing bowel history.

## 13. Privacy, safety, and platform compliance

- No account is required for local-only use. Ask the user to sign in only when they choose backup/household value. Apple recommends allowing use without login where significant account features are absent. [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- If account creation exists, account deletion must be initiated inside the app and remove associated data unless retention is legally required. [Apple account deletion guidance](https://developer.apple.com/support/offering-account-deletion-in-your-app)
- Build GDPR data minimization and retention into the product, with explicit purposes, no preselected marketing consent, documented risk review, access/export/correction/deletion, and reviewable retention schedules. IMY describes privacy by design/default as a requirement and emphasizes collecting only necessary data. [IMY](https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/inbyggt-dataskydd-och-dataskydd-som-standard/)
- Perform and document a GDPR risk assessment before shared accounts, coach messaging, or analytics at scale, and have the privacy owner determine—with counsel where needed—whether Article 35 requires a formal DPIA. Do not label every feature a DPIA by default.
- Host production account data in the EU where possible and document every sub-processor and transfer mechanism.
- Chip number is optional, protected, and never used as a public account key.
- Photos are private by default; strip unnecessary metadata before upload.
- `Delete local data` cancels pending notifications and clears SQLite, downloaded/cached media, queued sync work, local credentials, and recoverable app files. Clearly explain what remains in device/iCloud backups outside the app's direct control and how synced server/account deletion differs.
- If a household can include a minor caregiver, minimize their data, avoid profiling/marketing, define guardian/consent and invitation rules with counsel, and never expose a child's routine or identity publicly.
- Analytics contain generated IDs and coarse product events only—never free text or dog identifiers. Offer a clear opt-out where appropriate.
- Maintain an SDK data inventory and accurate App Store Privacy Nutrition Label, including every third-party SDK. Apple requires disclosure of data collected by the app and its partners. [Apple privacy details](https://developer.apple.com/app-store/app-privacy-details/)
- Training is educational, not veterinary diagnosis or a guarantee. Every health/behavior escalation path states when to contact a veterinarian or qualified behavior professional.
- Do not promise `24/7 human coaching` until staffing, qualifications, language coverage, supervision, escalation, and response-time reporting are operational.
- Support remains reachable before login and from every paywall/error state. At launch provide at least one monitored Swedish async channel, immediate receipt confirmation, a published honest response target (for example two Swedish business days), and a faster safety/billing escalation route; revise the promise to actual staffing data.
- Future human coaching requires reviewer calibration, sampled answer audits, user reporting/appeal, and a rule that advice distinguishes observations about the individual dog from general breed tendencies.

## 14. Accessibility definition of done

- VoiceOver/TalkBack labels, roles, values, hints, focus order, and announcements for changed reminder times.
- Dynamic Type through accessibility sizes without clipped buttons, charts, or tab labels.
- Minimum 44×44-point targets and sufficient spacing for one-handed use.
- All text and essential icons meet contrast requirements; success/accident/status never depend on color alone.
- Charts have summaries and accessible data tables/lists.
- Videos have synchronized captions and downloadable/readable transcripts in the selected language.
- Controls work without drag-only or timed gestures.
- Verify Voice Control, Switch Control, and external-keyboard navigation as well as touch and VoiceOver; include TalkBack and Android keyboard testing before Android launch.
- User dog photos have an editable text description or can be marked decorative; charts and milestone images always have equivalent text.
- Reduced Motion removes nonessential transitions/celebrations.
- Screen-reader testing on the notification → log → next-reminder critical path before every release.
- App Store accessibility declarations are kept accurate; both referenced competitors currently leave this unspecified.

## 15. Monetization recommendation

Run the private beta without a paywall. Validate retention and willingness to pay before fixing price.

### Free forever

- Complete adaptive house-training and logging.
- Current/7-day insights.
- Essential Swedish legal and safety checklists.
- Basic timeline.
- Six complete lessons, not fragments.
- Up to two active dogs. If household sync is available, one additional caregiver.
- Export/delete/privacy/support.

### Puppysteps Plus

- More than two active dog profiles.
- Full journey and video library.
- Adolescent program and deep problem guides.
- Advanced history/insights and reports.
- Full breed-aware packs.
- Unlimited household caregivers.
- Photo memories and media downloads.

Candidate research range—not a price decision: SEK 49–69/month or SEK 399–599/year. Consider a limited founding lifetime purchase only after modeling ongoing video, support, sync, and translation costs.

Rules learned from reviews:

- Do not put a paywall before the user sees a real schedule or complete lesson.
- Show the exact SEK amount, billing interval, trial end date, first charge date, renewal behavior, and cancellation route on one screen before purchase.
- Do not start a trial implicitly. If a trial exists, make it an explicit opt-in and show the calendar date of renewal.
- Keep `Manage subscription`, `Restore purchases`, `Refund help`, account deletion, and support easy to find and outside paywall state.
- Test fresh purchase, pending/interrupted purchase, restore, reinstall, device migration, refund, expiry, grace period, family sharing behavior, and account/store mismatch.
- Approve an entitlement state diagram before purchase UI: distinguish app account from Apple ID; cover free, active, pending, billing retry/grace, expired, refunded/revoked, offline-unverified, reinstall, and restore states. Define the visible action and retained access for every transition.
- A downgrade or lapsed subscription never hides, deletes, or prevents export of existing dog/household history. Core logging/reminders continue for existing dogs and caregivers; the user cannot add beyond the free dog/caregiver caps, and Plus-only insights become read-only/locked with clear recovery.
- No advertising or sale of behavioral data.

## 16. Measurement plan

### North-star behavior

Weekly active puppy households that log on at least four days and still keep reminders enabled. This combines actual utility with a notification-fatigue guardrail.

### Product metrics

| Stage | Metric |
|---|---|
| Acquisition | Store-page conversion by locale/referral source. |
| Activation | Dog created + first event logged + reminder choice completed. |
| Core value | Time to first log; log completion time; days with useful event history. |
| Outcome signal | Change in reported indoor accidents per observed day, clearly described as self-reported and non-causal. |
| Retention | D1, D7, D30 household retention by puppy age and acquisition channel. |
| Notification quality | Open/log/snooze rate, ignored rate, permission denial, notification disable rate. |
| Learning | Lesson starts/completions, `needs practice` return, search success. |
| Ongoing utility | House-training days active after week two; return to routine features after lesson completion; adolescence-feature use. |
| Trust | Support contact reason, refund rate, restore failure, content correction reports. |
| Reliability | Crash-free sessions, sync success, duplicate reminder rate, schedule latency. |
| Accessibility/localization | Critical-path defects per locale and assistive-technology audit. |

Beta exit targets, to be revised after baseline data:

- At least 70% of testers reach the first saved toilet event.
- Median common-case log time below five seconds.
- More than 35% D7 retention in the target new-puppy cohort.
- Fewer than 10% of enabled users disable reminders during the first week.
- More than 99.8% crash-free sessions.
- Fewer than 0.1% duplicate scheduled reminders per active dog-day.
- No unresolved severity-one safety, privacy, data-loss, purchase, or accessibility defect.

Do not market an improvement in house-training until a prospective study supports the claim.

## 17. Test strategy and release gates

### Automated

- Unit and property-based tests for the pure reminder engine and every reason code.
- Invariants: future time, expert bounds, bounded outdoor-pee increase, indoor-pee non-increase, separate bowel adaptation, indoor-poo bowel non-increase, `nothing + 15`, missed-is-unknown, deterministic recalculation.
- SQLite migration tests from every released schema, rollback/recovery tests, and corrupted/out-of-space behavior.
- Repository and sync tests for idempotency, concurrent device events, tombstones, revoked membership, and long offline periods.
- Component and navigation integration tests with `jest-expo`, React Native Testing Library, and Expo Router's testing utilities. Expo recommends React Native Testing Library rather than the deprecated React test renderer. [Expo unit testing](https://docs.expo.dev/develop/unit-testing/) · [Expo Router testing](https://docs.expo.dev/router/reference/testing/)
- Notification adapter tests with a fake scheduler and device integration tests with real local notifications.
- ICU/localization validation and pseudo-localized screenshot tests.
- End-to-end smoke tests for onboarding, notification permission denied/accepted/revoked, notification deep link, valid same-check-in pee+poo, rejected contradictory outcomes, a later separate accident, correction, dog switch, offline restart, export/delete, and purchase restore.

### Manual/device matrix

- Oldest supported small iPhone, current standard iPhone, and large current iPhone.
- Current and previous two supported iOS major versions, including upgrade testing.
- VoiceOver, Voice Control, Switch Control, external keyboard, maximum Dynamic Type, Increased Contrast, Reduce Motion, and color-vision simulations.
- Fresh install, upgrade, reinstall, low storage, no network, slow network, device clock/time-zone/DST changes.
- Swedish plus the longest wave-two/wave-three strings before each locale release.

### Beta sequence

1. Internal dog-owner dogfooding with synthetic schedules.
2. Five supervised usability sessions on the notification-to-log flow.
3. 20–30 Swedish first-time puppy owners for two weeks.
4. Expand to 75–100 testers, including apartments, houses, shared households, mixed/adopted dogs, multiple dogs, and accessibility users.
5. TestFlight release candidate for at least seven days without a severity-one regression.

## 18. Delivery roadmap

Assumption: a focused team of two mobile engineers, part-time backend support, one product designer/researcher, part-time QA, and contracted Swedish trainer/veterinary/editorial review. A solo build should extend the schedule rather than compress quality gates.

| Time | Outcome | Exit gate |
|---|---|---|
| Weeks 1–2 | Discovery and risk spikes | Name-clearance process started; 10–12 target interviews; content partners identified; iOS notification/deep-link prototype proven on real devices; Swedish algorithm parameters reviewed; architecture decision record approved. |
| Weeks 3–4 | Foundation | Expo/TypeScript app, design tokens, navigation, SQLite migrations, i18n, logging redaction, CI, preview builds, accessible primitives. |
| Weeks 5–7 | Core house-training | Dog onboarding, event schema, quick log, rule engine, local scheduler, correction/undo, quiet hours, notification permission flow, deterministic tests. |
| Weeks 8–9 | Daily usefulness | Today, log history, insights, multi-dog switching, empty/offline/error states, first usability round. |
| Weeks 10–11 | Learning and journey | Target 12 reviewed lessons, minimum six complete; video/captions/transcripts, practice loop, basic timeline/milestones, Swedish checklist, content validation. |
| Weeks 12–13 | Account/sync and trust | Optional account, household sync if reliability gate passes, export/delete, privacy/settings/support. If sync fails the gate, move it intact to 1.1. |
| Week 14 | Monetization shell and store readiness | Restore/manage/refund/help flows; beta remains free; privacy inventory, terms, Swedish metadata/screenshots, review demo path. |
| Weeks 15–16 | Beta hardening and launch candidate | Device/accessibility/localization audit; performance; data-loss/notification tests; TestFlight exit criteria; App Store submission. |

### First two weeks: concrete tasks

1. Treat Puppysteps as a working title and commission name/trademark clearance.
2. Recruit 10–12 Swedish owners who received a puppy in the last six months; include apartments, shared care, first-time owners, mixed/adopted puppies, and at least two multi-dog homes.
3. Interview three Swedish professionals: reward-based trainer, veterinarian, and breeder/puppy-course instructor.
4. Prototype only onboarding → schedule preview → permission → notification → check-in → next reminder.
5. Observe whether users understand `nothing yet`, combinations, correction, and why timing changes.
6. Agree on a version-one expert parameter table and escalation policy.
7. Decide the public minimum iOS version based on the current Expo baseline and Swedish device reach; aim to support at least one version older than PupSteps' iOS 18 floor if technically reasonable.
8. Test local notification scheduling, cancellation, deep links, restart, DST/time-zone change, and multiple dogs on real iPhones.
9. Validate the SQLite/outbox sync approach between two devices; make household sync a 1.0 commitment only if it passes.
10. Draft the first 12 Swedish lesson scripts and their evidence/reviewer metadata before filming.
11. Approve the originality package: moodboard provenance, type/icon/illustration rules, Today and lesson variants, contrast checks, and App Store screenshot storyboards.

## 19. Prioritized implementation backlog

| Epic | Scope | Priority |
|---|---|---|
| E01 Foundation | Expo app, router, strict TS, design system, CI, environments | P0 |
| E02 Localization foundation | Locale/market/jurisdiction model, ICU, seven-locale scaffolding, pseudo-localization, validation | P0 |
| E03 Dog onboarding | Profiles, estimated age, breed/mix/unknown, optional chip | P0 |
| E04 Local data | SQLite schema, migrations, repositories, export/recovery | P0 |
| E05 Quick log | Normalized check-in/elimination events, valid combinations, correction, undo, accessibility | P0 |
| E06 Reminder engine | Versioned bladder/bowel/trigger candidates, reason codes, bounds, pure tests | P0 |
| E07 Notifications | Permission primer, scheduling/cancel, deep links, quiet hours | P0 |
| E08 Today and history | Next action, last events, trend summaries, missing-data semantics | P0 |
| E09 Multi-dog | Switcher, independent schedules/settings, all-dogs agenda; no grouped native alerts in v1 | P0 |
| E10 Training content | Player, steps, transcript, practice queue, target 12/minimum six complete Swedish lessons | P0 |
| E11 Journey | Development phases, milestones, Swedish checklists | P0 |
| E12 Privacy/support | Consent inventory, support, export/delete, policies | P0 |
| E13 Accounts/households | Optional auth, roles, invite, sync, duty controls | P0/P1 gate |
| E14 Purchases | Products, entitlements, restore/manage/refund/help | P1 after beta |
| E15 Health records | Weight/vaccine/vet reminders and PDF report | P1 |
| E16 Breed packs | Trait tags and Swedish priority-breed review | P1 |
| E17 Full locale releases | UI/content/notifications/safety/legal/paywall/support/a11y/media/store metadata, native and subject-matter review | P1/P2 |
| E18 Authorized registry integration | Partnership/API only | P2 |
| E19 Swedish content safety | Named owner, authority source register, legal/vet review, freshness alerts, emergency escalation | P0 |
| E20 Storefront and compliance | Pricing metadata, privacy label/SDK audit, accessibility declarations, localized screenshots and review notes | P0/P1 |
| E21 Notification resilience | Permission/revocation, categories/actions, time-zone/DST, offline/restart recovery, Android channels later | P0 |

## 20. Main risks and mitigations

| Risk | Mitigation |
|---|---|
| Near-identical competitor name | Working-title gate and legal/brand clearance before identity investment. |
| Notification fatigue causes uninstall | Permission after value; one next reminder; quiet hours; duty mode; manual control; disable-rate guardrail. |
| Incomplete logging makes adaptation wrong | Conservative rules; confidence labels; never infer missed events; easy correction; household sharing. |
| The schedule is mistaken for medical certainty | `Suggested` language, explanations, hard bounds, expert review, no house-trained forecast. |
| iOS delivery/state edge cases | Local-first design, one-ID invariant, real-device/DST/restart tests, visible in-app countdown. |
| Advice is unsafe, stale, or culturally inappropriate | Named owner; Swedish trainer/vet/legal review; dated/effective sources; quarterly and release checks; emergency escalation; remote disable. |
| App feels like paid Google/YouTube content | Adaptive routine, household state, progress insight, local checklists, full free module, unique reviewed video. |
| Subscription distrust | Beta free; transparent SEK/date copy; accessible restore/manage/refund/support; no implicit trial. |
| Data loss or entitlement loop | SQLite source of truth, migration/backups, outbox/idempotency, settings outside paywall, exhaustive restore tests. |
| SKK/registry rights or privacy issue | Manual/deep-link first; written permission and documented API only; no scraping. |
| Localization quality fails | Complete-locale release gates, native review, ICU/pseudo tests, no silent safety-copy fallback. |
| Safety/legal advice is mistranslated | Per-locale subject-matter approval, source-version invalidation, no fallback on high-risk paths, emergency-path tests. |
| Seven-language content becomes unaffordable | Swedish proof first; shared structured content; phased locales; subtitle-first before re-recorded audio where acceptable. |
| Stakeholders assume seven languages launch together | Label schema support versus released locales in every milestone; re-estimate if all seven become a day-one requirement. |
| Scope exceeds 16 weeks | House-training loop is the release criterion; move sync/commerce depth and content volume to 1.1 without weakening core quality. |

## 21. Decisions to lock before implementation

| Decision | Recommended default |
|---|---|
| Final product name | Keep `Puppysteps` only as a working title pending clearance. |
| Initial audience | Swedish first-time owners from pre-arrival through 12 months; adolescence extension follows quickly. |
| iOS minimum | Prefer iOS 17+ if the chosen Expo SDK and device-reach data support it; lock after spike. |
| Account model | Local use without account; Sign in with Apple/email link only for backup/household. |
| Local store | `expo-sqlite` with migrations and repository layer. |
| Reminder method | Local notifications calculated on-device. |
| Backend | EU-region managed Postgres/Auth/Storage behind a domain boundary. |
| Sync in 1.0 | Include only if the week-four two-device reliability gate passes; otherwise 1.1. |
| Monetization | Free beta, then useful free core plus optional Plus; no ads or implicit trial. |
| Registry integration | Manual entry and official links until written API/partner authorization. |
| Launch language | Swedish; expose other locales only when the full critical path is reviewed. |
| Requested locale scope | Seven locales; Spanish omitted per the latest brief and retained only as a future option. |
| Norwegian variant | Bokmål (`nb-NO`) first. |
| Training method | Reward-based, low-pressure, locally expert-reviewed. |
| AI | None in MVP. Any later assistant must ground answers in approved sources, retain conversation context, detect/fallback from repetition, express uncertainty, escalate safety cases, support human handoff, and pass prospective value/safety validation. |

## 22. Definition of a successful version 1.0

Version 1.0 is ready when a Swedish first-time owner can:

1. Add any puppy, including mixed/unknown and estimated-age cases.
2. Understand the proposed routine before granting notification permission.
3. Receive a correctly timed reminder for the correct dog.
4. Record any valid same-check-in combination—at most one location for pee and one for poo—in seconds, and add a later event separately.
5. See exactly why the next suggestion changed and undo/correct it.
6. Continue logging and calculating/scheduling reminders offline after restarting the phone, while understanding that OS delivery is best-effort.
7. See honest progress without missing data being treated as success.
8. Learn one relevant technique in a short, captioned, reviewed Swedish lesson.
9. Switch dogs without mixing schedules.
10. Find support, privacy controls, export, deletion, and purchase controls without encountering a paywall.

And the team can demonstrate:

- No unresolved severe safety, privacy, accessibility, data-loss, entitlement, or duplicate-notification defect.
- Reviewed and versioned Swedish content with traceable sources.
- Passing critical-path tests on the oldest and newest supported iPhones.
- A reproducible signed build and TestFlight/App Store pipeline from GitHub through Codemagic.
- A credible, cleared product name and original visual identity.

## Sources

### Product and review evidence

- [PupSteps: Puppy Training — App Store](https://apps.apple.com/us/app/pupsteps-puppy-training/id6789964653)
- [PupSteps France storefront](https://apps.apple.com/fr/app/pupsteps-puppy-training/id6789964653)
- [Zigzag Swedish storefront](https://apps.apple.com/se/app/zigzag-puppy-dog-training/id1550121165)
- [Zigzag official product site](https://zigzag.dog/en-us/)
- [Zigzag UK reviews](https://apps.apple.com/gb/app/zigzag-puppy-dog-training/id1550121165?platform=iphone&see-all=reviews)
- [Zigzag US reviews](https://apps.apple.com/us/app/zigzag-dog-puppy-training/id1550121165?platform=iphone&see-all=reviews)
- [Zigzag Google Play listing/reviews](https://play.google.com/store/apps/details?id=nl.navara.zigzag)
- [Zigzag Trustpilot](https://www.trustpilot.com/review/zigzag.dog)
- [Svenska Brukshundklubben — Duktig hund](https://brukshundklubben.se/utbildning-aktivitet/utbildning/appen-duktig-hund/)

### Swedish authorities and expert sources

- [Jordbruksverket — dog registry statistics](https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-djur/hundregistret/statistik-ur-hundregistret)
- [Jordbruksverket — identify and register dogs](https://jordbruksverket.se/djur/hundar-katter-och-smadjur/hundar/mark-och-registrera-hundar)
- [Jordbruksverket — caring for dogs](https://jordbruksverket.se/djur/hundar-katter-och-smadjur/hundar/sa-skoter-du-din-hund)
- [SKK — puppy life stages and house-training](https://www.skk.se/aga-hund/hundens-vardag/hundens-olika-aldrarfaser/)
- [SKK — dogs in crates](https://www.skk.se/aga-hund/hunden-och-lagen/hund-i-bur/)
- [SKK — vaccination](https://www.skk.se/aga-hund/halsa-och-skotsel/vaccination/)
- [Naturvårdsverket — dogs in nature](https://www.naturvardsverket.se/amnesomraden/allemansratten/sa-gor-vi-allemansratt/hundar-i-naturen/)
- [SKK Hunddata](https://hundar.skk.se/HUNDDATA/index.aspx)
- [SKK Avelsdata](https://www.skk.se/uppfodning/avel-inom-skk/avelsdata/)
- [IMY — privacy by design and by default](https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/inbyggt-dataskydd-och-dataskydd-som-standard/)

### Technical and platform sources

- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo local-first architecture](https://docs.expo.dev/guides/local-first/)
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Expo Localization](https://docs.expo.dev/versions/latest/sdk/localization/)
- [Expo testing](https://docs.expo.dev/develop/unit-testing/)
- [Codemagic React Native/Expo builds](https://docs.codemagic.io/yaml-quick-start/building-a-react-native-app/)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Apple App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)
- [Apple account deletion guidance](https://developer.apple.com/support/offering-account-deletion-in-your-app)
