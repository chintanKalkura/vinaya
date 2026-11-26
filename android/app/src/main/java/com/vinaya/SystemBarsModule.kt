package com.vinaya

import androidx.core.view.WindowCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil

class SystemBarsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "SystemBars"

    // Dark navigation bar icons on the light theme, light icons on dark.
    // The app draws behind the bar (edge to edge), so only the icons change.
    @ReactMethod
    fun setLightNavigationBar(light: Boolean) {
        val activity = reactApplicationContext.currentActivity ?: return
        UiThreadUtil.runOnUiThread {
            val window = activity.window
            WindowCompat.getInsetsController(window, window.decorView)
                .isAppearanceLightNavigationBars = light
        }
    }
}
