import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '@/hooks/LanguageContext';

interface ScreenTimeData {
  date: string;
  screenTime: number; // in minutes
  sessions: number;
  lastUpdated: string;
}

interface DailyScreenTime {
  [date: string]: ScreenTimeData;
}

export const useScreenTimeTracking = () => {
  const { t } = useLanguage();
  const [isTracking, setIsTracking] = useState(false);
  const [todayScreenTime, setTodayScreenTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [screenTimeData, setScreenTimeData] = useState<DailyScreenTime>({});
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    loadScreenTimeData();
    const unsubscribe = setupAppStateListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isTracking && sessionStartTime) {
      intervalRef.current = setInterval(() => {
        updateScreenTime();
      }, 60000); // Update every minute
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking, sessionStartTime]);

  const loadScreenTimeData = async () => {
    try {
      const saved = await AsyncStorage.getItem('screenTimeData');
      if (saved) {
        const data = JSON.parse(saved);
        setScreenTimeData(data);

        // Get today's data
        const today = new Date().toISOString().split('T')[0];
        if (data[today]) {
          setTodayScreenTime(data[today].screenTime);
        }
      }
    } catch (error) {
      console.error('Error loading screen time data:', error);
    }
  };

  const saveScreenTimeData = async (data: DailyScreenTime) => {
    try {
      await AsyncStorage.setItem('screenTimeData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving screen time data:', error);
    }
  };

  const setupAppStateListener = () => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const today = new Date().toISOString().split('T')[0];

      if (nextAppState === 'active') {
        // App came to foreground
        setSessionStartTime(Date.now());
        setIsTracking(true);
      } else if (nextAppState === 'background' && sessionStartTime) {
        // App went to background
        const sessionDuration = (Date.now() - sessionStartTime) / (1000 * 60); // in minutes

        setScreenTimeData(prev => {
          const newData = { ...prev };
          if (!newData[today]) {
            newData[today] = {
              date: today,
              screenTime: 0,
              sessions: 0,
              lastUpdated: new Date().toISOString(),
            };
          }

          newData[today].screenTime += sessionDuration;
          newData[today].sessions += 1;
          newData[today].lastUpdated = new Date().toISOString();

          saveScreenTimeData(newData);
          return newData;
        });

        setSessionStartTime(null);
        setIsTracking(false);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  };

  const updateScreenTime = () => {
    if (sessionStartTime) {
      const currentSessionTime = (Date.now() - sessionStartTime) / (1000 * 60); // in minutes
      setTodayScreenTime(prev => prev + (currentSessionTime / 60)); // Add per minute update
    }
  };

  const getWeeklyScreenTime = () => {
    const today = new Date();
    const weekData: { day: string; screenTime: number; focusTime: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      // Get localized day name
      const dayName = date.toLocaleDateString('en', { weekday: 'short' });
      let translatedDay = dayName;

      // Map English day names to translation keys
      switch (dayName.toLowerCase()) {
        case 'mon':
          translatedDay = t('monday');
          break;
        case 'tue':
          translatedDay = t('tuesday');
          break;
        case 'wed':
          translatedDay = t('wednesday');
          break;
        case 'thu':
          translatedDay = t('thursday');
          break;
        case 'fri':
          translatedDay = t('friday');
          break;
        case 'sat':
          translatedDay = t('saturday');
          break;
        case 'sun':
          translatedDay = t('sunday');
          break;
        default:
          translatedDay = dayName;
      }

      const screenTime = screenTimeData[dateString]?.screenTime || 0;

      weekData.push({
        day: translatedDay,
        screenTime: Math.round(screenTime * 10) / 10, // Round to 1 decimal
        focusTime: Math.round((screenTime * 0.3) * 10) / 10, // Estimate focus time as 30% of screen time
      });
    }

    return weekData;
  };

  const getAverageDailyScreenTime = () => {
    const dates = Object.keys(screenTimeData);
    if (dates.length === 0) return 0;

    const totalScreenTime = dates.reduce((total, date) => {
      return total + (screenTimeData[date].screenTime || 0);
    }, 0);

    return Math.round((totalScreenTime / dates.length) * 10) / 10;
  };

  const resetTodayScreenTime = async () => {
    const today = new Date().toISOString().split('T')[0];

    setScreenTimeData(prev => {
      const newData = { ...prev };
      if (newData[today]) {
        newData[today].screenTime = 0;
        newData[today].sessions = 0;
        newData[today].lastUpdated = new Date().toISOString();
      }

      saveScreenTimeData(newData);
      return newData;
    });

    setTodayScreenTime(0);
  };

  return {
    todayScreenTime: Math.round(todayScreenTime * 10) / 10,
    isTracking,
    weeklyData: getWeeklyScreenTime(),
    averageDailyScreenTime: getAverageDailyScreenTime(),
    resetTodayScreenTime,
    screenTimeData,
  };
};