# Feature: Hours habits can join Required, Any and All groups.

Status: ready for planning.

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
4. **Group view.** In a Required/Any/All card, Hours habits show as the Hours pill (name, streak, progress bar with `{hours}/{target}h`), the same row used inside Hours groups. Checkmark pills are unchanged. Layout when both kinds share a card (one per row or mixed): design decision required.
5. **Tapping.** The progress bar opens the Hours modal; per `usability-fixes.md` the rest of the pill does nothing until the detail page exists.
6. **Existing data.** No migration: current groups are unaffected.
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
- [ ] An Hours habit can be assigned to a Required, Any or All group from both forms
- [ ] The group completes when the Hours habit reaches its daily target, by the group's type rule
- [ ] Hours groups still accept only Hours habits
