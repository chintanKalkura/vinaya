# Feature: Habit and group type hours

Status: ready for planning.

## Goal
Implement habit and habit group with type hours where the habit can be tracked using hours. 

## Screens
- ![01 - Habits - Group view.png](../../screens/habits-section/01%20-%20Habits%20-%20Group%20view.png)
- ![02 - Hours Entry Modal.png](../../screens/habits-section/02%20-%20Hours%20Entry%20Modal.png)
- ![10 - Create_ New Habit - Day - Hours.png](../../screens/habits-section/10%20-%20Create_%20New%20Habit%20-%20Day%20-%20Hours.png)
- ![15 - Create_ New Habit Group - Hours.png](../../screens/habits-section/15%20-%20Create_%20New%20Habit%20Group%20-%20Hours.png)

## Scope
- hours entry modal from the screen 02 as-is should match all icons and functionalities, including opening keyboard on click
- seed a Stay Productive habit group and all habits included within that group with values as shown in screen 1.
- the coloring pattern for groups and habits should match, the logic already written for other habits and groups need to apply as-is without any extra algorithm for hours type.
- the field daily target hours needs to added as property into habit and groups type.
- a maximum capa of 24 should be configured for both habits and groups for daily target hours property.
- 

## Decisions
1. The daily target hours property is `targetHours` on both `Habit` and `HabitGroup`. `HabitGroup.hoursTarget` is renamed to `targetHours`.
2. The cap of 24 is the existing `DEFAULT_HABIT_LIMITS.hoursTargetMax`. It applies to habit and group `targetHours`, and to the hours logged in the Hours Entry Modal (0-24, whole numbers).
3. An Hours habit is marked (orange) for today when the hours logged today ≥ its `targetHours`. Otherwise it is grey.
4. An Hours group is complete (orange) for today when the total hours logged today across its habits ≥ the group's `targetHours`. Otherwise it is grey. A group with a `targetHours` of 0 or no `targetHours` is not complete.
5. Screen 01 is wrong to show Stay Productive orange at 5 / 8 hrs. Under rule 4 it would be grey. The seed uses 8 / 8 so that the banner is orange.
6. Hours groups use the existing group log sync. A marker entry is added for today when the group becomes complete and removed when it stops being complete.
7. The Stay Productive banner number is the group streak (now `getGroupStatus(...).streak`), the same as for the other groups.
8. The hours logged for a day are stored as one `{date, kind: 'hours', value}` entry in the habit's `recentLog` and `history`. Logging again on the same day replaces it, and logging 0 removes it.
9. Tapping an Hours pill opens the Hours Entry Modal, which starts at today's logged hours (default 0). Tapping the value field opens the number keyboard. **Done** saves and **×** closes without saving.

## Fixtures
Stay Productive (Hours, Day cadence): `targetHours` 8, with a 5-day group log ending today (streak 5).

| Habit | Hours today | targetHours | Colour |
|---|---|---|---|
| Job Hunt | 4 | 1 | orange |
| Study | 2 | 1 | orange |
| Build | 0 | 1 | grey |
| Write | 0 | 1 | grey |
| Sit | 1 | 1 | orange |
| Errands | 0 | 1 | grey |
| Read | 1 | 1 | orange |
| Create | 0 | 1 | grey |

Total 8 / 8, so the banner is orange.

## Out of scope
- Create Habit (screen 10) and Create Habit Group (screen 15) forms. Only the `targetHours` property and its cap of 24 are covered.
- Week, Month and Year cadence for Hours habits and groups
- Streak values for individual Hours habits (the pill shows hours logged today)
- List view (screen 04)
- Streak freeze

## Tests
- `clampHours` limits values to whole numbers between 0 and 24.
- An Hours habit is marked when hours today ≥ `targetHours`, and not marked below that.
- An Hours group is complete when total hours today ≥ `targetHours`, and not complete below that or when `targetHours` is 0.
- `setHabitHours` sets, replaces and clears (at 0) today's hours entry, clamps to 24, rejects Checkmark habits, and syncs the group log.
- Hours groups are synced by `syncGroupCompletion`.
- The seed makes Stay Productive complete (8 / 8) with a streak of 5. The four logged habits are marked and the four 0h habits are not.
- GroupCard renders the Hours header icon and the progress bar with its hours label (originally a "{total} / {target} hrs today" caption; now a `{total}/{target}h` label, see `../../style-choices/habits-section/hours-progress.md`).
- HabitPill renders `{hours}h` for Hours habits, orange when marked and grey otherwise.
- HoursEntryModal: − and + stop at 0 and 24, typing sets the value, Done calls `onDone` with the value, and × does not.
- HabitsScreen renders Stay Productive. Tapping an Hours pill opens the modal, and Done updates the pill and the banner.

## Acceptance criteria
- [ ] Stay Productive renders as in screen 01, orange, with a streak of 5 and 8 of 8 hours today (shown as `8/8h`, see `../../style-choices/habits-section/hours-progress.md`)
- [ ] The Hours Entry Modal matches screen 02, and tapping the field opens the keyboard
- [ ] Logging hours below a habit's target turns its pill grey, and at or above the target turns it orange
- [ ] Dropping the group total below 8 turns the banner grey and the streak drops to 4. Restoring it returns to orange and 5
- [ ] `targetHours` exists on Habit and HabitGroup, and `hoursTarget` no longer exists
- [ ] Hours values are capped at 24

## Open questions
None.
