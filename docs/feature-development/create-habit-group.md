# Feature: Create habit group.

Status: ready for planning.

## Goal
user should be able to create a habit group and configure it with all possible vlaues.

## Screens
- ![11 - Create_ New Habit Group.png](../screens/11%20-%20Create_%20New%20Habit%20Group.png)
- ![12 - Create_ New Habit Group - Assign Sheet.png](../screens/12%20-%20Create_%20New%20Habit%20Group%20-%20Assign%20Sheet.png)
- ![13 - Create_ New Habit Group - Required.png](../screens/13%20-%20Create_%20New%20Habit%20Group%20-%20Required.png)
- ![14 - Create_ New Habit Group - Required Sheet.png](../screens/14%20-%20Create_%20New%20Habit%20Group%20-%20Required%20Sheet.png)
- ![15 - Create_ New Habit Group - Hours.png](../screens/15%20-%20Create_%20New%20Habit%20Group%20-%20Hours.png)
- [habits-gaps-and-additional-info.md](../screens/habits-gaps-and-additional-info.md)
- [navigation](../navigation)

## Scope
- Create all kinds of habit groups with all possible cadences.
- Use the additional info doc to make decisions.
- Use the navigation folder and mermaid diagrams from the folder to make decision on naviagtion.
- Wire the button in choice sheet.
- The assign habits and required habits sheets are in scope and should work as per the screens.

## Decisions
1. **Flow** (`docs/navigation/03-group-creation.md`):
   - The Choice sheet's "New Habit Group" opens the New Habit Group form (11, 13, 15). Back returns to the Choice sheet.
   - Create Habit Group saves the group and returns to the Habits view the + was tapped from, list or group.
   - Cadence and group type are pill selections on the same form.
   - Shown with React Native `Modal`s, like the New Habit form (`create-habit.md` decision 2).
2. **A habit can be in several groups.**
   - `HabitGroup.habitIds` is the only stored membership; `Habit.groupId` is removed.
   - A lookup map, `groupIdsByHabit` (`src/utils/groupIndex.ts`), is built from the groups whenever they load and is never stored. The list view, syncing and the seed use it.
   - Marking a habit or logging its hours re-checks every group it's in.
   - In list view, a habit's subtext is all its group names, comma-joined in group sort order, on one line, truncated with "…".
   - Assigning a habit to a new group never removes it from its other groups.
3. **Fields**, in the gaps doc 1.2 order, with Streak Freeze added after Target:
   - Name, Cadence, Target, Streak Freeze, Group Type, the type description, Assigned Habits, Assign Habits and Create Habit buttons, the type-specific section, Create Habit Group.

   | Field | Default | Limits |
   |---|---|---|
   | Name | empty | required, trimmed, at most 40 characters |
   | Cadence | Day | Day, Week, Month, Year |
   | Target | 1 | Day: read-only "Repeats every day, no target needed"; Week 1-6, Month 1-20, Year 1-100 |
   | Streak Freeze | 7 | "1 skip per N streaks", 1-100 |
   | Group Type | Any | Required, Any, All, Hours |
   | Hours Target | 1 | 1-24, "of 24 max", Hours only |

4. **Type descriptions.**
   - Required: "Some habits must be done to complete the group"
   - Any: "Any one habit marks the group complete"
   - All: "Every habit must be done to complete the group"
   - Hours: "Total hours across habits must meet target"
5. **Assigned habits.**
   - A chip box; "No habits assigned yet" when empty. Required habits have a blue border.
   - Create Habit Group is disabled until at least one habit is assigned, with the line "Add at least 1 habit to create a group".
   - Required and Any/All groups take Checkmark habits; Hours groups take Hours habits.
   - Switching the group type removes habits the new type can't take, and clears the required list when leaving Required.
6. **Required groups.** The Required Habits row (star, "Select Required Habits", Edit) opens the Required sheet. Create Habit Group needs at least one required habit. Unassigning a habit also takes it off the required list.
7. **Sheets** (screens 12 and 14).
   - Assign Habits: "{Type} · tap to select", every active habit in sort order, incompatible ones greyed out. "Done (n selected)".
   - Select Required Habits: "These must be done to complete the group", the assigned habits. "Done (n required)".
   - Done applies the selection; the backdrop or back discards it. Done is always enabled.
   - Long lists scroll above the Done button.
8. **Create Habit** on the group form opens the New Habit form over it, without its Habit Group row. Create Habit saves the habit and returns to the group form with it assigned, if the group type can take it. Back returns to the group form.
9. **"+ Create Group"** on the New Habit form opens the group form over it, with the habit being created already assigned:
   - It shows as a locked chip named after the habit's draft name, or "This habit" while unnamed.
   - Group types the habit can't join are disabled, and the form starts as Any (Checkmark) or Hours (Hours).
   - The group form's Create Habit button is hidden.
   - Create Habit Group returns to the habit form with the new group selected. Nothing is saved until Create Habit, which creates the habit and then the group with it assigned (and required, if chosen).
   - Backing out of either form saves nothing. If the habit's type then changes so the new group can't take it, its chip is greyed out and deselected.
10. **Saving.** The group is added last in sort order, with no log. Today counts straight away if its members already complete it. Day groups store no `target`; only Required groups store `requiredHabitIds`, and only Hours groups store `targetHours`.

## Fixtures
- Read Fiction is in both Wind-down and 8 Precepts (not required there, so 8 Precepts' completion is unchanged). Its list subtext reads "8 Precepts, Wind-down".

## Out of scope
- Editing, pausing or archiving a group, and removing habits from an existing group
- Reordering groups
- Sort & Filter

## Tests
- `groupIdsByHabit`: a habit in 0, 1 or 2 groups, in group sort order.
- Group draft: the defaults and descriptions; type switches drop incompatible habits and clear the required list; unassigning un-requires; validation (name, at least one habit, Required needs an assigned required habit); building per cadence and type.
- `createHabitGroup`: saved last; today counted when members already complete it; habits keep their other groups; bad drafts and incompatible habits rejected.
- Marking a habit in two groups re-checks both.
- Picker sheet: toggling, greyed-out and locked rows, the Done count, Done applies and the backdrop discards.
- Group form: descriptions, Target per cadence, Streak Freeze, assigned chips, blue required chips, Required and Hours sections per type, Create disabled without habits or a required habit, every field submitted, Create Habit shown or hidden, a returning habit assigned, the pending habit locked with incompatible types disabled.
- New Habit form: "+ Create Group" passes the draft; a returning group is selected; the group row hidden when opened from the group form.
- Habits screen: creating a group from the + button; back to the Choice sheet; Create Habit from the group form; the habit and its new group created together from "+ Create Group"; a habit in two groups shows both names.
- Seed: Read Fiction in two groups.

## Acceptance criteria
- [ ] "New Habit Group" opens the group form, and back returns to the Choice sheet
- [ ] Groups can be created for every cadence and type, with the defaults and limits in decision 3
- [ ] The Assign and Required sheets work as on screens 12 and 14, applying on Done
- [ ] A habit can be in several groups, and list view shows all their names
- [ ] Create Habit on the group form returns with the new habit assigned
- [ ] "+ Create Group" on the habit form creates the habit and its new group together
