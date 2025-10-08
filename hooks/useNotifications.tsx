import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const useNotifications = () => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [isDailySummaryEnabled, setIsDailySummaryEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus>(Notifications.PermissionStatus.UNDETERMINED);

  useEffect(() => {
    loadNotificationSettings();
    checkPermissions();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const notifications = await AsyncStorage.getItem('notifications');
      const dailySummary = await AsyncStorage.getItem('daily_summary');

      if (notifications !== null) {
        setIsNotificationsEnabled(JSON.parse(notifications));
      }
      if (dailySummary !== null) {
        setIsDailySummaryEnabled(JSON.parse(dailySummary));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };

  const scheduleDailySummaryNotification = async () => {
    if (!isDailySummaryEnabled || permissionStatus !== 'granted') {
      return;
    }

    try {
      // Cancel existing daily summary notifications
      await Notifications.cancelScheduledNotificationAsync('daily-summary');

      // Schedule new daily summary at 8 PM
      await Notifications.scheduleNotificationAsync({
        identifier: 'daily-summary',
        content: {
          title: '📊 Daily Digital Wellness Summary',
          body: 'Check your screen time and focus progress from today!',
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: 20,
          minute: 0,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Error scheduling daily summary notification:', error);
    }
  };

  const scheduleFocusReminderNotification = async (minutes: number = 25) => {
    if (!isNotificationsEnabled || permissionStatus !== 'granted') {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 Focus Session Complete!',
          body: `Great job! You've completed a ${minutes}-minute focus session.`,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: minutes * 60,
        },
      });
    } catch (error) {
      console.error('Error scheduling focus reminder notification:', error);
    }
  };

  const scheduleAchievementNotification = async (achievementTitle: string) => {
    if (!isNotificationsEnabled || permissionStatus !== 'granted') {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏆 Achievement Unlocked!',
          body: `Congratulations! You've earned: ${achievementTitle}`,
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error showing achievement notification:', error);
    }
  };

  const scheduleScreenTimeWarningNotification = async (currentScreenTime: number) => {
    if (!isNotificationsEnabled || permissionStatus !== 'granted') {
      return;
    }

    try {
      // Warn when screen time exceeds 4 hours (240 minutes)
      if (currentScreenTime >= 240) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⚠️ Screen Time Alert',
            body: `You've been using your device for ${Math.round(currentScreenTime / 60 * 10) / 10} hours today. Consider taking a break!`,
            sound: 'default',
          },
          trigger: null, // Show immediately
        });
      }
    } catch (error) {
      console.error('Error showing screen time warning notification:', error);
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  };

  const updateNotificationSettings = async (notifications: boolean, dailySummary: boolean) => {
    setIsNotificationsEnabled(notifications);
    setIsDailySummaryEnabled(dailySummary);

    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
      await AsyncStorage.setItem('daily_summary', JSON.stringify(dailySummary));

      if (notifications && permissionStatus !== 'granted') {
        const granted = await requestPermissions();
        if (granted) {
          await scheduleDailySummaryNotification();
        }
      } else if (notifications && permissionStatus === 'granted') {
        await scheduleDailySummaryNotification();
      } else {
        await cancelAllNotifications();
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  return {
    isNotificationsEnabled,
    isDailySummaryEnabled,
    permissionStatus,
    requestPermissions,
    scheduleDailySummaryNotification,
    scheduleFocusReminderNotification,
    scheduleAchievementNotification,
    scheduleScreenTimeWarningNotification,
    cancelAllNotifications,
    updateNotificationSettings,
  };
};