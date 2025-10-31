import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './useFirebaseAuth';
import { DatabaseService } from '@/lib/firebase-services';
import { useDailyDeviceUsage } from './useDailyDeviceUsage';
import { Timestamp } from 'firebase/firestore';

interface FocusSession {
  id: string;
  startTime: number;
  endTime?: number;
  duration: number; // in minutes
  category: string;
  isActive: boolean;
}

interface DailyStats {
  date: string;
  deviceScreenTime: number; // Total device screen time from OS (all apps) in hours
  appScreenTime: number; // Time spent in this app in hours
  focusTime: number; // Manual focus time in hours
  sessions: number;
  focusSessions: FocusSession[];
  lastUpdated: number;
}

export interface WeeklyData {
  day: string;
  deviceScreenTime: number; // Total device usage
  appScreenTime: number; // This app usage
  focusTime: number; // Focus sessions
  date: string;
}

export const useRealScreenTimeTracking = () => {
  const { user } = useAuth();
  const { 
    onSeconds, // Device-wide screen time in seconds from native module
    offSeconds,
    refresh: refreshDeviceUsage,
    requestPermissions,
    permissionsRequested,
    moduleAvailable 
  } = useDailyDeviceUsage();

  const [isTrackingApp, setIsTrackingApp] = useState(false);
  const [currentAppSession, setCurrentAppSession] = useState<{ startTime: number } | null>(null);
  const [activeFocusSession, setActiveFocusSession] = useState<FocusSession | null>(null);
  const [dailyStats, setDailyStats] = useState<{ [date: string]: DailyStats }>({});
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const appIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const focusIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    initializeTracking();
    const subscription = setupAppStateListener();

    return () => {
      subscription?.remove();
      stopAllTracking();
    };
  }, [user]);

  useEffect(() => {
    // Update app tracking interval
    if (isTrackingApp && currentAppSession) {
      appIntervalRef.current = setInterval(() => {
        updateAppSession();
      }, 30000); // 30 seconds
    } else {
      if (appIntervalRef.current) {
        clearInterval(appIntervalRef.current);
        appIntervalRef.current = null;
      }
    }

    return () => {
      if (appIntervalRef.current) {
        clearInterval(appIntervalRef.current);
      }
    };
  }, [isTrackingApp, currentAppSession]);

  useEffect(() => {
    // Update focus session interval
    if (activeFocusSession?.isActive) {
      focusIntervalRef.current = setInterval(() => {
        updateFocusSession();
      }, 30000);
    } else {
      if (focusIntervalRef.current) {
        clearInterval(focusIntervalRef.current);
        focusIntervalRef.current = null;
      }
    }

    return () => {
      if (focusIntervalRef.current) {
        clearInterval(focusIntervalRef.current);
      }
    };
  }, [activeFocusSession]);

  // Update device screen time from native module
  useEffect(() => {
    const today = getTodayDateString();
    const deviceScreenTimeHours = onSeconds / 3600; // Convert seconds to hours

    setDailyStats(prev => {
      const currentStats = prev[today] || getEmptyDailyStats(today);
      const updated = {
        ...prev,
        [today]: {
          ...currentStats,
          deviceScreenTime: deviceScreenTimeHours,
          lastUpdated: Date.now(),
        },
      };

      setTodayStats(updated[today]);
      AsyncStorage.setItem('dailyStats', JSON.stringify(updated)).catch(console.error);
      
      return updated;
    });
  }, [onSeconds]);

  const initializeTracking = async () => {
    try {
      const savedStats = await AsyncStorage.getItem('dailyStats');
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        setDailyStats(parsed);
        
        const today = getTodayDateString();
        if (parsed[today]) {
          setTodayStats(parsed[today]);
        } else {
          initializeTodayStats();
        }
      } else {
        initializeTodayStats();
      }

      if (user) {
        await syncWithFirebase();
      }

      startAppTracking();
      refreshDeviceUsage(); // Get latest device usage
    } catch (error) {
      console.error('Error initializing tracking:', error);
      initializeTodayStats();
    }
  };

  const getEmptyDailyStats = (date: string): DailyStats => ({
    date,
    deviceScreenTime: 0,
    appScreenTime: 0,
    focusTime: 0,
    sessions: 0,
    focusSessions: [],
    lastUpdated: Date.now(),
  });

  const initializeTodayStats = () => {
    const today = getTodayDateString();
    const newStats = getEmptyDailyStats(today);

    setTodayStats(newStats);
    setDailyStats(prev => ({
      ...prev,
      [today]: newStats,
    }));
  };

  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const setupAppStateListener = () => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        startAppTracking();
        refreshDeviceUsage(); // Refresh device usage when app becomes active
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        endAppSession();
        
        if (activeFocusSession?.isActive) {
          endFocusSession();
        }
      }
    };

    return AppState.addEventListener('change', handleAppStateChange);
  };

  const startAppTracking = () => {
    if (currentAppSession) return; // Already tracking

    const newSession = {
      startTime: Date.now(),
    };

    setCurrentAppSession(newSession);
    setIsTrackingApp(true);
  };

  const updateAppSession = () => {
    if (!currentAppSession) return;

    const duration = (Date.now() - currentAppSession.startTime) / (1000 * 60); // minutes
    updateTodayAppTime(duration / 60); // Convert to hours
  };

  const endAppSession = () => {
    if (!currentAppSession) return;

    const duration = (Date.now() - currentAppSession.startTime) / (1000 * 60 * 60); // hours

    updateTodayStats({ appScreenTime: duration });
    setCurrentAppSession(null);
    setIsTrackingApp(false);
  };

  const startFocusSession = (category: string = 'general') => {
    if (activeFocusSession?.isActive) return;

    const newFocusSession: FocusSession = {
      id: `focus_${Date.now()}`,
      startTime: Date.now(),
      duration: 0,
      category,
      isActive: true,
    };

    setActiveFocusSession(newFocusSession);
  };

  const updateFocusSession = () => {
    if (!activeFocusSession?.isActive) return;

    const duration = (Date.now() - activeFocusSession.startTime) / (1000 * 60);
    setActiveFocusSession({
      ...activeFocusSession,
      duration,
    });
  };

  const endFocusSession = () => {
    if (!activeFocusSession?.isActive) return;

    const duration = (Date.now() - activeFocusSession.startTime) / (1000 * 60 * 60); // hours

    const completedSession: FocusSession = {
      ...activeFocusSession,
      endTime: Date.now(),
      duration: duration * 60, // Store as minutes
      isActive: false,
    };

    updateTodayStats({ focusTime: duration, focusSession: completedSession });
    setActiveFocusSession(null);
  };

  const updateTodayAppTime = (hours: number) => {
    const today = getTodayDateString();

    setDailyStats(prev => {
      const currentStats = prev[today] || getEmptyDailyStats(today);
      const updated = {
        ...prev,
        [today]: {
          ...currentStats,
          appScreenTime: hours,
          lastUpdated: Date.now(),
        },
      };

      setTodayStats(updated[today]);
      return updated;
    });
  };

  const updateTodayStats = (updates: { 
    appScreenTime?: number; 
    focusTime?: number;
    focusSession?: FocusSession;
  }) => {
    const today = getTodayDateString();

    setDailyStats(prev => {
      const currentStats = prev[today] || getEmptyDailyStats(today);

      const newStats: DailyStats = {
        ...currentStats,
        appScreenTime: updates.appScreenTime !== undefined 
          ? currentStats.appScreenTime + updates.appScreenTime 
          : currentStats.appScreenTime,
        focusTime: updates.focusTime !== undefined
          ? currentStats.focusTime + updates.focusTime
          : currentStats.focusTime,
        sessions: updates.appScreenTime ? currentStats.sessions + 1 : currentStats.sessions,
        focusSessions: updates.focusSession
          ? [...currentStats.focusSessions, updates.focusSession]
          : currentStats.focusSessions,
        lastUpdated: Date.now(),
      };

      setTodayStats(newStats);

      const updatedStats = {
        ...prev,
        [today]: newStats,
      };

      AsyncStorage.setItem('dailyStats', JSON.stringify(updatedStats)).catch(console.error);

      if (user) {
        saveToFirebase(newStats).catch(console.error);
      }

      return updatedStats;
    });
  };

  const saveToFirebase = async (stats: DailyStats) => {
    if (!user) return;

    try {
      await DatabaseService.saveScreenTimeData(user.uid, {
        date: stats.date,
        screenTime: Math.round(stats.deviceScreenTime * 10) / 10,
        focusTime: Math.round(stats.focusTime * 10) / 10,
        sessions: stats.sessions,
        focusSessions: stats.focusSessions.length,
        lastUpdated: Timestamp.fromMillis(stats.lastUpdated),
      });
    } catch (error) {
      console.error('Error saving to Firebase:', error);
    }
  };

  const syncWithFirebase = async () => {
    if (!user) return;

    try {
      const last7Days = [];
      const today = new Date();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
      }

      const firebaseData = await DatabaseService.getScreenTimeData(user.uid, last7Days);
      
      setDailyStats(prev => {
        const merged = { ...prev };
        
        firebaseData.forEach((data: any) => {
          if (!merged[data.date] || merged[data.date].lastUpdated < data.lastUpdated.toMillis()) {
            merged[data.date] = {
              date: data.date,
              deviceScreenTime: data.screenTime,
              appScreenTime: 0, // Not stored in Firebase
              focusTime: data.focusTime,
              sessions: data.sessions,
              focusSessions: [],
              lastUpdated: data.lastUpdated.toMillis(),
            };
          }
        });

        return merged;
      });
    } catch (error) {
      console.error('Error syncing with Firebase:', error);
    }
  };

  const getWeeklyData = (): WeeklyData[] => {
    const today = new Date();
    const weekData: WeeklyData[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en', { weekday: 'short' });

      const stats = dailyStats[dateString];

      weekData.push({
        day: dayName,
        date: dateString,
        deviceScreenTime: stats?.deviceScreenTime ? Math.round(stats.deviceScreenTime * 10) / 10 : 0,
        appScreenTime: stats?.appScreenTime ? Math.round(stats.appScreenTime * 10) / 10 : 0,
        focusTime: stats?.focusTime ? Math.round(stats.focusTime * 10) / 10 : 0,
      });
    }

    return weekData;
  };

  const getTodayDeviceScreenTime = (): number => {
    return Math.round((onSeconds / 3600) * 10) / 10; // Convert seconds to hours
  };

  const getTodayAppScreenTime = (): number => {
    const today = getTodayDateString();
    const stats = dailyStats[today];
    
    let total = stats?.appScreenTime || 0;
    
    if (currentAppSession) {
      const currentDuration = (Date.now() - currentAppSession.startTime) / (1000 * 60 * 60); // hours
      total += currentDuration;
    }

    return Math.round(total * 10) / 10;
  };

  const getTodayFocusTime = (): number => {
    const today = getTodayDateString();
    const stats = dailyStats[today];
    
    let total = stats?.focusTime || 0;
    
    if (activeFocusSession?.isActive) {
      const currentDuration = (Date.now() - activeFocusSession.startTime) / (1000 * 60 * 60); // hours
      total += currentDuration;
    }

    return Math.round(total * 10) / 10;
  };

  const getAverageDeviceScreenTime = (): number => {
    const dates = Object.keys(dailyStats);
    if (dates.length === 0) return 0;

    const total = dates.reduce((sum, date) => sum + (dailyStats[date].deviceScreenTime || 0), 0);
    return Math.round((total / dates.length) * 10) / 10;
  };

  const getAverageFocusTime = (): number => {
    const dates = Object.keys(dailyStats);
    if (dates.length === 0) return 0;

    const total = dates.reduce((sum, date) => sum + (dailyStats[date].focusTime || 0), 0);
    return Math.round((total / dates.length) * 10) / 10;
  };

  const getFocusPercentage = (): number => {
    const deviceTime = getTodayDeviceScreenTime();
    const focusTime = getTodayFocusTime();
    
    if (deviceTime === 0) return 0;
    return Math.round((focusTime / deviceTime) * 100);
  };

  const stopAllTracking = () => {
    if (appIntervalRef.current) clearInterval(appIntervalRef.current);
    if (focusIntervalRef.current) clearInterval(focusIntervalRef.current);
    endAppSession();
    if (activeFocusSession?.isActive) endFocusSession();
  };

  return {
    // Current state
    isTrackingApp,
    currentAppSession,
    activeFocusSession,
    
    // Today's stats
    todayDeviceScreenTime: getTodayDeviceScreenTime(), // Total device usage (all apps)
    todayAppScreenTime: getTodayAppScreenTime(), // Just this app
    todayFocusTime: getTodayFocusTime(),
    focusPercentage: getFocusPercentage(),
    todayStats,
    
    // Native module status
    moduleAvailable,
    permissionsRequested,
    
    // Aggregated data
    weeklyData: getWeeklyData(),
    averageDeviceScreenTime: getAverageDeviceScreenTime(),
    averageFocusTime: getAverageFocusTime(),
    
    // Controls
    startFocusSession,
    endFocusSession,
    requestPermissions,
    refreshDeviceUsage,
    syncWithFirebase,
  };
};
