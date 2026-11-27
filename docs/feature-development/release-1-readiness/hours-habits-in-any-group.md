# Feature: Hours habits can join Required, Any and All groups.

Status: done (26 Nov 2026).

## Goal
An Hours habit can be part of a Checkmark-style group and counts as done when its daily target hours are met.

## Scope (from Testing Observations, confirmed 16 Nov 2026)
- Hours type habits can be added to groups of other types. An Hours habit is complete when its target is met.
- An Hours group can only have Hours habits. The reverse doesn't apply: other group types can have both.
- Inside a Required/Any/All group, the Hours habit shows with its progress bar, and tapping the bar opens the Hours modal.

## Decisions
1. **Who can join what.**
   - Required, Any, All groups: Checkmark and Hours habits.
   - Hours groups: Hours habits only (unchanged).
   - `canJoinGroup` / `canTakeHabit` change accordingly; the Habit Group row on New Habit and the Assign sheet grey out only Checkmark habits for Hours groups.
2. **Done for the group.** An Hours habit counts as done today when hours logged today ≥ its `targetHours`. This is the same rule that makes it complete on its own banner.
3. **Required groups.** Hours habits can be marked required.
4. **Group view.** In a Required/Any/All card, Hours habits show as the Hours pill (name, streak, progress bar with `{hours}/{target}h`), the same row used inside Hours groups. Checkmark pills are unchanged. When both kinds share a card, the Checkmark pills wrap first, then the Hours habits follow in the 2-column grid used by Hours groups (owner's choice, 26 Nov 2026). A required Hours habit gets the same blue border as a required Checkmark pill.
5. **Tapping.** The progress bar opens the Hours modal; the rest of the cell opens the habit's page (`habit-group-detail-page.md`).
6. **Existing data.** No migration: current groups are unaffected.
   - Editing an Hours habit's daily target re-checks every group it is in, since the target decides whether it counts as done today.
7. **Edit.** Assigning or unassigning an Hours habit in Edit Habit Group follows the same rules.
8. **Week/Month/Year groups** count complete days the same way; member habits' cadences still don't affect the group.

## Out of scope
- Checkmark habits in Hours groups

## Tests
- `canJoinGroup` / `canTakeHabit`: Hours habit allowed in Required/Any/All; Checkmark refused in Hours.
- `isGroupComplete`: Any group complete with only an Hours member at target; not complete below target; All group with one Checkmark marked and one Hours below target is not complete; Required with an Hours required habit.
- Logging hours re-checks the Required/Any/All groups the habit is in.
- Group card renders an Hours pill with its bar inside an Any group; tapping the bar opens the modal.
- Assign sheet greys out Checkmark habits only for Hours groups.

## Acceptance criteria
- [x] An Hours habit can be assigned to a Required, Any or All group from both forms
- [x] The group completes when the Hours habit reaches its daily target, by the group's type rule
- [x] Hours groups still accept only Hours habits
