# Notifications

## Daily reminders (`src/notifications/reminders.ts`)
- Library: `@notifee/react-native`
- Channel: `vinaya_reminders_v2` (previous channel `vinaya_reminders` is deleted on init)
- Sound: `zen_bell`, icon: `ic_notification`, colour: `#1E88E5`

## Mindfulness Bell (`src/notifications/mindfulnessBell.ts` + native)
Recurring bell at fixed clock times every day: **8AM, 10AM, 12PM, 2PM, 4PM, 6PM, 8PM, 10PM**.

- Implemented as a single-alarm chain via `AlarmManager.setExactAndAllowWhileIdle` in `MindfulnessReceiver.kt`
- Next alarm is scheduled **at alarm fire time**, independent of user notification response
- JS wrapper exports: `initMindfulnessBell(startDate, endDate)`, `setBellState()`, `getBellState()`, `getNextAlarmMs()`
- Three states: `active`, `snoozed_next` (next bell pushed 2 slots), `snoozed_day` (all bells cancelled until midnight)
- Notification snooze ("Snooze · next bell"): cancels next alarm, reschedules 4h after the fired slot
- Midnight reset: state resets to `active`, 8AM alarm armed for the new day
- Boot recovery: re-arms stored alarm if future; finds next valid slot if missed
- First bell never fires before `startDate` — `initMindfulnessBell` enforces this

**⚠️ `MINDFULNESS_TEST_MODE` in `mindfulnessBell.ts`:**
- `false` = production (fixed clock times, 4h snooze)
- `true` = emulator testing (2-minute intervals, 4-minute snooze)
- **Must be `false` before shipping.** Check this at the start of any session that touches notifications.
