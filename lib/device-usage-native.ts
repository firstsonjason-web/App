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
        "Screen Time tracking requires iOS 16+ and special permissions from Apple. " +
        "Please ensure you're running iOS 16 or newer.",
        [{ text: "OK" }]
      );
      throw new Error("ScreenTimeUsage module not available");
    }
  } else if (Platform.OS === "android") {
    const { UsageStatsModule } = NativeModules;
    if (UsageStatsModule) {
      try {
        const hasPermission = await UsageStatsModule.hasPermissions();
        if (!hasPermission) {
          Alert.alert(
            "Usage Access Required",
            "This app needs Usage Access permission to track your screen time. You'll be redirected to Settings to grant this permission.",
            [
              {
                text: "OK",
                onPress: async () => {
                  await UsageStatsModule.requestPermissions();
                }
              }
            ]
          );
        }
        return true;
      } catch (error) {
        console.log("Error requesting Android permissions:", error);
        throw error;
      }
    } else {
      throw new Error("UsageStatsModule not available");
    }
  }
}