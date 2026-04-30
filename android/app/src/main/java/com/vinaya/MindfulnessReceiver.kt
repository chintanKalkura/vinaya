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
        showNotification(context)

        val prefs = prefs(context)
        val endDate = prefs.getString(KEY_CHALLENGE_END, null) ?: return
        val testMode = prefs.getBoolean(KEY_TEST_MODE, false)

        // Use the stored scheduled time as the "current" slot so drift doesn't compound
        val scheduledMs = prefs.getLong(KEY_NEXT_ALARM_MS, System.currentTimeMillis())
        val next = computeNextSlot(scheduledMs, endDate, testMode)
        persistAndSchedule(context, prefs, next, testMode)
    }

    // ── notification actions ───────────────────────────────────────────────

    private fun handleNotificationSnooze(context: Context) {
        dismissNotification(context)
        val prefs = prefs(context)
        val endDate = prefs.getString(KEY_CHALLENGE_END, null) ?: return
        val testMode = prefs.getBoolean(KEY_TEST_MODE, false)

        cancelAlarm(context)
        // Notification snooze: +4h (or +4min) from NOW
        val snoozeMs = if (testMode) TEST_SNOOZE_MS else SNOOZE_MS
        val target = System.currentTimeMillis() + snoozeMs
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
        val testMode = prefs.getBoolean(KEY_TEST_MODE, false)
        val bellState = prefs.getString(KEY_BELL_STATE, STATE_ACTIVE) ?: STATE_ACTIVE

        if (bellState == STATE_SNOOZED_DAY) return  // wait for midnight reset

        val storedNextMs = prefs.getLong(KEY_NEXT_ALARM_MS, 0L)
        val now = System.currentTimeMillis()
        val next: Long? = when {
            storedNextMs > now -> storedNextMs          // still future, just re-arm
            else -> findNextSlotFromNow(endDate, testMode) // missed — resume chain
        }
        if (next != null) scheduleAlarm(context, next, testMode)
    }

    private fun handleDateChanged(context: Context) {
        val prefs = prefs(context)
        val endDate = prefs.getString(KEY_CHALLENGE_END, null) ?: return
        val testMode = prefs.getBoolean(KEY_TEST_MODE, false)

        // Midnight reset
        prefs.edit().putString(KEY_BELL_STATE, STATE_ACTIVE).apply()

        val today8am = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, START_HOUR)
            set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }.timeInMillis

        if (!isAfterChallengeEnd(today8am, endDate)) {
            persistAndSchedule(context, prefs, today8am, testMode)
        } else {
            prefs.edit().remove(KEY_NEXT_ALARM_MS).apply()
        }
    }

    // ── in-app controls (called by MindfulnessModule) ─────────────────────

    fun handleInAppSnoozeNext(context: Context) {
        val prefs = prefs(context)
        val endDate = prefs.getString(KEY_CHALLENGE_END, null) ?: return
        val testMode = prefs.getBoolean(KEY_TEST_MODE, false)

        val originalNextMs = prefs.getLong(KEY_NEXT_ALARM_MS, 0L)
        cancelAlarm(context)

        // In-app snooze: +interval from ORIGINAL scheduled time (not from now)
        val next = computeNextSlot(originalNextMs, endDate, testMode)
        persistAndSchedule(context, prefs, next, testMode)
    }

    fun handleInAppSnoozedDay(context: Context) {
        cancelAlarm(context)
        prefs(context).edit().remove(KEY_NEXT_ALARM_MS).apply()
    }

    fun scheduleFirstAlarm(context: Context) {
        val prefs = prefs(context)
        val endDate = prefs.getString(KEY_CHALLENGE_END, null) ?: return
        val testMode = prefs.getBoolean(KEY_TEST_MODE, false)

        // Don't overwrite a future alarm that is already armed
        if (prefs.getLong(KEY_NEXT_ALARM_MS, 0L) > System.currentTimeMillis()) return

        val next = findNextSlotFromNow(endDate, testMode) ?: return
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
        const val KEY_NEXT_ALARM_MS   = "mindfulness_next_alarm_ms"
        const val KEY_BELL_STATE      = "mindfulness_bell_state"
        const val KEY_CHALLENGE_END   = "mindfulness_challenge_end"
        const val KEY_TEST_MODE       = "mindfulness_test_mode"

        // Bell states
        const val STATE_ACTIVE       = "active"
        const val STATE_SNOOZED_NEXT = "snoozed_next"
        const val STATE_SNOOZED_DAY  = "snoozed_day"

        // Notification
        const val NOTIFICATION_ID = 2001
        private const val CHANNEL_ID = "vinaya_reminders_v2"

        // Schedule window (hours, 24h clock)
        const val START_HOUR      = 8
        const val END_HOUR        = 22
        const val INTERVAL_HOURS  = 2

        // Intervals in milliseconds
        const val INTERVAL_MS      = INTERVAL_HOURS * 60 * 60 * 1000L
        const val SNOOZE_MS        = 4L * 60 * 60 * 1000   // 4 hours
        const val TEST_INTERVAL_MS = 2L * 60 * 1000        // 2 minutes
        const val TEST_SNOOZE_MS   = 4L * 60 * 1000        // 4 minutes

        fun prefs(context: Context): SharedPreferences =
            context.getSharedPreferences("com.vinaya.prefs", Context.MODE_PRIVATE)

        // ── slot computation ──────────────────────────────────────────────

        /**
         * Returns the next alarm time after [fromMs], respecting the daily window
         * and challenge end date. Returns null if no further alarms should fire.
         */
        fun computeNextSlot(fromMs: Long, endDate: String, testMode: Boolean): Long? {
            if (testMode) {
                val next = fromMs + TEST_INTERVAL_MS
                return if (isAfterChallengeEnd(next, endDate)) null else next
            }
            val cal = Calendar.getInstance().apply { timeInMillis = fromMs }
            val nextHour = cal.get(Calendar.HOUR_OF_DAY) + INTERVAL_HOURS

            if (nextHour > END_HOUR) {
                cal.add(Calendar.DAY_OF_MONTH, 1)
                cal.set(Calendar.HOUR_OF_DAY, START_HOUR)
            } else {
                cal.set(Calendar.HOUR_OF_DAY, nextHour)
            }
            cal.set(Calendar.MINUTE, 0); cal.set(Calendar.SECOND, 0); cal.set(Calendar.MILLISECOND, 0)

            return if (isAfterChallengeEnd(cal.timeInMillis, endDate)) null else cal.timeInMillis
        }

        /**
         * Given a raw snooze target (now + snoozeOffset), clamp it to the window
         * or advance to 8AM next day if it overshoots END_HOUR.
         */
        fun constrainToWindow(targetMs: Long, endDate: String, testMode: Boolean): Long? {
            if (testMode) {
                return if (isAfterChallengeEnd(targetMs, endDate)) null else targetMs
            }
            val cal = Calendar.getInstance().apply { timeInMillis = targetMs }
            val totalMins = cal.get(Calendar.HOUR_OF_DAY) * 60 + cal.get(Calendar.MINUTE)

            if (totalMins > END_HOUR * 60) {
                cal.add(Calendar.DAY_OF_MONTH, 1)
                cal.set(Calendar.HOUR_OF_DAY, START_HOUR)
                cal.set(Calendar.MINUTE, 0); cal.set(Calendar.SECOND, 0); cal.set(Calendar.MILLISECOND, 0)
            }
            return if (isAfterChallengeEnd(cal.timeInMillis, endDate)) null else cal.timeInMillis
        }

        /**
         * Find the next valid slot from the current moment. Used for boot recovery
         * and cold-start scheduling.
         */
        fun findNextSlotFromNow(endDate: String, testMode: Boolean): Long? {
            if (testMode) {
                val next = System.currentTimeMillis() + TEST_INTERVAL_MS
                return if (isAfterChallengeEnd(next, endDate)) null else next
            }
            val now = System.currentTimeMillis()
            val cal = Calendar.getInstance().apply { timeInMillis = now }
            val hour = cal.get(Calendar.HOUR_OF_DAY)

            val targetCal = Calendar.getInstance().apply { timeInMillis = now }
            targetCal.set(Calendar.MINUTE, 0); targetCal.set(Calendar.SECOND, 0)
            targetCal.set(Calendar.MILLISECOND, 0)

            val nextHour = when {
                hour < START_HOUR -> START_HOUR
                hour >= END_HOUR  -> {
                    // After window — go to 8AM tomorrow
                    targetCal.add(Calendar.DAY_OF_MONTH, 1)
                    START_HOUR
                }
                else -> {
                    // During window — find the first slot strictly after current hour
                    var h = START_HOUR
                    while (h <= END_HOUR && h <= hour) h += INTERVAL_HOURS
                    if (h > END_HOUR) {
                        targetCal.add(Calendar.DAY_OF_MONTH, 1)
                        START_HOUR
                    } else h
                }
            }
            targetCal.set(Calendar.HOUR_OF_DAY, nextHour)
            return if (isAfterChallengeEnd(targetCal.timeInMillis, endDate)) null
            else targetCal.timeInMillis
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
