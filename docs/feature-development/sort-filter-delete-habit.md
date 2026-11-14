# Feature: Habit and groups should be deletable and sortable.

Status: ready for planning.

## Goal
user should be able to delete and sort habits and groups.

## Screens
- ![03 - Sort & Filter Sheet.png](../screens/03%20-%20Sort%20%26%20Filter%20Sheet.png)

## Scope
- Add a modal to open delete options on a habit and group.
- Habits can be deleted only from list view and groups only from group view.
- Add a three dot menu button on top right to open the delete options - design decision required.
- This applies only to banners and not pills.
- Delete habit removes the habit and all assignments.
- Delete group removes the group only, keeps the habits assigned to it intact.
- Sort is applied with options as shown in the screen.
- Leave paused and archived as unclickable options, as they have not been implemented yet.
- Manual can be removed as an option.
- Recent sorts based on descending order of creation date time, with newly created ones appearing on top.
- Active optoin is always highlighted and cannot be disabled as all habits and groups currently are active state.
- rename marked to completed. Shows only today's completed habits and groups.

## Decisions
1. **Sort options.** Streak, A–Z and Recent. Manual is removed.
   - **Default:** oldest first, by creation time. No chip is selected; tapping the selected chip again returns to the default.
   - **Streak:** highest streak first.
   - **A–Z:** by name, ignoring case.
   - **Recent:** newest first.
   - Ties keep the default order (creation time, then `sortOrder`).
2. **What sort orders.** List view sorts habits. Group view sorts the group cards; the habits inside a card keep their order. The cadence filter applies first, then Show, then Sort.
3. **Show.**
   - "Marked" is renamed **Completed**. When on, only habits or groups complete today by `docs/style-choices/coloring-rules.md` are shown, so a Week/Month/Year item counts while its window meets the target.
   - **Active** is always selected and can't be turned off.
   - **Paused** and **Archived** are greyed out and can't be tapped.
   - Completed is off by default.
4. **Sheet.** Choices apply on Apply; the backdrop or back discards them. They last for the session and aren't stored.
5. **Delete menu.** A ⋮ right of the streak number on banners only: habit rows in list view, group cards in group view. It opens a menu ("Delete habit" or "Delete group", Cancel), then a confirm step ("Are you sure? This can't be undone.", Cancel, Delete). See `docs/style-choices/banner-menu.md`. Later changed to a dropdown below the ⋮ with Edit (disabled until editing is built) and Delete; the confirm step is unchanged.
6. **Deleting a habit** removes it and every assignment: its id leaves each group's `habitIds` and `requiredHabitIds`, and those groups are re-checked for today. Groups left with no habits, or Required groups left with no required habits, stay as they are and can't complete until habits are added.
7. **Deleting a group** removes only the group; its habits are untouched.

## Out of scope
- Paused and Archived states
- Editing habits and groups
- Undoing a delete

## Tests
- Sort: the default oldest-first order with ties by `sortOrder`; Streak, A–Z (case-insensitive) and Recent.
- Show: Completed keeps complete items, including a Week habit complete but not marked today; only active items are shown.
- Sheet: no chip selected by default; picking and re-tapping a chip; Completed toggles; Active locked; Paused and Archived disabled; Apply returns the choices; the backdrop discards.
- Delete habit: removed from every group's habits and required list; groups re-checked (an All group completes when an unmarked member is deleted); empty groups kept.
- Delete group: only the group is removed.
- Menu: menu, then confirm, then delete; Cancel at either step does nothing; ⋮ on banners only, never on pills or Hours cells.
- Habits screen: the sort button opens the sheet; Recent and A–Z reorder the list; Completed in both views; deleting a habit removes its row and its pill in group view; deleting a group keeps its habits.

## Acceptance criteria
- [ ] The sort button opens the Sort & Filter sheet with Streak, A–Z and Recent, and Completed, Active, Paused and Archived
- [ ] The default order is oldest first, and each sort orders the list and the group cards
- [ ] Completed shows only items complete today, in both views
- [ ] Habits can be deleted from list view and groups from group view, through the menu and the confirm step
- [ ] Deleting a habit removes it from every group; deleting a group keeps its habits
