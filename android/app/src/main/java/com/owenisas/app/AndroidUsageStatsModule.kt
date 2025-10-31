package com.owenisas.app

import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.*
import java.util.*

class AndroidUsageStatsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "AndroidUsageStats"

  @ReactMethod
  fun openUsageAccessSettings(promise: Promise) {
    try {
      val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      reactApplicationContext.startActivity(intent)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("usage_error", e)
    }
  }

  @ReactMethod
  fun getTodayActiveSeconds(promise: Promise) {
    try {
      val usm = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
      val cal = Calendar.getInstance()
      cal.set(Calendar.HOUR_OF_DAY, 0)
      cal.set(Calendar.MINUTE, 0)
      cal.set(Calendar.SECOND, 0)
      cal.set(Calendar.MILLISECOND, 0)
      val start = cal.timeInMillis
      val end = System.currentTimeMillis()

      val stats: List<UsageStats> = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, start, end)

      var totalMs = 0L
      for (s in stats) {
        totalMs += s.totalTimeInForeground // ms; may be 0 on newer APIs for privacy
      }

      // Fallback via queryEvents for devices where totalTimeInForeground is unreliable
      if (totalMs <= 0L) {
        var acc = 0L
        val events = usm.queryEvents(start, end)
        val map = HashMap<String, Long>()
        val e = android.app.usage.UsageEvents.Event()
        while (events.hasNextEvent()) {
          events.getNextEvent(e)
          when (e.eventType) {
            android.app.usage.UsageEvents.Event.ACTIVITY_RESUMED -> map[e.packageName] = e.timeStamp
            android.app.usage.UsageEvents.Event.ACTIVITY_PAUSED -> {
              val t0 = map.remove(e.packageName)
              if (t0 != null && e.timeStamp >= t0) acc += (e.timeStamp - t0)
            }
          }
        }
        totalMs = acc
      }

      promise.resolve((totalMs / 1000).toInt())
    } catch (e: Exception) {
      promise.reject("usage_error", e)
    }
  }
}