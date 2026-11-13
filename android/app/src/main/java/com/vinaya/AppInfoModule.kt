package com.vinaya

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AppInfoModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "AppInfo"

    // Changes on every fresh install and every update of the APK
    @ReactMethod
    fun getLastUpdateTime(promise: Promise) {
        try {
            val info = reactContext.packageManager.getPackageInfo(reactContext.packageName, 0)
            promise.resolve(info.lastUpdateTime.toDouble())
        } catch (e: Exception) {
            promise.reject("APP_INFO_ERROR", e)
        }
    }
}
