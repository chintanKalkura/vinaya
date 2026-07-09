# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Instructions

Follow instructions exactly as given. Do not add unrequested features, suggestions, or variations. If there is a reason to deviate, ask for confirmation and provide reasons first.

## App

**Vinaya** — bare React Native, TypeScript, Android-only target. Uses `@react-native-async-storage/async-storage` for local storage. No Expo.

## Vinaya — App Context (v2)

**v2 is a major rewrite, in progress.** v1 was a fixed 21-day precepts challenge with a single journal screen — that model is gone. v2 is a general-purpose, user-defined habit and habit-group tracker with its own navigation shell. Fully offline. Android-only.

The v1 implementation (`components/`, `screens/`, `config/`, `styles/`) has been moved to `src_v1_backup/` for reference/reuse — see **Architecture** below. `src/theme.ts`, `types/`, `utils/`, `storage/`, `notifications/` remain in place as a v1-shaped starting point but are not yet rewired to the v2 model described here.

**Design source of truth**: `docs/screens/*.png` (numbered mockups) and `docs/navigation/*.md` (mermaid flowcharts, node IDs match screen numbers). Keep these in sync as the design evolves — treat them as authoritative over this summary.

**Core model:**
- **Habit** — name, cadence (`Day`/`Week`/`Month`/`Year`), a cadence-scoped target count (Day has none — "repeats every day, no target needed"; Week/Month/Year have a user-adjustable target up to a cadence max, e.g. 6/20/100), a streak-freeze allowance ("1 skip per N streaks", N configurable), a type (`Checkmark` or `Hours` — Hours swaps the target for a "Daily Target Hours" stepper), and optional membership in a Habit Group.
- **Habit Group** — name, cadence, and a group type: `Required` (a marked subset of assigned habits must be done), `Any` (any one assigned habit completes the group), `All` (every assigned habit must be done), or `Hours` (total logged hours across assigned habits must meet an aggregate target). v1's `CompositeRule` union in `src/types` (`any`/`all`/`required`/`hours`) already matches this shape — reuse/evolve it rather than redesigning from scratch.

**Navigation** — bottom tab bar: **Habits**, **Journal**, **Level-Up**, **Profile**. Only **Habits** has designed screens/flows so far; Journal/Level-Up/Profile are nav destinations with no mockups yet.

**Habits tab:**
- **Group view** (default, habits nested under group cards) and **List view** (flat, each habit shows its parent group inline), toggled by an icon.
- **Sort & Filter** bottom sheet: sort by Streak/A-Z/Manual/Recent; filter by Marked/Active/Paused/Archived.
- FAB (＋) → **Choice sheet** → *New Habit* or *New Habit Group*.
- **New Habit flow**: Name → Cadence → Target (skipped for Day) → Streak Freeze → Type (Checkmark/Hours) → optional Habit Group assignment (existing groups as chips, or "+Create Group" cross-link).
- **New Habit Group flow**: Name → Cadence → Group Type → Assign Habits (checkbox sheet) → type-specific step (`Required`: pick the required subset via a sheet; `Hours`: set an aggregate hours target; `Any`/`All`: no extra step) → optional "+Create Habit" cross-link.
- **Hours Entry Modal**: logs hours against an Hours-type habit (stepper, tap-to-type, default 0).

## Commands

```bash
# Start Metro bundler
npm start

# Run on Android device/emulator
npm run android

# Lint
npm run lint

# Test (all)
npm test

# Test (single file)
npx jest path/to/file.test.tsx
```

## Architecture

**Transitional state (v2 rewrite in progress).** `index.js` → `App.tsx` currently renders a placeholder screen — the v1 `JournalScreen` was removed pending the v2 navigation shell and screens described above. No navigation library or state manager is wired up yet.

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

## Notifications

### Daily reminders (`src/notifications/reminders.ts`)
- Library: `@notifee/react-native`
- Channel: `vinaya_reminders_v2` (previous channel `vinaya_reminders` is deleted on init)
- Sound: `zen_bell`, icon: `ic_notification`, colour: `#1E88E5`

### Mindfulness Bell (`src/notifications/mindfulnessBell.ts` + native)
Recurring bell at fixed clock times every day: **8AM, 10AM, 12PM, 2PM, 4PM, 6PM, 8PM, 10PM**.

- Implemented as a single-alarm chain via `AlarmManager.setExactAndAllowWhileIdle` in `MindfulnessReceiver.kt`
- Next alarm is scheduled **at alarm fire time**, independent of user notification response
- JS wrapper exports: `initMindfulnessBell(startDate, endDate)`, `setBellState()`, `getBellState()`, `getNextAlarmMs()`
- Three states: `active`, `snoozed_next` (next bell pushed 2 slots), `snoozed_day` (all bells cancelled until midnight)
- Notification snooze ("Snooze · next bell"): cancels next alarm, reschedules 4h after the fired slot
- Midnight reset: state resets to `active`, 8AM alarm armed for the new day
- Boot recovery: re-arms stored alarm if future; finds next valid slot if missed
- First bell never fires before `startDate` — `initMindfulnessBell` enforces this

**⚠️ `MINDFULNESS_TEST_MODE` in `mindfulnessBell.ts`:**
- `false` = production (fixed clock times, 4h snooze)
- `true` = emulator testing (2-minute intervals, 4-minute snooze)
- **Must be `false` before shipping.** Check this at the start of any session that touches notifications.

## Native Modules

Located in `android/app/src/main/java/com/vinaya/`:

| File | Bridge name | Purpose |
|---|---|---|
| `MindfulnessReceiver.kt` | — | `BroadcastReceiver`: alarm chain, notification actions, BOOT/DATE_CHANGED recovery |
| `MindfulnessModule.kt` | `"MindfulnessScheduler"` | RN bridge: `init`, `setBellState`, `getBellState`, `getNextAlarmMs` |
| `MindfulnessPackage.kt` | — | Registers `MindfulnessModule` |
| `SharedPrefsModule.kt` | `"SharedPrefs"` | RN bridge: key/value store for home-screen widget data |
| `SharedPrefsPackage.kt` | — | Registers `SharedPrefsModule` |

SharedPreferences namespace: `"com.vinaya.prefs"`. Keys prefixed `mindfulness_*` are owned by the bell system.

## Branching
At the start of every new session, create a new git branch from main before doing any work. Branch naming: feature-<short-description>, bug-<short-description>, refactor-<short-description>

## Testing
**Libraries**: Jest + React Native Testing Library

**Coverage**: All new components and utility functions must have tests. Minimum 80% coverage on business logic (habit state, streak calculation, data serialization).

**Naming conventions**:
Test files should be named as<ComponentName>.test.tsx or <utilName>.test.ts, colocated with the source file.
Test blocks should follow describe('<ComponentName>') wrapping it('should <behaviour>')

**Standards**:
Test behaviour, not implementation
One assertion per test where possible
Mock AsyncStorage in all tests — never hit real storage in tests

## Bug Fixes
When a bug is reported follow this process:
1. Read and understand the issue fully before touching code
2. Identify the root cause — do not treat symptoms
3. Write a failing test that reproduces the bug first
4. Fix the code until the test passes
5. Confirm no existing tests broke

## Commits
Do not add co-authored by claude. Write commit messages that describe the short description of the work within 15-20 words.
Make small, frequent commits. Each commit should represent one logical unit of work — a single component, a single function, a single fix. Do not batch unrelated changes into one commit.
