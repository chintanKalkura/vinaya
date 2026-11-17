# Bug: Today's date is fixed when the Habits screen first loads.

Status: ready for planning.

## Goal
Marks, hours, streaks and freezes always use the real current day, even if the app stays open or in the background across midnight.

## Problem
`todayKey` in `src/screens/HabitsScreen.tsx` is `useMemo(() => toDateKey(new Date()), [])`, and nothing listens to `AppState`. Android often keeps the app in memory overnight, so a mark made the next morning is written to the previous day. `applyStreakFreezes` also runs only on mount, so a freeze due today isn't applied until the app is killed and reopened.

## Scope
- Recompute today on app resume and at local midnight.
- Re-run the daily freeze pass when the day changes.

## Decisions
1. **A `useToday()` hook** returns the current date key. It updates when the app returns to the foreground (`AppState` → `active`) and at the next local midnight while the app is open (timer re-armed each day).
2. **Day change.** When the key changes, the screen runs `applyStreakFreezes(newKey)` and reloads habits and groups, through the storage write queue (`storage-write-safety.md`).
3. **Open sheets and forms** stay open across a day change; anything they save uses the new day.
4. **Hours modal.** If the day changes while the Hours modal is open, Done saves to the new day and the modal's starting value is not reused for it. Design decision required if a visible notice is wanted.
5. **Time zone or clock changes** are handled the same way: the key is recomputed on resume.

## Out of scope
- Editing past days

## Tests
- `useToday`: returns today; updates on `AppState` active after the date changed; updates at midnight with fake timers; cleans up its listener and timer.
- Habits screen: marked yesterday, advance to the next day and resume → the habit shows unmarked and a new tap marks the new day (write this failing test first).
- Freezes are applied for the new day on day change.

## Acceptance criteria
- [ ] Leaving the app open overnight and marking a habit in the morning records the morning's date
- [ ] Streaks and freezes update for the new day without restarting the app
