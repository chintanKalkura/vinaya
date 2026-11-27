# Architecture

`index.js` → `App.tsx`: a React Navigation bottom tab navigator (Habits, Journal, Level-Up, Profile) with `BottomMenu` as its tab bar. Back on another tab returns to Habits; on Habits it leaves the app. Visited tabs stay mounted, so Habits keeps its view and filters. `App.tsx` also runs the weekly backup check (`useAutoBackup`). State is component state; there is no state manager.

The v1 app (21-day challenge, journal screen, reminders, Mindfulness Bell, countdown widget) is not in the tree. It is kept under the git tag `v1-reference`.

```
App.tsx                     — tab navigator: Habits (a stack: the list and the habit and group pages), Journal and
                              Level-Up (coming soon), Profile; auto backup
src/
├── theme.ts                — dark and light (Lavender) palettes; contrast checked by theme.contrast.test.ts
├── theming.tsx             — ThemeProvider, usePalette, useThemedStyles (styles built per palette)
├── content/              — howToUse.ts and support.ts: walkthrough, help, empty-screen and support wording
├── support/              — Play Billing behind BillingClient (react-native-iap client, fake for tests), purchase handling
├── settings/               — SettingsProvider: display settings (settings_v2) and the palette they pick
├── systemBars.ts           — SystemBars native module (navigation bar icon colour)
├── types/                  — habit.ts, habitGroup.ts, habitConfig.ts (limits), log.ts, backup.ts
├── utils/                  — pure logic: dates, cadence windows, streaks, streak freezes, hours,
│                             group completion, sort/filter, new habit/group drafts, tombstones, contrast,
│                             history.ts (page stats), rating.ts (the five stars), pastDays.ts (Edit past days range),
│                             logs.ts (set one day)
├── storage/
│   ├── habitStorage.ts     — AsyncStorage collections (habits_v2, habit_groups_v2, tombstones_v2),
│   │                         the single storage write queue, read/write errors
│   ├── settingsStorage.ts  — settings_v2 (default view, theme, week start), through the write queue
│   ├── onboardingStorage.ts — onboarding_seen_v1 (walkthrough seen; this phone only)
│   ├── devSeed.ts          — debug-only sample data
│   └── appInfo.ts          — AppInfo native module (install time, version name)
├── services/               — habitService, habitGroupService: every change is one queued storage operation
├── backup/                 — Google sign-in (googleAccount), Drive store (driveBackupStore, BackupStore),
│                             mergeBackup, schema, backupService, account flows, backup state
├── hooks/                  — useToday (date rollover), useAutoBackup, useReduceMotion
├── config/                 — google.ts (Web OAuth client ID)
└── screens/
    ├── HabitsScreen.tsx    — HabitsList: list and group views, filters and sort
    ├── habits/             — rows, pills, group cards, header, sheets, forms, menus, labels, tap targets;
    │                         HabitsData.tsx: the Habits tab's shared data, saves, errors and forms
    │                         (form steps in formFlow.ts), drawn over the list and the pages
    ├── detail/             — the habit and group page
    ├── ProfileScreen.tsx
    ├── ComingSoonScreen.tsx — Journal and Level-Up until they're built
    ├── howToUse/           — first-launch walkthrough and the How to use help screen
    └── profile/            — AccountSection (sign-in and backup), menu rows, About, Display settings
```

Specs: `feature-development/`. Look and feel: `style-choices/` (listed in `CLAUDE.md`).

**Code style** (enforced via `.prettierrc.js`): single quotes, trailing commas, no parens on single arrow-function params.

**Colours:** components never import `colors` directly; they build styles with `useThemedStyles(makeStyles)` and read icon colours with `usePalette()` (`style-choices/theme/light-palette.md`).

**TypeScript** extends `@react-native/typescript-config`; all source files are `.ts`/`.tsx`.

**Android targets** API 24 (min) → 36 (target), New Architecture enabled (`newArchEnabled=true`), Hermes enabled.
