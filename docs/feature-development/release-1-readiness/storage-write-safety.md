# Bug: Storage can lose habits on quick taps or a failed read.

Status: done.

## Goal
No mark, hours entry, edit or delete is ever lost or silently overwritten, and the user is told when a save fails.

## Problem
1. **Lost writes.** `src/storage/habitStorage.ts` saves by loading the whole collection, changing one item and writing it all back. Two saves running at once read the same old collection, and the later write drops the earlier change. Reproduced: `Promise.all([markHabitDone(a), markHabitDone(b)])` leaves only B marked. The screen shows both marked, so the loss only appears after relaunch.
2. **A failed read wipes data.** `loadHabits()` and `loadHabitGroups()` return `{}` on any error (`catch {}`). The next `saveHabit()` then writes a collection holding only one habit, erasing the rest.
3. **Silent failures.** Save errors are swallowed in storage, and service errors (`InvalidMarkError`, `InvalidHabitError`, `InvalidHabitGroupError`) are never caught in `HabitsScreen.tsx`, so they surface as unhandled promise rejections with no UI change.

## Scope
- Serialize every read-modify-write in the storage layer.
- Stop treating a failed read as an empty store.
- Show the user a message when a load or save fails.

## Decisions
1. **One write queue.** All storage writes, and the loads they depend on, run one at a time through a single promise queue in `habitStorage.ts`. Services keep their current API; the queue lives below them so every caller is covered. A whole service operation (e.g. `markHabitDone` → `saveAndSync` → group re-checks) runs as one queued unit, so a second tap waits for the first to finish.
2. **Read errors are errors.** A missing key still returns `{}`. A read that throws, or JSON that fails to parse, throws a `StorageReadError`. Nothing is written after a failed read in the same operation.
3. **Write errors are errors.** `saveHabits` / `saveHabitGroups` rethrow as `StorageWriteError` instead of swallowing.
4. **Screen state follows storage.** After any operation the screen reloads from storage (or uses the returned saved value), so what is shown is what was saved. If the operation fails, the screen keeps the previous state.
5. **Message.** A failed load shows a full-screen message ("Couldn't load your habits") with a Retry button, and the list is not shown, so nothing can be saved over unread data. A failed save shows a short non-blocking message ("Couldn't save. Try again.") and the item stays as it was. Wording and look: `../../style-choices/habits-section/storage-error-messages.md`. Inside an open create or edit form, the save message shows at the form's bottom edge and the form stays open.
6. **Corrupt data is kept.** When parsing fails, the raw stored string is copied to a separate key (`habits_v2_corrupt_<timestamp>`) before anything else happens, so it can be recovered later.

## Out of scope
- Moving to SQLite or per-habit keys
- Backup and restore (see `google-drive-backup.md`)

## Tests
- Two concurrent `markHabitDone` calls on different habits: both marks saved (write this failing test first).
- Concurrent mark and hours entry on habits in the same group: both saved, group re-checked once per change.
- `loadHabits` throws `StorageReadError` on a getItem error and on invalid JSON; returns `{}` for a missing key.
- After a failed read, `createHabit` throws and no write happens.
- Corrupt JSON is copied to the backup key before the error is thrown.
- `saveHabits` rethrows a setItem error.
- Habits screen: a failed load shows the message and Retry; Retry reloads. A failed mark shows the save message and the row keeps its old state.

## Acceptance criteria
- [ ] Tapping several habits as fast as possible, then relaunching, shows every tap saved
- [ ] A storage read failure never results in data being overwritten
- [ ] Every failed load or save shows the user a message
- [ ] No unhandled promise rejections from the Habits screen
