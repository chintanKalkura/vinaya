# Feature: Habit group streak from log

Status: ready for planning.

## Goal
A habit group's banner number is its streak, calculated from the group's own log, the same way a habit's streak is calculated from the habit's log. This replaces the static `streakPlaceholder` added in the group view spec.

## Scope
In scope:
- A habit group service that records whether a group is complete today in the group's `recentLog` and `history`
- Calculating the group streak from `recentLog` with the existing streak calculation
- Syncing the group log whenever a habit in the group is marked or unmarked
- Showing the streak as the banner number on screen 01 (group view)
- Fixing habit `history` so unmark updates it too (see Rules 11 and 12)

Out of scope:
- Hours-type groups (not yet implemented)
- Week, Month and Year cadence groups
- Streak freeze
- Rebuilding past days of a group's log when habits change (assigning, removing or changing required habits)

## Rules
1. A group has one state per calendar day: complete or not complete. Days run local midnight to local midnight.
2. Completion uses the group-view rule: Required = every required habit is marked today; Any = at least one habit is marked today; All = every habit is marked today. A group with no habits, or a Required group with no required habits, is not complete.
3. When a habit in a group is marked or unmarked, the group's completion for today is re-evaluated and its log is synced.
4. If the group is complete today and has no entry for today, a marker entry `{date, kind: 'marker', value: 1}` is added to the front of the group's `recentLog` (capped at the same limit as habits) and appended to `history`.
5. If the group is not complete today, today's entry is removed from both `recentLog` and `history`.
6. If the group is complete and already has today's entry, nothing is written (no duplicates).
7. Only today's entry is ever added or removed. Past days are never changed.
8. The group streak is `calculateStreak(group.recentLog, todayKey)`: consecutive complete days ending today, or ending yesterday if today is not complete. It is never stored.
9. The banner number shows the group streak. It is orange on an orange banner and grey on a grey banner (unchanged from the group view spec).
10. Hours-type groups are never synced.
11. Unmarking a habit removes today's entry from both its `recentLog` and its `history`, so `history` mirrors the real marks.
12. Marking, unmarking and marking again leaves exactly one entry for today in `history`.
13. Group logs persist across app restarts and work offline.

## Fixtures
8 Precepts has a 12-day group log ending today (streak 12). Eat Healthy has an empty group log (streak 0). `streakPlaceholder` is removed from the `HabitGroup` type.

## Acceptance criteria
- [ ] Banner numbers on screen 01 are calculated from the group log (12 for 8 Precepts, 0 for Eat Healthy)
- [ ] Marking the last required habit of a group makes the group complete and today's group entry exists
- [ ] Unmarking a required habit removes today's group entry and the number drops back
- [ ] Marking an Any group's first habit adds the group entry; unmarking it removes it
- [ ] Mark, unmark, mark leaves one entry for today in both the habit's and the group's `history`
- [ ] Unmarking a habit removes today's entry from the habit's `recentLog` and `history`
- [ ] After restarting the app, group logs and streaks are unchanged
- [ ] `streakPlaceholder` no longer exists

## Open questions
None.
