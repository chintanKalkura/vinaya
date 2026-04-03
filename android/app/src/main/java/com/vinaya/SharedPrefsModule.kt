package com.vinaya

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SharedPrefsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "SharedPrefs"

    private fun prefs() =
        reactContext.getSharedPreferences("com.vinaya.prefs", android.content.Context.MODE_PRIVATE)

    @ReactMethod
    fun setString(key: String, value: String) {
        prefs().edit().putString(key, value).apply()
        CountdownWidget.forceUpdate(reactContext)
    }

    @ReactMethod
    fun setInt(key: String, value: Int) {
        prefs().edit().putInt(key, value).apply()
        CountdownWidget.forceUpdate(reactContext)
    }
}
