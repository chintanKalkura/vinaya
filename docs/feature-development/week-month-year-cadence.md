# Feature: Habits and groups with week, month, and year cadence.

Status: ready for planning.

## Goal
User should be able to track and record habits and groups with week, month and year.

## Screens
- ![07 - Create_ New Habit - Week.png](../screens/07%20-%20Create_%20New%20Habit%20-%20Week.png)
- ![08 - Create_ New Habit - Month.png](../screens/08%20-%20Create_%20New%20Habit%20-%20Month.png)
- ![09 - Create_ New Habit - Year.png](../screens/09%20-%20Create_%20New%20Habit%20-%20Year.png)
- ![01 - Habits - Group view.png](../screens/01%20-%20Habits%20-%20Group%20view.png)
- ![04 - Habits - List View.png](../screens/04%20-%20Habits%20-%20List%20View.png)
- ![10 - Create_ New Habit - Day - Hours.png](../screens/10%20-%20Create_%20New%20Habit%20-%20Day%20-%20Hours.png)
- ![11 - Create_ New Habit Group.png](../screens/11%20-%20Create_%20New%20Habit%20Group.png)

## Scope
- Both habits and habit groups.
- The buttons for cadence at the top of the screen, this neeeds to be redesigned as mentioned in cadence filter redesign below.
- The buttons are display filter, which shows the applicable habits or groups based on the view option.
- The sort option should also work separately here, the cadence filter takes precedence.
- Seed data as currently there are no other habits and groups with cadence other than day.
- Cadence is applied separately to groups and habits.
- in group view - only cadence of the habit groups should be considered and in list view only of the habits.
- groups and habits of hours type is applicable to this. There can be groups and habits with a different cadence but of hours type.
- The fields target needs to be added for groups or habits if not added already and max allowed value needs to be considered.

## cadence filter redesign 
- Current filters show Day, week, month, year - its not convenient.
- Lets do All, one button which is clickable, when clicked shows a dropdown.
- Dropdown has values - All, Day, Week, Month, Year.
- The selected option is in ornage, rest grey.
- The selected option is shown in the heading in place of the current four values.
- Need to think of a way to indicate that it is a dropdown. -- design this.
## Decisions
1. **Rolling window.** Every cadence has a window that ends today:

   | Cadence | Window |
   |---|---|
   | Day | 1 day |
   | Week | 7 days |
   | Month | the number of days in today's calendar month (28, 29, 30 or 31) |
   | Year | 365 days, or 366 when today's year is a leap year |

   Weeks, months and years have no fixed start or end.
2. **Marked day.** A Checkmark habit is marked by hand, at most once a day, on any day. An Hours habit's day counts as marked when that day's hours meet its daily target hours.
3. **Target.** Week 1–6, Month up to 20, Year up to 100 (`DEFAULT_HABIT_LIMITS.cadenceTargetMax`). It is stored as `target` on both `Habit` and `HabitGroup`, for Checkmark and Hours types. Day has no target; it behaves as 1.
4. **Complete.** A Week/Month/Year habit is complete while the marked days in its window are at least its target.
   - Example: target 4 per week, marked on days 1–4. It is complete on days 4, 5, 6 and 7, and incomplete on day 8, when day 1 leaves the window.
5. **Streak.** The streak is the number of marked days in the current run.
   - The run continues while each mark is no more than one window length after the previous one.
   - The run stays alive through the day one window length after the latest mark, the last day a mark can still continue it. It drops to 0 the day after, once that day has ended with no mark. This matches Day cadence, where a mark keeps the streak alive until the end of the next day.
   - Example: Week, latest mark on 1 June. The streak is alive through the end of 8 June (counting back 7 days from 8 June reaches 1 June) and is 0 on 9 June.
   - Amended by `streak-freeze.md` decision 9; the run used to end one day earlier, on the last day it could still be marked.
   - Example: target 4 per week, marked on days 1–4 and 9–12, today is day 12. The streak is 8. The habit is complete on days 4–7 and on day 12, and incomplete on days 8–11 while the streak stays alive.
