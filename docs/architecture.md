# Architecture

**Transitional state (v2 rewrite in progress).** `index.js` → `App.tsx` currently renders a placeholder screen — the v1 `JournalScreen` was removed pending the v2 navigation shell and screens described in `app-context.md`. No navigation library or state manager is wired up yet.

**`src_v1_backup/` — frozen v1 code**, kept for reference/reuse, not part of the active build (excluded from `tsconfig.json`, `.eslintignore`, `jest.config.js`):
```
src_v1_backup/
├── config/               — challenge.ts (v1 CHALLENGE_CONFIG)
├── screens/              — JournalScreen.tsx (v1 single screen)
├── components/           — all v1 UI components
└── styles/               — shared.ts (remindersStyles, sectionTitle)
```

**`src/` — active, but still v1-shaped**; kept as a low-level starting point and not yet rewired to the v2 Habit/HabitGroup model:
```
src/
├── theme.ts              — colors, fonts (still v1's parchment palette — doesn't match v2's dark/orange screens yet)
├── types/                — shared TypeScript types (still DayLog/HabitDefinition-shaped, pre-dates Habit/HabitGroup)
├── utils/                — dates.ts, habits.ts, time.ts
├── storage/              — storage.ts (AsyncStorage wrappers; still DayLog-shaped, config-loading removed with `config/`)
└── notifications/        — reminders.ts, mindfulnessBell.ts (unaffected by the data-model rewrite)
```

**Code style** (enforced via `.prettierrc.js`): single quotes, trailing commas, no parens on single arrow-function params.

**TypeScript** extends `@react-native/typescript-config`; all source files are `.ts`/`.tsx`.

**Android targets** API 24 (min) → 36 (target), New Architecture enabled (`newArchEnabled=true`), Hermes enabled.
