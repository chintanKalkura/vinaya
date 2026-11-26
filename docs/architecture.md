# Architecture

`index.js` → `App.tsx`: a React Navigation bottom tab navigator (Habits, Journal, Level-Up, Profile) with `BottomMenu` as its tab bar. Back on another tab returns to Habits; on Habits it leaves the app. Visited tabs stay mounted, so Habits keeps its view and filters. `App.tsx` also runs the weekly backup check (`useAutoBackup`). State is component state; there is no state manager.

The v1 app (21-day challenge, journal screen, reminders, Mindfulness Bell, countdown widget) is not in the tree. It is kept under the git tag `v1-reference`.

```
App.tsx                     — tab navigator: Habits, Journal and Level-Up (coming soon), Profile; auto backup
src/
├── theme.ts                — v2 palette (`colors.v2*`); contrast checked by theme.contrast.test.ts
├── types/                  — habit.ts, habitGroup.ts, habitConfig.ts (limits), log.ts, backup.ts
├── utils/                  — pure logic: dates, cadence windows, streaks, streak freezes, hours,
│                             group completion, sort/filter, new habit/group drafts, tombstones, contrast
├── storage/
│   ├── habitStorage.ts     — AsyncStorage collections (habits_v2, habit_groups_v2, tombstones_v2),
│   │                         the single storage write queue, read/write errors
│   ├── devSeed.ts          — debug-only sample data
│   └── appInfo.ts          — AppInfo native module (install time, version name)
├── services/               — habitService, habitGroupService: every change is one queued storage operation
├── backup/                 — Google sign-in (googleAccount), Drive store (driveBackupStore, BackupStore),
│                             mergeBackup, schema, backupService, account flows, backup state
├── hooks/                  — useToday (date rollover), useAutoBackup
├── config/                 — google.ts (Web OAuth client ID)
└── screens/
    ├── HabitsScreen.tsx    — list and group views, saves, errors; form steps in habits/formFlow.ts
    ├── habits/             — rows, pills, group cards, header, sheets, forms, menus, labels, tap targets
    ├── ProfileScreen.tsx
    ├── ComingSoonScreen.tsx — Journal and Level-Up until they're built
    └── profile/            — AccountSection (sign-in and backup)
```

Specs: `feature-development/`. Look and feel: `style-choices/` (listed in `CLAUDE.md`).

**Code style** (enforced via `.prettierrc.js`): single quotes, trailing commas, no parens on single arrow-function params.

**TypeScript** extends `@react-native/typescript-config`; all source files are `.ts`/`.tsx`.

**Android targets** API 24 (min) → 36 (target), New Architecture enabled (`newArchEnabled=true`), Hermes enabled.
