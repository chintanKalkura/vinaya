# Feature: Edit habit and group.

Status: ready for planning.

## Goal
user should be able to edit a habit and group and configure it with all possible values.

## Screens
- lets keep the edit menu similar to the create menu, with the values loaded into the correct fields.
- Instead of Create we change it to Save. and all the required fields rules remain the same.
- The Save habit button is disabled if no changes have been done.
- The title of the page changes from New Habit to Edit Habit, similarly for Group.

## Decisions
1. **Opening Edit.** The banner ⋮ dropdown's Edit opens the form for that habit (list view) or group (group view). Pills have no ⋮. Back (arrow or Android back) returns to the Habits screen without saving; there's no Choice sheet in this flow. Save saves and returns to the same view.
2. **Same forms as create.** Values are loaded into the fields, the title is "Edit Habit" or "Edit Habit Group", and the button says Save. The field rules and limits are the create rules (`create-habit.md`, `create-habit-group.md`).
3. **Save** is disabled until something changes, and again if the change is undone. Only fields that apply count: target only for Week/Month/Year, daily target hours only for Hours, required habits only for Required, hours target only for Hours groups. Names are compared trimmed, and habit lists as sets. Save is also disabled while the form is invalid (e.g. a Required group with no required habit).
4. **Habit type is locked.** The Type pills show, with the other type disabled: a habit's marks and hours logs can't carry over, and Hours habits only fit Hours groups.
5. **No Habit Group row on Edit Habit.** A habit can be in several groups; memberships are edited from Edit Habit Group's Assign Habits.
6. **Group type is locked.** The other group types are disabled. Name, cadence, target, streak freeze, assigned habits, required habits and hours target can be edited. Assign Habits, Select Required Habits and Create Habit work as on create; a habit made with Create Habit is saved straight away and comes back assigned. Unassigning a habit also unrequires it.
7. **History is kept.** Changing cadence, target, daily target hours or streak-freeze N keeps the log; streak and completion are recalculated from the same marks. Freezes already held are kept, and the new N applies to freezes earned from now on. A group's past completion log is kept, and today is re-checked on Save against its new members and rules.
8. **No group re-check for habit edits.** A habit edit doesn't change any group's result today: Hours groups add up logged hours, not each habit's target, and Checkmark marks don't change.

## Out of scope
- Changing a habit's type or a group's type (decisions 4 and 6)
- Editing a habit's group memberships from the habit form (decision 5)
- Editing past log entries

## Tests
- Drafts built from saved habits and groups; the change check (trimmed names, habit lists as sets, only applicable fields).
- `updateHabit`: updates fields and keeps the log and freezes; removes the target when switching to Day; rejects a type change and an empty name.
- `updateHabitGroup`: updates fields and members and keeps the log; re-checks today against new members; rejects a type change and incompatible habits.
- Edit Habit form: title, loaded values, Save label, Save enabled only while changed, locked type, no group row, edited draft submitted.
- Edit Habit Group form: title, loaded values and required chips, locked types, Save enabled after unassigning a habit, edited draft submitted.
- Banner menu: Edit opens the form and closes the dropdown.
- Habits screen: edit and rename a habit; Back saves nothing and doesn't show the Choice sheet; rename a group.

## Acceptance criteria
- [ ] Edit on a habit banner or group card opens its form with every value loaded
- [ ] The title is Edit Habit / Edit Habit Group and the button is Save, disabled until a change
- [ ] A habit's type and a group's type can't be changed
- [ ] Saved changes show straight away; Back saves nothing
- [ ] Streaks, completion and freezes held carry over
