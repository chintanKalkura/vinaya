# Feature: Usability fixes from testing observations.

Status: ready for planning.

## Goal
Fix the defect and the tap-target issues found while testing v2.

## Scope (from Testing Observations)
- The keyboard is enabled after coming back from the Create Habit screen to the Create Group screen.
- Currently clicking on a banner checkmarks the habit; only the area on the left where the checkmark is should mark the habit.
- The icon next to a group looks markable but isn't.

## Decisions
1. **Keyboard on return (bug). NOT DONE: parked, can't be reproduced (17 Nov 2026).** Seen once on the owner's phone (Android 16, Gboard): type a group name in New Habit Group (from +), tap Create Habit, create the habit, and the keyboard showed on return. It doesn't reproduce on that phone any more, nor on the emulator (API 37, Gboard) with the same steps and four variations (back arrow, typing in the habit form, the keyboard up or hidden when tapping Create Habit). No code was changed for it. Reopen with a device that shows it, then follow the original plan below.
   Original plan: Returning from Create Habit (opened by "Create Habit" on the group form) to the group form must not open the keyboard. The group name field keeps its value but not focus. Follow `docs/bug-fixes.md`: find the root cause (likely focus restored to the last `TextInput` when the stacked form `Modal` closes), write the failing test first.
2. **Mark only from the checkmark.** On Checkmark habit banners (list view) and pills (group view), only the check circle area marks or unmarks. The area is at least 48×48dp (`accessibility-fixes.md`). The rest of the banner does nothing until the detail page exists; then it opens the detail page (`habit-group-detail-page.md`).
3. **Hours habits.** Same rule: only the progress bar area opens the Hours modal. Design decision required on whether a separate "+" log button is clearer.
4. **Group completion icon.** The group card icon is a status indicator, not a control. It must not look like the habit check circle: no circular outline when not complete. New look: design decision required (e.g. a small filled dot or badge style). It has no press handler and no `checkbox` role.

## Out of scope
- Detail page itself

## Tests
- Group form: after returning from Create Habit, the name input is not focused (failing test first).
- Pressing the banner body of a Checkmark habit doesn't call `markHabitDone`; pressing the check area does. Same for pills.
- Pressing an Hours banner outside the bar doesn't open the modal; pressing the bar does.
- The group status icon has no press handler and no checkbox role.

## Acceptance criteria
- [ ] Coming back to the group form from Create Habit doesn't show the keyboard (**not done: parked, not reproducible**)
- [ ] Scrolling or tapping a banner's name never marks a habit
- [ ] The group status icon can't be mistaken for a checkbox
