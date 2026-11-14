# Feature: Create habit.

Status: ready for planning.

## Goal
user should be able to create a habit and configure it with all possible vlaues.

## Screens
- ![05 - Create_ Choice Sheet.png](../screens/05%20-%20Create_%20Choice%20Sheet.png)
- ![06 - Create_ New Habit - Day.png](../screens/06%20-%20Create_%20New%20Habit%20-%20Day.png)
- ![07 - Create_ New Habit - Week.png](../screens/07%20-%20Create_%20New%20Habit%20-%20Week.png)
- ![08 - Create_ New Habit - Month.png](../screens/08%20-%20Create_%20New%20Habit%20-%20Month.png)
- ![09 - Create_ New Habit - Year.png](../screens/09%20-%20Create_%20New%20Habit%20-%20Year.png)
- ![10 - Create_ New Habit - Day - Hours.png](../screens/10%20-%20Create_%20New%20Habit%20-%20Day%20-%20Hours.png)
- [habits-gaps-and-additional-info.md](../screens/habits-gaps-and-additional-info.md)
- [navigation](../navigation)

## Scope
- Create all kinds of habits with all possible cadences.
- Use the additional info doc to make decisions.
- Habit groups are out of choice.
- Use the navigation folder and mermaid diagrams from the folder to make decision on naviagtion.

## Decisions
1. **Flow** (`docs/navigation/02-habit-creation.md`):
   - The + button opens the Choice sheet (05). New Habit opens the New Habit form (06-10).
   - Back on the form (the arrow or Android back) returns to the Choice sheet. Tapping the backdrop or pressing back on the sheet closes it.
   - Create Habit saves the habit and returns to the Habits view the + was tapped from, list or group (navigation gap 2). The cadence filter is unchanged, so a new habit outside the current filter stays hidden until the filter changes.
   - Cadence and type are pill selections on the same form, not separate screens.
2. **How it is shown.** React Native `Modal`s, with no navigation library. The Choice sheet is a bottom sheet over the Habits screen, and the form is a full-screen modal. Both extend under the status and navigation bars, padded by the safe-area insets.
3. **Groups are out of scope.** "New Habit Group" on the Choice sheet and the "+ Create Group" chip are drawn as on the screens, but tapping them does nothing.
4. **Fields**, in the order of the gaps doc 1.1:
   - Name, Cadence, Target, Streak Freeze, Type, Daily Target Hours (Hours only), Habit Group, Create Habit.
   - The back arrow is shown on every variant, including screen 06, where the PNG leaves it out.
5. **Defaults and limits.**

   | Field | Default | Input | Limits |
   |---|---|---|---|
   | Name | empty | text | required, trimmed, at most 40 characters; duplicates allowed |
   | Cadence | Day | pills | Day, Week, Month, Year |
   | Target | 1 | stepper or typed | Day: read-only "Repeats every day, no target needed". Week 1-6, Month 1-20, Year 1-100, shown as "of N max" |
   | Streak Freeze | 7 | typed ("1 skip per N streaks") | 1-100 |
   | Type | Checkmark | pills | Checkmark, Hours |
   | Daily Target Hours | 1 | stepper or typed | 1-24, Hours only |
   | Habit Group | none | chip row | see decision 6 |

   - When the cadence changes, the target is clamped to the new maximum (e.g. 50 on Year becomes 6 on Week).
   - Create Habit is disabled while the name is empty.
6. **Joining a group.** A new habit can join a compatible existing group only.
   - Checkmark habits can join Required, Any or All groups; Hours habits can join Hours groups only. Incompatible chips are greyed out and can't be tapped.
   - No group is selected by default. Tapping the selected chip again clears it, and switching the type clears a group that becomes incompatible.
   - Joining a Required group doesn't make the habit required.
   - The group's habit list gains the habit, and the group's completion for today is re-checked (a new member can make an All group incomplete).
7. **Saving.** The habit is added last in sort order, with no log, `status: 'active'`, and no freezes earned. Day habits store no `target`; only Hours habits store `targetHours`.

## Out of scope
- Group creation, and its entry points (decision 3)
- Editing, pausing or archiving a habit
- Sort & Filter

## Tests
- Name validation: empty, spaces only, more than 40 characters, trimming.
- Target clamped per cadence; no target for Day; target hours only for Hours, 1-24; freeze interval 1-100.
- Which group types each habit type can join.
- `createHabit`: saves the defaults, adds the habit last, gives each habit its own id, joins the group and re-checks it, and rejects an empty name or an incompatible group.
- Choice sheet: both options shown; New Habit opens the form; New Habit Group does nothing; the backdrop closes it.
- Stepper: steps and typed values are clamped to min and max.
- Form: the Day block and the Week/Month/Year steppers with their max; target clamped on cadence change; Daily Target Hours only for Hours; incompatible chips disabled; group cleared by a type switch or a second tap; "+ Create Group" does nothing; Create disabled for an empty name; every field submitted; back.
- Habits screen: + → sheet → form → back to the sheet; a created habit appears in list view, and in its group in group view, without changing the view.

## Acceptance criteria
- [ ] The + button opens the Choice sheet, and New Habit opens the New Habit form
- [ ] Habits can be created for every cadence and both types, with the defaults and limits in decision 5
- [ ] A habit can join a compatible group, and incompatible groups can't be picked
- [ ] Back from the form returns to the Choice sheet
- [ ] After Create Habit, the new habit shows in the view the + was tapped from
- [ ] "New Habit Group" and "+ Create Group" do nothing
