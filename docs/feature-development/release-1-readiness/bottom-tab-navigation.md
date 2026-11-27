# Feature: Working bottom tabs, with Journal and Level-Up marked as coming soon.

Status: done.

## Goal
Every bottom-menu tab does something: Habits and Profile open their screens, and Journal and Level-Up explain they are coming.

## Scope
- Helper text for the parts of the app that are yet to be built.
- Wording: decided with the owner (25 Nov 2026), see `../../style-choices/tabs/coming-soon.md`.

## Decisions
1. **Navigation.** Add a navigation library (e.g. React Navigation bottom tabs) using the existing `BottomMenu` look from `../../style-choices/habits-section/header-and-bottom-menu.md`. The selected tab is orange; the rest white.
2. **Tabs.** Habits (current screen), Journal (coming soon), Level-Up (coming soon), Profile (`profile-tab.md`).
3. **Coming-soon screens.** Same background and header style as Habits, title "Vinaya - Journal" / "Vinaya - Level-Up", and a short text saying what the section will be and that it's coming. Wording: `../../style-choices/tabs/coming-soon.md`; no illustration.
4. **Android back** on any tab other than Habits goes to Habits; on Habits it leaves the app.
5. **The FAB** shows only on Habits.
6. Forms and sheets opened from Habits stay above the tab bar as today.

## Out of scope
- Journal and Level-Up features

## Tests
- Tapping each tab shows its screen and highlights it.
- Journal and Level-Up show their coming-soon text.
- Back from another tab returns to Habits.
- FAB only on Habits.

## Acceptance criteria
- [x] All four tabs respond to taps
- [x] Journal and Level-Up tell the user the section is coming
- [x] Habits behaves exactly as before
