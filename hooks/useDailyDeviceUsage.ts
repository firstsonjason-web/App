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
      if (Platform.OS === "ios") {
        const { ScreenTimeUsage } = NativeModules;
        if (ScreenTimeUsage) {
          active = await ScreenTimeUsage.getTodayActiveSeconds();
        } else {
          setModuleAvailable(false);
        }
      } else if (Platform.OS === "android") {
        const { AndroidUsageStats } = NativeModules;
        if (AndroidUsageStats) {
          active = await AndroidUsageStats.getTodayActiveSeconds();
        } else {
          setModuleAvailable(false);
        }
      }
      const off = Math.max(0, secondsSinceLocalMidnight() - Math.floor(active));
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
