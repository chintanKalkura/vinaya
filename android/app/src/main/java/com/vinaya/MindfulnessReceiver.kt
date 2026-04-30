package com.vinaya

import android.app.AlarmManager
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.graphics.Color
import androidx.core.app.NotificationCompat
import java.util.Calendar

class MindfulnessReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            ACTION_ALARM  -> handleAlarmFire(context)
            ACTION_SNOOZE -> handleNotificationSnooze(context)
            ACTION_ALERT  -> dismissNotification(context)
            Intent.ACTION_BOOT_COMPLETED -> handleBoot(context)
            Intent.ACTION_DATE_CHANGED   -> handleDateChanged(context)
        }
    }

    // ── alarm chain ────────────────────────────────────────────────────────

    private fun handleAlarmFire(context: Context) {
        val prefs = prefs(context)
        val endDate = prefs.getString(KEY_CHALLENGE_END, null) ?: return
        val testMode = prefs.getBoolean(KEY_TEST_MODE, false)

        // The stored value is the exact scheduled slot that just fired
        val firedMs = prefs.getLong(KEY_NEXT_ALARM_MS, System.currentTimeMillis())

        // Persist fired time so notification snooze can reference it
        prefs.edit().putLong(KEY_LAST_FIRED_MS, firedMs).apply()

        // Schedule the next slot immediately — independent of user notification response
        val next = nextFixedSlot(firedMs, endDate, testMode)
        persistAndSchedule(context, prefs, next, testMode)

        showNotification(context)
    }

    // ── notification actions ───────────────────────────────────────────────

    private fun handleNotificationSnooze(context: Context) {
        dismissNotification(context)
        val prefs = prefs(context)
        val endDate = prefs.getString(KEY_CHALLENGE_END, null) ?: return
        val testMode = prefs.getBoolean(KEY_TEST_MODE, false)

        prefs.edit().putString(KEY_BELL_STATE, STATE_SNOOZED_NEXT).apply()

        // Cancel the already-scheduled next alarm
        cancelAlarm(context)

        // Reschedule 4h (or 4min in test mode) from the fired slot — not from now
        val firedMs = prefs.getLong(KEY_LAST_FIRED_MS, System.currentTimeMillis())
        val snoozeMs = if (testMode) TEST_SNOOZE_MS else SNOOZE_MS
        val target = firedMs + snoozeMs
        val next = constrainToWindow(target, endDate, testMode)
        persistAndSchedule(context, prefs, next, testMode)
    }

    private fun dismissNotification(context: Context) {
        (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
            .cancel(NOTIFICATION_ID)
    }

    // ── boot / day-change ──────────────────────────────────────────────────

    private fun handleBoot(context: Context) {
        val prefs = prefs(context)
        val endDate = prefs.getString(KEY_CHALLENGE_END, null) ?: return
        val startDate = prefs.getString(KEY_CHALLENGE_START, null)
        val testMode = prefs.getBoolean(KEY_TEST_MODE, false)
        val bellState = prefs.getString(KEY_BELL_STATE, STATE_ACTIVE) ?: STATE_ACTIVE

        if (bellState == STATE_SNOOZED_DAY) return

        val storedNextMs = prefs.getLong(KEY_NEXT_ALARM_MS, 0L)
        val now = System.currentTimeMillis()
        val next: Long? = when {
            storedNextMs > now -> storedNextMs
            else -> findNextSlotFromNow(startDate, endDate, testMode)
        }
        if (next != null) scheduleAlarm(context, next, testMode)
    }

    private fun handleDateChanged(context: Context) {
        val prefs = prefs(context)
        val endDate = prefs.getString(KEY_CHALLENGE_END, null) ?: return
        val testMode = prefs.getBoolean(KEY_TEST_MODE, false)

        prefs.edit().putString(KEY_BELL_STATE, STATE_ACTIVE).apply()

        val next: Long? = if (!testMode) {
            val today8am = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, SCHEDULE_HOURS[0])
                set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
            }.timeInMillis
            if (!isAfterChallengeEnd(today8am, endDate)) today8am else null
        } else {
            val startDate = prefs.getString(KEY_CHALLENGE_START, null)
            findNextSlotFromNow(startDate, endDate, testMode)
        }

        if (next != null) persistAndSchedule(context, prefs, next, testMode)
        else prefs.edit().remove(KEY_NEXT_ALARM_MS).apply()
    }

    // ── in-app controls (called by MindfulnessModule) ─────────────────────

    fun handleInAppSnoozeNext(context: Context) {
        val prefs = prefs(context)
        val endDate = prefs.getString(KEY_CHALLENGE_END, null) ?: return
        val testMode = prefs.getBoolean(KEY_TEST_MODE, false)

        val currentNextMs = prefs.getLong(KEY_NEXT_ALARM_MS, 0L)
        cancelAlarm(context)

        // Push to the slot after the currently-scheduled one
        val next = nextFixedSlot(currentNextMs, endDate, testMode)
        persistAndSchedule(context, prefs, next, testMode)
    }

    fun handleInAppSnoozedDay(context: Context) {
        cancelAlarm(context)
        prefs(context).edit().remove(KEY_NEXT_ALARM_MS).apply()
    }

    fun handleInAppSetActive(context: Context) {
        val prefs = prefs(context)
        val endDate = prefs.getString(KEY_CHALLENGE_END, null) ?: return
        val startDate = prefs.getString(KEY_CHALLENGE_START, null)
        val testMode = prefs.getBoolean(KEY_TEST_MODE, false)
        cancelAlarm(context)
        val next = findNextSlotFromNow(startDate, endDate, testMode) ?: return
        persistAndSchedule(context, prefs, next, testMode)
    }

    fun scheduleFirstAlarm(context: Context) {
        val prefs = prefs(context)
        val endDate = prefs.getString(KEY_CHALLENGE_END, null) ?: return
        val startDate = prefs.getString(KEY_CHALLENGE_START, null)
        val testMode = prefs.getBoolean(KEY_TEST_MODE, false)

        if (prefs.getLong(KEY_NEXT_ALARM_MS, 0L) > System.currentTimeMillis()) return

        val next = findNextSlotFromNow(startDate, endDate, testMode) ?: return
        persistAndSchedule(context, prefs, next, testMode)
    }

    // ── scheduling helpers ────────────────────────────────────────────────

    private fun persistAndSchedule(
        context: Context,
        prefs: SharedPreferences,
        next: Long?,
        testMode: Boolean,
    ) {
        if (next != null) {
            prefs.edit().putLong(KEY_NEXT_ALARM_MS, next).apply()
            scheduleAlarm(context, next, testMode)
        } else {
            prefs.edit().remove(KEY_NEXT_ALARM_MS).apply()
        }
    }

    companion object {
        // Intent actions
        const val ACTION_ALARM  = "com.vinaya.MINDFULNESS_ALARM"
        const val ACTION_SNOOZE = "com.vinaya.MINDFULNESS_SNOOZE"
        const val ACTION_ALERT  = "com.vinaya.MINDFULNESS_ALERT"

        // SharedPreferences keys
        const val KEY_NEXT_ALARM_MS    = "mindfulness_next_alarm_ms"
        const val KEY_LAST_FIRED_MS    = "mindfulness_last_fired_ms"
        const val KEY_BELL_STATE       = "mindfulness_bell_state"
        const val KEY_CHALLENGE_START  = "mindfulness_challenge_start"
        const val KEY_CHALLENGE_END    = "mindfulness_challenge_end"
        const val KEY_TEST_MODE        = "mindfulness_test_mode"

        // Bell states
        const val STATE_ACTIVE       = "active"
        const val STATE_SNOOZED_NEXT = "snoozed_next"
        const val STATE_SNOOZED_DAY  = "snoozed_day"

        // Notification
        const val NOTIFICATION_ID = 2001
        private const val CHANNEL_ID = "vinaya_reminders_v2"

        // Fixed daily schedule: every 2h from 8AM to 10PM
        val SCHEDULE_HOURS = intArrayOf(8, 10, 12, 14, 16, 18, 20, 22)

        // Intervals in milliseconds
        const val SNOOZE_MS        = 4L * 60 * 60 * 1000   // 4 hours
        const val TEST_INTERVAL_MS = 2L * 60 * 1000        // 2 minutes
        const val TEST_SNOOZE_MS   = 4L * 60 * 1000        // 4 minutes

        fun prefs(context: Context): SharedPreferences =
            context.getSharedPreferences("com.vinaya.prefs", Context.MODE_PRIVATE)

        // ── slot computation ──────────────────────────────────────────────

        /**
         * Returns the next fixed schedule slot strictly after [fromMs].
         * Scans SCHEDULE_HOURS on the same calendar day as fromMs, then wraps to
         * the first slot of the following day.
         * In test mode: fromMs + TEST_INTERVAL_MS (relative, for fast testing).
         */
        fun nextFixedSlot(fromMs: Long, endDate: String, testMode: Boolean): Long? {
            if (testMode) {
                val next = fromMs + TEST_INTERVAL_MS
                return if (isAfterChallengeEnd(next, endDate)) null else next
            }
            for (h in SCHEDULE_HOURS) {
                val slotCal = Calendar.getInstance().apply {
                    timeInMillis = fromMs
                    set(Calendar.HOUR_OF_DAY, h)
                    set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
                }
                if (slotCal.timeInMillis > fromMs) {
                    return if (isAfterChallengeEnd(slotCal.timeInMillis, endDate)) null
                    else slotCal.timeInMillis
                }
            }
            // All slots today are exhausted — first slot tomorrow
            val tomorrowFirst = Calendar.getInstance().apply {
                timeInMillis = fromMs
                add(Calendar.DAY_OF_MONTH, 1)
                set(Calendar.HOUR_OF_DAY, SCHEDULE_HOURS[0])
                set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
            }
            return if (isAfterChallengeEnd(tomorrowFirst.timeInMillis, endDate)) null
            else tomorrowFirst.timeInMillis
        }

        /**
         * Finds the first fixed schedule slot strictly after now, but never before
         * [startDate] 8AM. If the challenge hasn't started yet, returns [startDate] 8AM.
         * In test mode: now + TEST_INTERVAL_MS (no start-date guard needed for testing).
         */
        fun findNextSlotFromNow(startDate: String?, endDate: String, testMode: Boolean): Long? {
            if (testMode) {
                val next = System.currentTimeMillis() + TEST_INTERVAL_MS
                return if (isAfterChallengeEnd(next, endDate)) null else next
            }
            val now = System.currentTimeMillis()

            // Determine the earliest millisecond we can search from.
            // If now is before startDate 8AM, use (startDate 8AM - 1ms) so the loop
            // returns startDate 8AM as the first valid slot.
            val searchFrom: Long = if (startDate != null) {
                val parts = startDate.split("-")
                val start8am = Calendar.getInstance().apply {
                    set(parts[0].toInt(), parts[1].toInt() - 1, parts[2].toInt(),
                        SCHEDULE_HOURS[0], 0, 0)
                    set(Calendar.MILLISECOND, 0)
                }.timeInMillis
                if (now < start8am) start8am - 1 else now
            } else {
                now
            }

            for (h in SCHEDULE_HOURS) {
                val slotCal = Calendar.getInstance().apply {
                    timeInMillis = searchFrom
                    set(Calendar.HOUR_OF_DAY, h)
                    set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
                }
                if (slotCal.timeInMillis > searchFrom) {
                    return if (isAfterChallengeEnd(slotCal.timeInMillis, endDate)) null
                    else slotCal.timeInMillis
                }
            }
            // All slots on searchFrom's day are exhausted — first slot the next day
            val tomorrowFirst = Calendar.getInstance().apply {
                timeInMillis = searchFrom
                add(Calendar.DAY_OF_MONTH, 1)
                set(Calendar.HOUR_OF_DAY, SCHEDULE_HOURS[0])
                set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
            }
            return if (isAfterChallengeEnd(tomorrowFirst.timeInMillis, endDate)) null
            else tomorrowFirst.timeInMillis
        }

        /**
         * Given a snooze target (firedMs + 4h), finds the first fixed schedule slot
         * at or after that target on the same calendar day, or 8AM the following day
         * if no slot fits. This keeps snoozed alarms on the fixed schedule grid.
         * In test mode: just checks challenge end (no snapping needed).
         */
        fun constrainToWindow(targetMs: Long, endDate: String, testMode: Boolean): Long? {
            if (testMode) {
                return if (isAfterChallengeEnd(targetMs, endDate)) null else targetMs
            }
            for (h in SCHEDULE_HOURS) {
                val slotCal = Calendar.getInstance().apply {
                    timeInMillis = targetMs
                    set(Calendar.HOUR_OF_DAY, h)
                    set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
                }
                if (slotCal.timeInMillis >= targetMs) {
                    return if (isAfterChallengeEnd(slotCal.timeInMillis, endDate)) null
                    else slotCal.timeInMillis
                }
            }
            // Target is past last slot — first slot next day
            val tomorrow8am = Calendar.getInstance().apply {
                timeInMillis = targetMs
                add(Calendar.DAY_OF_MONTH, 1)
                set(Calendar.HOUR_OF_DAY, SCHEDULE_HOURS[0])
                set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
            }
            return if (isAfterChallengeEnd(tomorrow8am.timeInMillis, endDate)) null
            else tomorrow8am.timeInMillis
        }

        fun isAfterChallengeEnd(alarmMs: Long, endDate: String): Boolean {
            val parts = endDate.split("-")
            val endCal = Calendar.getInstance().apply {
                set(parts[0].toInt(), parts[1].toInt() - 1, parts[2].toInt(), 23, 59, 59)
                set(Calendar.MILLISECOND, 999)
            }
            return alarmMs > endCal.timeInMillis
        }

        // ── alarm manager ─────────────────────────────────────────────────

        fun scheduleAlarm(context: Context, alarmMs: Long, testMode: Boolean) {
            val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, alarmMs, alarmPendingIntent(context, testMode))
        }

        fun cancelAlarm(context: Context) {
            val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val pi = PendingIntent.getBroadcast(
                context, REQUEST_ALARM,
                Intent(context, MindfulnessReceiver::class.java).apply { action = ACTION_ALARM },
                PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE,
            ) ?: return
            am.cancel(pi)
        }

        private fun alarmPendingIntent(context: Context, testMode: Boolean): PendingIntent =
            PendingIntent.getBroadcast(
                context, REQUEST_ALARM,
                Intent(context, MindfulnessReceiver::class.java).apply {
                    action = ACTION_ALARM
                    putExtra(KEY_TEST_MODE, testMode)
                },
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )

        // ── notification ──────────────────────────────────────────────────

        fun showNotification(context: Context) {
            val alertPi = PendingIntent.getBroadcast(
                context, REQUEST_ALERT,
                Intent(context, MindfulnessReceiver::class.java).apply { action = ACTION_ALERT },
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
            val snoozePi = PendingIntent.getBroadcast(
                context, REQUEST_SNOOZE,
                Intent(context, MindfulnessReceiver::class.java).apply { action = ACTION_SNOOZE },
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )

            val notification = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setColor(Color.parseColor("#1E88E5"))
                .setContentTitle("Mindfulness Bell")
                .setContentText("Be Alert! Be Attentive! Be Aware!")
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .addAction(0, "Alert!", alertPi)
                .addAction(0, "Snooze · next bell", snoozePi)
                .build()

            (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
                .notify(NOTIFICATION_ID, notification)
        }

        private const val REQUEST_ALARM  = 200
        private const val REQUEST_ALERT  = 201
        private const val REQUEST_SNOOZE = 202
    }
}
