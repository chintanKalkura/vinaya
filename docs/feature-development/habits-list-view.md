# Feature: Design the list view screen

Status: ready for planning.

## Goal
The List View screen follows the design as shown in ![04 - Habits - List View.png](../screens/04%20-%20Habits%20-%20List%20View.png)
The user can see this screen with the data preloaded from dev seed.

## Scope
All the design elements seen in the screen are in scope.
- The toggle for group view and list view must now be enabled and switch the views, the default selection will be group view.
- Use the rounded checkmark design for all habits with a checkmark type.
- The hours type habits should not have a checkmark, lets change the view to include the progress bar design from groups with hours type. Document this in [habits-gaps-and-additional-info.md](../screens/habits-gaps-and-additional-info.md)
- The orange and greyed out elements are applicable as per existing rules.
- The habit group assigned should be visible as is in the screen.
- For habits without a group, keep the group name empty. Use Drink water for this, seed this habit into dev.

## Out of scope:
- Wiring any other buttons: cadence, sort, FAB, bottom menu
- Sort & Filter sheet, Choice sheet
- 

## Decisions
1. The view toggle switches between list view (default) and group view. List view became the default after the Week, Month and Year cadence feature; see 11. Cadence, sort, FAB and bottom menu stay unwired.
2. List view shows every habit, in `sortOrder`, scrollable. Screen 04 shows the top of the list.
3. Every Checkmark habit uses the round check icon: orange-filled with a check when marked, grey outline otherwise. Screen 04's square checkbox on Cook is superseded.
4. Checkmark rows show the name, streak and italic group name. Tapping a row marks or unmarks it. Colors follow `docs/style-choices/coloring-rules.md`.
5. Hours rows have no check icon. They show the name, the streak, the italic group name, a progress bar (hours today / habit `targetHours`, capped at full) with a short `{hours}/{target}h` label beside it (see `docs/style-choices/hours-progress.md`). The row is complete when hours today ≥ `targetHours`, and its colors follow `docs/style-choices/coloring-rules.md`.
6. Tapping an Hours row opens the existing Hours Entry Modal, the same as in group view.
7. Habits without a group show no group name.
8. An Hours habit's streak is the number of consecutive days its `targetHours` was met, ending today, or ending yesterday if today's target is not met yet. The streak number's color follows the coloring rules: orange only when the target is met today, grey otherwise, even while the streak is alive.
9. In group view, Hours habits inside an Hours group use the same row component as list view, without the group name, laid out two per row in the banner. They are pills and follow the pill coloring rule.
10. In list view, each habit row is a banner, the same as a habit group card:
    - Complete: orange 2px border, orange card background and orange streak number.
    - Not complete: grey border, grey card background and grey streak number.
    - The title is white in both states.
    - For an Hours habit, complete means its `targetHours` is met today.
    - All colors come from `getColorScheme` in `src/screens/habits/colorRules.ts` (see `docs/style-choices/coloring-rules.md`).
11. List view is the default view when the Habits screen opens. The grid toggle switches to group view.
12. On a habit banner in list view, the streak number sits at the right end of the title line. This applies only to banners in list view. Habit pills inside a group card keep the streak right after the name.
13. Every banner shows its cadence in the bottom-right corner: habit banners in list view and group cards in group view. Habit pills inside a group card don't show it. See `docs/style-choices/cadence-label.md`.

## Fixtures
Drink Water (Checkmark, no group) has a 4-day streak ending today and is the last habit by `sortOrder`.

## Tests
- HabitsScreen: list view is active by default, with the list toggle selected.
- HabitListRow: the streak is right-aligned on banners (Checkmark and Hours) and stays beside the name on pills. Banners show the cadence label and pills don't.
- CadenceLabel: Day/Week/Month/Year show as Daily/Weekly/Monthly/Yearly, with the icon, in the bottom-right corner.
- GroupCard: shows the group's cadence label. Pills inside it show none.
- HabitsHeader: the active toggle follows `viewMode`. Pressing list or group calls `onChangeViewMode` with that mode, and the active button follows `viewMode`.
- HabitListRow: a marked Checkmark row shows the round check. An Hours row shows the streak (not `{n}h`), the bar and the `{hours}/{target}h` label. An Hours row is orange at its target and grey below it, and pressing it calls `onPress`.
- Hours streak: counts consecutive days the target was met, and is grey when the target was met yesterday but not yet today.
- HabitListRow banner: a marked row (or an Hours row that met its target) has the orange border, background and number, and an unmarked row stays grey with a grey number. The title is white in both states. As a pill, the row never gets the orange banner.
- colorRules: the pill and banner schemes match `docs/style-choices/coloring-rules.md`.
- HabitPill: the title and number are both grey when not marked today, even with an active streak.
- GroupCard: the title is white in both states, and the selector and chart icon are grey when not complete.
- GroupCard: an Hours group renders its habits as list rows, two per row, without repeating the group name.
- HoursProgress: the fill is proportional and capped at 100%, and the label beside the bar shows `{total}/{target}h`.
- HabitsScreen: the list toggle shows rows and the group toggle shows cards again. Ungrouped habits show in list view with no group name. Tapping a Checkmark row marks it, and tapping an Hours row opens the modal.
- Seed: Drink Water has a 4-day streak, has no group and is last by `sortOrder`.

## Acceptance criteria
- [ ] List view is shown by default
- [ ] The list toggle shows the list view and the grid toggle returns to group view
- [ ] List rows match screen 04, with round checks for Checkmark habits and a progress bar for Hours habits
- [ ] The streak sits at the right end of the title line on list-view banners, and next to the name on pills
- [ ] Habit banners and group cards show their cadence label in the bottom-right corner
- [ ] Marked habits in list view show the orange border, orange background and orange number, like a complete group banner, with a white title
- [ ] An unmarked habit with an active streak shows a grey streak number in both views
- [ ] Drink Water is last with a streak of 4 and no group name
- [ ] Tapping a Checkmark row marks or unmarks it, and tapping an Hours row opens the Hours Entry Modal

## Open questions
None.
