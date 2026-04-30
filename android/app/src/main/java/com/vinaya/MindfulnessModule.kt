package com.vinaya

import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class MindfulnessModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "MindfulnessScheduler"

    private fun receiver() = MindfulnessReceiver()
    private fun prefs() = MindfulnessReceiver.prefs(reactContext)

    /**
     * Called when a challenge becomes active. Stores the end date and test mode,
     * then arms the first alarm if none is already scheduled.
     */
    @ReactMethod
    fun init(startDate: String, endDate: String, testMode: Boolean) {
        prefs().edit()
            .putString(MindfulnessReceiver.KEY_CHALLENGE_START, startDate)
            .putString(MindfulnessReceiver.KEY_CHALLENGE_END, endDate)
            .putBoolean(MindfulnessReceiver.KEY_TEST_MODE, testMode)
            .apply()
        receiver().scheduleFirstAlarm(reactContext)
    }

    /**
     * Transitions the bell to a new state and applies the corresponding
     * scheduling effect (reschedule / cancel).
     */
    @ReactMethod
    fun setBellState(state: String) {
        prefs().edit().putString(MindfulnessReceiver.KEY_BELL_STATE, state).apply()
        when (state) {
            MindfulnessReceiver.STATE_ACTIVE       -> receiver().handleInAppSetActive(reactContext)
            MindfulnessReceiver.STATE_SNOOZED_NEXT -> receiver().handleInAppSnoozeNext(reactContext)
            MindfulnessReceiver.STATE_SNOOZED_DAY  -> receiver().handleInAppSnoozedDay(reactContext)
        }
    }

    @ReactMethod
    fun getBellState(callback: Callback) {
        val state = prefs().getString(
            MindfulnessReceiver.KEY_BELL_STATE,
            MindfulnessReceiver.STATE_ACTIVE,
        ) ?: MindfulnessReceiver.STATE_ACTIVE
        callback.invoke(state)
    }

    @ReactMethod
    fun getNextAlarmMs(callback: Callback) {
        val next = prefs().getLong(MindfulnessReceiver.KEY_NEXT_ALARM_MS, 0L)
        callback.invoke(next.toDouble())
    }
}
