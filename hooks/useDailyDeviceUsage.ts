import { useEffect, useState } from "react";
import { NativeModules, Platform } from "react-native";
import { ensurePermissions } from "@/lib/device-usage-native";

function secondsSinceLocalMidnight() {
  const now = new Date();
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
}

export function useDailyDeviceUsage() {
  const [onSeconds, setOnSeconds] = useState(0);
  const [offSeconds, setOffSeconds] = useState(0);
  const [permissionsRequested, setPermissionsRequested] = useState(false);
  const [moduleAvailable, setModuleAvailable] = useState(true);

  async function refresh() {
    try {
      let active = 0;
      let hasData = false;
      if (Platform.OS === "ios") {
        const { ScreenTimeUsage } = NativeModules;
        if (ScreenTimeUsage) {
          active = await ScreenTimeUsage.getTodayActiveSeconds();
          hasData = active > 0;
        } else {
          setModuleAvailable(false);
        }
      } else if (Platform.OS === "android") {
        const { UsageStatsModule } = NativeModules;
        if (UsageStatsModule) {
          const result = await UsageStatsModule.getTodayUsageStats();
          active = result.totalScreenTimeSeconds || 0;
          hasData = active > 0;
        } else {
          setModuleAvailable(false);
        }
      }
      // Only calculate off-screen time if we have actual screen time data
      const off = hasData ? Math.max(0, secondsSinceLocalMidnight() - Math.floor(active)) : 0;
      setOnSeconds(Math.floor(active));
      setOffSeconds(off);
    } catch (e) {
      // Silently handle errors - native modules may not be available
      console.log("Error getting device usage data:", e);
      setOnSeconds(0);
      setOffSeconds(0);
    }
  }

  async function requestPermissions() {
    try {
      await ensurePermissions();
      setPermissionsRequested(true);
    } catch (error) {
      console.log("Error requesting permissions:", error);
      // Even if we get an error, we still want to show that the user tried
      setPermissionsRequested(true);
      throw error;
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 60 * 1000); // update every minute
    return () => clearInterval(id);
  }, []);

  return { onSeconds, offSeconds, refresh, requestPermissions, permissionsRequested, moduleAvailable };
}
