# Puppysteps

Swedish-first puppy companion built with React Native, Expo, TypeScript, Expo Router, and SQLite.

## Run it

```bash
npm install
npx expo start
```

Use a development build for notification behavior. Expo Go is fine for exploring the UI, but local notification permissions, categories, and deep links need a real iOS device or simulator development build.

The dependency versions are pinned to the Expo SDK baseline selected for this implementation. If Expo reports a peer-version mismatch after a new SDK release, run `npx expo install --fix`, review the resulting lockfile, and record the chosen versions in the architecture decision record described in `PUPPYSTEPS_APP_PLAN.md`.

## Product slice implemented

- Swedish app chrome with English, French, German, Danish, Finnish, and Norwegian locale scaffolding.
- Local-first SQLite persistence with a short first-run dog setup.
- Up to two local dog profiles, a dog switcher, and an all-dogs Today agenda.
- Pee/poo check-ins with valid same-visit combinations, `nothing yet`, correction, and undo.
- Explainable, bounded bladder and bowel reminder candidates.
- Best-effort local notifications with a permission primer, snooze, quiet hours, and `Hemma / inte ansvarig` duty control.
- Timeline, milestones, 7-day insight cards, reviewed lesson metadata, and privacy/support controls.

See [PUPPYSTEPS_APP_PLAN.md](./PUPPYSTEPS_APP_PLAN.md) for the complete product, safety, localization, monetization, testing, and delivery plan.