6. **Day cadence is unchanged.** A Day habit is complete when marked today. Its streak is the run of consecutive marked days ending today, or ending yesterday if today is not marked yet.
7. **Groups.** Each day, a group is complete or not by its group-type rule (Required, Any, All, or Hours total ≥ daily target hours). This is recorded in the group log as today. A Week/Month/Year group is complete while its complete days in the window are at least the group's `target`. Its streak follows decision 5. The cadences of its member habits don't affect this.
8. **Display.** Week/Month/Year habits and groups look the same as Day ones (streak number, check icon, and the Hours bar and label).
   - Title, number and banner are orange while the habit or group is complete (decision 4 or 7).
   - The check icon or group selector is filled only when today is marked, or for a group, when today is complete.
   - For Day the two are the same.
   - See `docs/style-choices/coloring-rules.md`.
9. **Cadence filter.** One dropdown replaces the four cadence pills in the header. It offers All, Day, Week, Month and Year, and the default is All. See `docs/style-choices/cadence-filter.md`.
10. **What the filter applies to.** In group view it filters groups by the group's cadence; each group still shows all its habits. In list view it filters habits by the habit's cadence.
11. **Sort.** Sort stays unwired in this feature. When it is built, it orders whatever the cadence filter shows, so the filter takes precedence.

## Fixtures
Day offsets are relative to today (0 = today).

- **Fitness** (Week, Any, target 3): complete.
  - Run (Week, Checkmark, target 3): marked on days 0, −2, −4, −8, −10, −12. Complete, streak 6.
  - Gym (Week, Checkmark, target 2): marked on days −3, −9. Incomplete with the streak alive, streak 2.
- **Deep Work** (Month, Hours, 3 daily target hours, target 12): incomplete.
  - Write Book (Month, Hours, 2h a day, target 15): complete.
  - Piano (Month, Hours, 1h a day, target 10): incomplete, with nothing logged today.
- **Yearly Goals** (Year, All, target 40): incomplete.
  - Read Paper (Year, Checkmark, target 50): marked every 3rd day for 180 days, including today. Complete.
  - Volunteer (Year, Checkmark, target 20): marked every 14 days. Incomplete.
- **Call Family** (Week, Checkmark, target 2, no group): marked on days −1 and −5. Complete but not marked today, so orange with an empty check.

Group logs are worked out from the member habits' logs, so they match the marks.

## Out of scope
- Sort & Filter sheet and sorting (decision 11)
- Create Habit and Create Habit Group forms (screens 07–11)
- Streak freeze
- Editing a habit's or group's cadence or target

## Tests
- Window lengths for 28-, 29-, 30- and 31-day months, and 365- and 366-day years.
- Target is clamped to each cadence's maximum. Day has no target.
- Complete status across the window edge: the target-4 example is complete on days 4–7 and incomplete on days 8–11.
- Streak: 8 for marks on days 1–4 and 9–12; alive through the day one window after the latest mark (1 June → 8 June for Week) and 0 the day after.
- Day status and streak are unchanged.
- An Hours habit's marked days come from days that met the daily target.
- Week, Month and Year Checkmark habits can be marked and unmarked, and Hours habits of any cadence can log hours.
- Coloring: title, number and banner follow complete status; the icon follows marked today.
- Cadence filter:
  - It shows the selected value with a chevron.
  - Opening it lists the five values, with the selected one orange and checked.
  - Choosing a value applies it and closes the menu. Tapping outside closes it too.
- Habits screen:
  - All shows everything.
  - Week shows only Week groups in group view and only Week habits in list view.
  - A Week group still shows its Day habits.
- Seed: every fixture state above, and group logs consistent with their members.

## Acceptance criteria
- [ ] The header shows one cadence dropdown, defaulting to All
- [ ] Choosing a cadence filters groups in group view and habits in list view
- [ ] Week, Month and Year habits can be marked or logged on any day
- [ ] A Week/Month/Year habit or group is orange while its window meets the target, and its streak follows decision 5
- [ ] The seeded fixtures show complete, incomplete and alive-but-incomplete states for every cadence
- [ ] Day habits and groups behave exactly as before

## Open questions
None.
