# Vinaya V2 App Context

## App

**Vinaya** — bare React Native, TypeScript, Android-only target. Uses `@react-native-async-storage/async-storage` for local storage. No Expo.

## App Context (v2)

**v2 is a major rewrite, in progress.** v1 was a fixed 21-day precepts challenge with a single journal screen — that model is gone. v2 is a general-purpose, user-defined habit and habit-group tracker with its own navigation shell. Fully offline. Android-only.

The v1 implementation (`components/`, `screens/`, `config/`, `styles/`) has been moved to `src_v1_backup/` for reference/reuse — see `architecture.md`. `src/theme.ts`, `types/`, `utils/`, `storage/`, `notifications/` remain in place as a v1-shaped starting point but are not yet rewired to the v2 model described here.

**Design source of truth**, in order of precedence: `screens/habits-section/habits-gaps-and-additional-info.md` (decisions made after the mockups, plus known gaps), then `screens/habits-section/*.png` and `navigation/habits-section/*.md` (node IDs match screen numbers). `navigation/habits-section/how-to-use-navigation-and-screens.md` explains how to read them. Keep these in sync as the design evolves; they are authoritative over this summary. Where something is listed as a gap, there is no design yet: ask, do not invent.

**Core model:**
- **Habit** — name, cadence (`Day`/`Week`/`Month`/`Year`), a cadence-scoped target (Day has no input: a read-only "Repeats every day, no target needed" block is shown; Week 1-6, Month max 20, Year max 100), a streak-freeze allowance ("1 skip per N streaks", N configurable, max 100), a type (`Checkmark` or `Hours`: Hours adds a "Daily Target Hours" stepper below Type, in addition to the cadence target), and optional membership in any number of Habit Groups (stored only on each group's `habitIds`; see `feature-development/habits-section/create-habit-group.md`).
- **Habit Group** — name, cadence, a cadence-scoped target (same input and limits as a Habit's target; Day shows the read-only text block), a streak-freeze allowance on the group's own streak ("1 skip per N streaks", default 7, max 100; see `feature-development/habits-section/streak-freeze.md`), and a group type: `Required` (a marked subset of assigned habits must be done), `Any` (any one assigned habit completes the group), `All` (every assigned habit must be done), or `Hours` (total logged hours across assigned habits must meet an aggregate target). v1's `CompositeRule` union in `src/types` (`any`/`all`/`required`/`hours`) already matches this shape — reuse/evolve it rather than redesigning from scratch. Only existing habits can be assigned (or the habit being created, via "+ Create Group"), minimum one; Create Habit Group is disabled until one is assigned. A habit can be in several groups; assigning never moves it. Required/Any/All groups accept only Checkmark habits; Hours groups accept only Hours habits. Incompatible habits appear greyed out and unselectable in the assign sheet, with no label. Hours group aggregate target: 1-24, default 1. How a group's target relates to its sub-habits' targets is not yet defined (see gaps doc); do not invent it.

**Navigation** — bottom tab bar, flush with the screen's bottom edge (see `style-choices/habits-section/header-and-bottom-menu.md`): **Habits**, **Journal**, **Level-Up**, **Profile**. Only **Habits** has designed screens/flows so far; Journal/Level-Up/Profile are nav destinations with no mockups yet.

**Habits tab:**
- **Group view** (default, habits nested under group cards) and **List view** (flat, each habit shows its parent group inline), toggled by an icon.
- **Sort & Filter** bottom sheet: sort by Streak/A-Z/Recent (default oldest first; Manual removed); show Completed/Active (Paused/Archived not built yet). Habits are edited or deleted from list view and groups from group view, through a ⋮ menu on banners (see `feature-development/habits-section/edit-habit-group.md`). See `feature-development/habits-section/sort-filter-delete-habit.md`.
- FAB (＋) → **Choice sheet** → *New Habit* or *New Habit Group*.
- **New Habit flow**: Name → Cadence → Target (Day: read-only text block) → Streak Freeze → Type (Checkmark/Hours) → Daily Target Hours (Hours only) → optional Habit Group (single scrollable row: "+ Create Group" first, then existing groups; no "No Group" option: no group is selected by default and tapping the selected chip clears it; groups the habit type can't join are greyed out). See `feature-development/habits-section/create-habit.md`.
- **New Habit Group flow**: Name → Cadence → Target (Day: read-only text block) → Group Type → Assign Habits (multi-select sheet) → type-specific step (`Required`: pick the required subset via a sheet; `Hours`: set the aggregate hours target; `Any`/`All`: no extra step) → optional "Create Habit" cross-link.
- **Hours Entry Modal**: logs hours against an Hours-type habit (stepper, tap-to-type, default 0).
