# Feature: Mark a habit as done

Status: ready for planning.

## Goal
A user can mark a habit as done from the Habits screen. A marked habit shows in the active colour (orange) with its current streak visible. Visual details follow the screens (see Visual reference).

## Scope
In scope:
- Marking and unmarking a Checkmark-type habit with Day cadence
- Showing marked state and current streak on screen 01 (group view) and screen 04 (list view)
- Persisting marks locally (AsyncStorage)

Out of scope (each gets its own spec):
- Hours-type habits and the Hours Entry Modal
- Week, Month and Year cadence
- Streak freeze
- Groups completing from their habits' marks
- Editing, pausing, archiving

## Visual reference
Which part of the habit is orange or grey, and how the streak is laid out, follows `../../screens` (screens 01 and 04). Where the screens and this spec disagree, ask; do not invent.

## Rules
1. A Day-cadence Checkmark habit has one state per calendar day: marked or not marked.
2. A day runs from local midnight to local midnight on the device.
3. Only today can be marked or unmarked. Past days cannot be changed.
4. Tapping an unmarked habit marks it for today.
5. Tapping a marked habit unmarks it for today.
6. Marks are stored in the habit's `recentLog`. Its shape is defined by the Habit type in the code; read it there.
7. The streak is calculated from `recentLog`. It is never stored as its own value.
8. The streak is the number of consecutive marked days ending today, or ending yesterday if today is not yet marked.
9. Today marked: the habit is shown orange and the streak number (including today) is orange.
10. Today not marked, streak still active (yesterday was marked): the habit is shown grey and the streak number (up to yesterday) is shown orange.
11. Today not marked and yesterday not marked: the streak is broken (0) and shown as the screens show it (see Visual reference).
12. Marks persist across app restarts and work offline.
13. Screens 01 and 04 show the same state for the same habit.

## Streak test table
Today = D. "Marked" lists the days with a mark.

| Marked days | Today marked | Streak | Habit | Streak number |
|---|---|---|---|---|
| none | no | 0 | grey | broken |
| D | yes | 1 | orange | orange |
| D-1 | no | 1 | grey | orange |
| D, D-1, D-2 | yes | 3 | orange | orange |
| D-1, D-2 | no | 2 | grey | orange |
| D-2 | no | 0 | grey | broken |
| D, D-2 (D-1 missing) | yes | 1 | orange | orange |
| D-1, D-2, then D marked and unmarked | no | 2 | grey | orange |

## Acceptance criteria
- [ ] Tapping an unmarked Day habit on screen 01 marks it: habit turns orange, streak updates
- [ ] Tapping it again unmarks it and returns to the previous state
- [ ] Same on screen 04
- [ ] Marking on one screen is reflected on the other
- [ ] After restarting the app, marks and streaks are unchanged
- [ ] Every row of the streak test table passes
- [ ] Past days cannot be marked or unmarked
- [ ] No mark is written for a habit that is not Day-cadence Checkmark type
- [ ] The visuals match screens 01 and 04

## Open questions
None.