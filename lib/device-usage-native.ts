import { NativeModules, Platform, Alert } from "react-native";

export async function ensurePermissions() {
  if (Platform.OS === "ios") {
    const { ScreenTimeUsage } = NativeModules;
    if (ScreenTimeUsage) {
      try {
        await ScreenTimeUsage.requestAuthorization();
        // Show picker so user can include All Apps & Categories (or desired categories)
        await ScreenTimeUsage.presentPicker();
        await ScreenTimeUsage.startDailyMonitor();
        return true;
      } catch (error) {
        console.log("Error requesting iOS permissions:", error);
        throw error;
      }
    } else {
      // Show alert to user explaining that Screen Time tracking is not available
      Alert.alert(
        "Screen Time Tracking Unavailable",
        "Screen Time tracking requires special permissions from Apple that this app doesn't have. " +
        "The feature works on Android devices. For iOS, you can manually track your usage or use " +
        "built-in Screen Time features in Settings > Screen Time.",
        [{ text: "OK" }]
      );
      throw new Error("ScreenTimeUsage module not available");
    }
  } else {
    const { AndroidUsageStats } = NativeModules;
    if (AndroidUsageStats) {
      try {
        AndroidUsageStats.openUsageAccessSettings();
        return true;
      } catch (error) {
        console.log("Error opening Android usage settings:", error);
        throw error;
      }
    } else {
      throw new Error("AndroidUsageStats module not available");
    }
  }
}