package com.vinaya

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import java.time.LocalDate
import java.time.temporal.ChronoUnit

class CountdownWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        for (id in appWidgetIds) {
            pushUpdate(context, appWidgetManager, id)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        when (intent.action) {
            Intent.ACTION_DATE_CHANGED,
            Intent.ACTION_BOOT_COMPLETED -> forceUpdate(context)
        }
    }

    companion object {
        fun forceUpdate(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(
                ComponentName(context, CountdownWidget::class.java),
            )
            for (id in ids) {
                pushUpdate(context, manager, id)
            }
        }

        fun pushUpdate(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int,
        ) {
            val prefs = context.getSharedPreferences("com.vinaya.prefs", Context.MODE_PRIVATE)
            val startDateStr = prefs.getString("start_date", null)
            val totalDays = prefs.getInt("total_days", -1)

            val views = RemoteViews(context.packageName, R.layout.widget_countdown)
            views.setTextViewText(R.id.text_main, "Grind. No Quarter.")

            val subText: String = if (startDateStr == null || totalDays < 1) {
                "Challenge not started."
            } else {
                val today = LocalDate.now()
                val startDate = LocalDate.parse(startDateStr)
                val eveDate = startDate.minusDays(1)
                val endDate = startDate.plusDays((totalDays - 1).toLong())

                when {
                    !today.isAfter(eveDate) -> {
                        val daysUntil = ChronoUnit.DAYS.between(today, startDate)
                        "starts in $daysUntil days."
                    }
                    !today.isAfter(endDate) -> {
                        val daysLeft = ChronoUnit.DAYS.between(today, endDate) + 1
                        "$daysLeft days to go."
                    }
                    else -> {
                        val daysAgo = ChronoUnit.DAYS.between(endDate, today)
                        "completed $daysAgo days ago."
                    }
                }
            }

            views.setTextViewText(R.id.text_sub, subText)

            // Tap widget to open app
            val launchIntent = context.packageManager
                .getLaunchIntentForPackage(context.packageName)
            if (launchIntent != null) {
                val pending = PendingIntent.getActivity(
                    context, 0, launchIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                )
                views.setOnClickPendingIntent(R.id.widget_image, pending)
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
