import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingDown,
  TrendingUp,
  Target,
  Award,
  Calendar,
  Clock,
  Smartphone,
  Brain,
  RefreshCw,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardCard } from '@/components/DashboardCard';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import { useDailyDeviceUsage } from '@/hooks/useDailyDeviceUsage';
import { getColors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '@/hooks/LanguageContext';
import { DatabaseService, ScreenTimeData } from '@/lib/firebase-services';
import { getDeviceInfo, DeviceInfo } from '@/lib/device-info';

const { width } = Dimensions.get('window');

interface WeeklyDataPoint {
  day: string;
  screenTime: number;
  focusTime: number;
}

interface DailyDataPoint {
  date: string; // YYYY-MM-DD format
  screenTime: number; // in hours
  focusTime: number; // in hours
}

export default function ProgressScreen() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { userProfile, goals, activities, getTotalPoints } = useFirebaseData();
  const { onSeconds, offSeconds, refresh, requestPermissions, permissionsRequested, isAuthorized, moduleAvailable } = useDailyDeviceUsage();
  const colors = getColors(isDarkMode);
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showAchievements, setShowAchievements] = useState(true);
  const [weeklyData, setWeeklyData] = useState<WeeklyDataPoint[]>([]);
  const [periodData, setPeriodData] = useState<WeeklyDataPoint[]>([]);
  const [dailyHistory, setDailyHistory] = useState<DailyDataPoint[]>([]);
  const [averageDailyScreenTime, setAverageDailyScreenTime] = useState(0);
  const [showActivitiesList, setShowActivitiesList] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const initializeDevice = async () => {
      const info = await getDeviceInfo();
      setDeviceInfo(info);
    };
    initializeDevice();
  }, []);

  useEffect(() => {
    if (user && deviceInfo) {
      loadAchievementSettings();
      loadDailyHistory();
      loadWeeklyData();
      loadFirebaseData();
    }
  }, [user, deviceInfo]);

  useEffect(() => {
    // Update average when device usage changes
    if (onSeconds > 0) {
      const screenTimeHours = onSeconds / 3600;
      setAverageDailyScreenTime(Number(screenTimeHours.toFixed(1)));
      
      // Update today's data
      updateTodayData(screenTimeHours, offSeconds / 3600);
    }
  }, [onSeconds, offSeconds]);

  // Update period data when selectedPeriod or dailyHistory changes
  useEffect(() => {
    if (dailyHistory.length > 0 || weeklyData.length > 0) {
      generatePeriodData();
    }
  }, [selectedPeriod, dailyHistory, weeklyData]);

  const updateTodayData = async (screenTimeHours: number, focusTimeHours: number) => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Update daily history
    setDailyHistory((prevHistory) => {
      const newHistory = [...prevHistory];
      const existingIndex = newHistory.findIndex(d => d.date === todayString);
      
      if (existingIndex >= 0) {
        newHistory[existingIndex] = {
          date: todayString,
          screenTime: Number(screenTimeHours.toFixed(1)),
          focusTime: Number(focusTimeHours.toFixed(1)),
        };
      } else {
        newHistory.push({
          date: todayString,
          screenTime: Number(screenTimeHours.toFixed(1)),
          focusTime: Number(focusTimeHours.toFixed(1)),
        });
      }
      
      // Keep only last 365 days
      const sortedHistory = newHistory.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, 365);
      
      saveDailyHistory(sortedHistory);
      
      // Sync to Firebase
      if (user && deviceInfo) {
        syncToFirebase(todayString, screenTimeHours, focusTimeHours);
      }
      
      return sortedHistory;
    });

    // Also update weekly data for backward compatibility
    const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // Convert to Mon=0, Sun=6
    setWeeklyData((prevData) => {
      const newData = [...prevData];
      newData[dayIndex] = {
        ...newData[dayIndex],
        screenTime: Number(screenTimeHours.toFixed(1)),
        focusTime: Number(focusTimeHours.toFixed(1)),
      };
      saveWeeklyData(newData);
      return newData;
    });
  };

  const syncToFirebase = async (date: string, screenTime: number, focusTime: number) => {
    if (!user || !deviceInfo || isSyncing) return;
    
    try {
      setIsSyncing(true);
      await DatabaseService.saveScreenTimeData(
        user.uid,
        deviceInfo.deviceId,
        deviceInfo.deviceName,
        deviceInfo.platform,
        date,
        screenTime,
        focusTime
      );
    } catch (error) {
      console.error('Error syncing to Firebase:', error);
      // Don't throw - allow local storage to continue working
    } finally {
      setIsSyncing(false);
    }
  };

  const loadFirebaseData = async () => {
    if (!user || !deviceInfo) return;

    try {
      // Load last 365 days of data from Firebase
      const now = new Date();
      const oneYearAgo = new Date(now);
      oneYearAgo.setDate(oneYearAgo.getDate() - 365);
      const startDate = oneYearAgo.toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];

      const firebaseData = await DatabaseService.getScreenTimeData(
        user.uid,
        startDate,
        endDate
      );

      // Merge Firebase data with local data
      setDailyHistory((prevHistory) => {
        const mergedMap = new Map<string, DailyDataPoint>();
        
        // Add local data first
        prevHistory.forEach(item => {
          mergedMap.set(item.date, item);
        });

        // Merge Firebase data (prefer more recent updatedAt)
        firebaseData.forEach((item: ScreenTimeData) => {
          const existing = mergedMap.get(item.date);
          if (!existing || (item.updatedAt && existing)) {
            mergedMap.set(item.date, {
              date: item.date,
              screenTime: item.screenTime,
              focusTime: item.focusTime,
            });
          }
        });

        const merged = Array.from(mergedMap.values())
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 365);

        saveDailyHistory(merged);
        return merged;
      });
    } catch (error) {
      console.error('Error loading Firebase data:', error);
      // Continue with local data only
    }
  };

  const loadDailyHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem('daily_screen_time_history');
      if (saved) {
        const history = JSON.parse(saved);
        setDailyHistory(history);
      } else {
        setDailyHistory([]);
      }
    } catch (error) {
      console.log('Error loading daily history:', error);
      setDailyHistory([]);
    }
  };

  const saveDailyHistory = async (data: DailyDataPoint[]) => {
    try {
      await AsyncStorage.setItem('daily_screen_time_history', JSON.stringify(data));
    } catch (error) {
      console.log('Error saving daily history:', error);
    }
  };

  const generatePeriodData = () => {
    const now = new Date();
    let data: WeeklyDataPoint[] = [];

    // If no daily history, use weekly data as fallback for week view
    if (dailyHistory.length === 0 && selectedPeriod === 'week' && weeklyData.length > 0) {
      setPeriodData(weeklyData);
      return;
    }

    if (selectedPeriod === 'week') {
      // Show last 7 days
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      data = days.map((day, index) => {
        const date = new Date(now);
        date.setDate(now.getDate() - (6 - index)); // Get last 7 days
        const dateString = date.toISOString().split('T')[0];
        const dayData = dailyHistory.find(d => d.date === dateString);
        
        return {
          day: day.substring(0, 3), // Mon, Tue, etc.
          screenTime: dayData?.screenTime || 0,
          focusTime: dayData?.focusTime || 0,
        };
      });
    } else if (selectedPeriod === 'month') {
      // Show last 4 weeks
      const weeks = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (i * 7) - (now.getDay() === 0 ? 6 : now.getDay() - 1));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        // Aggregate data for this week
        let weekScreenTime = 0;
        let weekFocusTime = 0;
        for (let d = 0; d < 7; d++) {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + d);
          const dateString = date.toISOString().split('T')[0];
          const dayData = dailyHistory.find(h => h.date === dateString);
          if (dayData) {
            weekScreenTime += dayData.screenTime;
            weekFocusTime += dayData.focusTime;
          }
        }
        
        weeks.push({
          day: `W${4 - i}`, // W1, W2, W3, W4
          screenTime: Number(weekScreenTime.toFixed(1)),
          focusTime: Number(weekFocusTime.toFixed(1)),
        });
      }
      data = weeks;
    } else if (selectedPeriod === 'year') {
      // Show last 12 months
      const months = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        
        // Aggregate data for this month
        let monthScreenTime = 0;
        let monthFocusTime = 0;
        for (let d = 0; d <= monthEnd.getDate(); d++) {
          const date = new Date(monthStart);
          date.setDate(monthStart.getDate() + d);
          const dateString = date.toISOString().split('T')[0];
          const dayData = dailyHistory.find(h => h.date === dateString);
          if (dayData) {
            monthScreenTime += dayData.screenTime;
            monthFocusTime += dayData.focusTime;
          }
        }
        
        months.push({
          day: monthNames[monthDate.getMonth()],
          screenTime: Number(monthScreenTime.toFixed(1)),
          focusTime: Number(monthFocusTime.toFixed(1)),
        });
      }
      data = months;
    }

    setPeriodData(data);
  };

  const loadWeeklyData = async () => {
    try {
      const saved = await AsyncStorage.getItem('weekly_screen_time_data');
      if (saved) {
        setWeeklyData(JSON.parse(saved));
      } else {
        // Initialize with default weekly data
        const defaultData = generateDefaultWeeklyData();
        setWeeklyData(defaultData);
        await AsyncStorage.setItem('weekly_screen_time_data', JSON.stringify(defaultData));
      }
    } catch (error) {
      console.log('Error loading weekly data:', error);
      setWeeklyData(generateDefaultWeeklyData());
    }
  };

  const generateDefaultWeeklyData = (): WeeklyDataPoint[] => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day) => ({
      day,
      screenTime: 0,
      focusTime: 0,
    }));
  };

  const saveWeeklyData = async (data: WeeklyDataPoint[]) => {
    try {
      await AsyncStorage.setItem('weekly_screen_time_data', JSON.stringify(data));
    } catch (error) {
      console.log('Error saving weekly data:', error);
    }
  };

  const loadAchievementSettings = async () => {
    if (!user) return;

    try {
      const achievementSetting = await AsyncStorage.getItem('achievement_notifications');
      if (achievementSetting !== null) {
        setShowAchievements(JSON.parse(achievementSetting));
      }
    } catch (error) {
      console.log('Error loading achievement settings:', error);
    }
  };

  const periods = [
    { id: 'week', name: t('periodWeek') },
    { id: 'month', name: t('periodMonth') },
    { id: 'year', name: t('periodYear') },
  ];

  // Helper to format seconds to hours and minutes
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  // Calculate real screen time in hours from seconds
  const todayScreenTimeHours = onSeconds / 3600;
  const todayFocusTimeHours = offSeconds / 3600;

  // Use periodData for calculations instead of weeklyData
  const displayData = periodData.length > 0 ? periodData : weeklyData;
  const maxScreenTime = Math.max(...displayData.map((d: WeeklyDataPoint) => d.screenTime), todayScreenTimeHours, 1);
  const maxFocusTime = Math.max(...displayData.map((d: WeeklyDataPoint) => d.focusTime), todayFocusTimeHours, 1);

  // Calculate real metrics from Firebase data and device usage
  const totalPoints = getTotalPoints();
  const completedGoals = goals.filter(goal => goal.completed).length;
  const totalActivities = activities.length;
  const focusSessions = activities.filter(a => a.title.toLowerCase().includes('focus') || a.title.toLowerCase().includes('meditation')).length;
  
  // Calculate achievement metrics from real data (use periodData for current view)
  const totalScreenTimeHours = displayData.reduce((total: number, day: WeeklyDataPoint) => total + day.screenTime, 0);
  const totalFocusHours = displayData.reduce((total: number, day: WeeklyDataPoint) => total + day.focusTime, 0);
  const daysActive = displayData.filter((day: WeeklyDataPoint) => day.screenTime > 0 || day.focusTime > 0).length;
  const mindfulnessActivities = activities.filter(a => 
    a.title.toLowerCase().includes('mindful') || 
    a.title.toLowerCase().includes('meditation') ||
    a.title.toLowerCase().includes('breath')
  ).length;

  const achievements = [
    {
      id: 1,
      title: t('focusMasterTitle'),
      description: t('focusMasterDescription'),
      icon: Target,
      color: '#3B3B44',
      unlocked: focusSessions >= 7,
      progress: Math.min(focusSessions, 7),
      total: 7,
      date: focusSessions >= 7 ? new Date().toISOString().split('T')[0] : undefined,
    },
    {
      id: 2,
      title: t('digitalMinimalistTitle'),
      description: t('digitalMinimalistDescription'),
      icon: TrendingDown,
      color: '#10B981',
      unlocked: averageDailyScreenTime > 0 && averageDailyScreenTime < 3.5,
      progress: averageDailyScreenTime > 0 ? Math.min(Math.floor((4.5 - averageDailyScreenTime) * 10), 10) : 0,
      total: 10,
      date: averageDailyScreenTime > 0 && averageDailyScreenTime < 3.5 ? new Date().toISOString().split('T')[0] : undefined,
    },
    {
      id: 3,
      title: t('mindfulWarriorTitle'),
      description: t('mindfulWarriorDescription'),
      icon: Brain,
      color: '#F59E0B',
      unlocked: mindfulnessActivities >= 50,
      progress: mindfulnessActivities,
      total: 50,
    },
    {
      id: 4,
      title: t('timeGuardianTitle'),
      description: t('timeGuardianDescription'),
      icon: Award,
      color: '#3F3F46',
      unlocked: daysActive >= 30,
      progress: daysActive,
      total: 30,
    },
  ];

  const handleRequestPermissions = async () => {
    try {
      await requestPermissions();
      Alert.alert(
        t('permissionsRequested'),
        t('permissionsRequestedDescription'),
        [
          { text: 'OK' }
        ]
      );
    } catch (error: any) {
      // Error is already handled in ensurePermissions with user alert
      // We just need to catch it to prevent unhandled promise rejection
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{t('progress')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('trackDigitalWellnessJourney')}</Text>
          </View>

          {/* Key Metrics */}
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <LinearGradient
                colors={isDarkMode ? ['#3730A3', '#4338CA'] : ['#3B3B44', '#6366F1']}
                style={styles.metricGradient}
              >
                <Smartphone size={24} color="#FFFFFF" />
                <Text style={styles.metricValue}>{averageDailyScreenTime}h</Text>
                <Text style={styles.metricLabel}>{t('avgDaily')}</Text>
                <View style={styles.metricChange}>
                  <TrendingDown size={12} color="#FFFFFF" />
                  <Text style={styles.metricChangeText}>{averageDailyScreenTime < 4.2 ? '-18%' : '+5%'}</Text>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.metricCard}>
              <LinearGradient
                colors={isDarkMode ? ['#047857', '#065F46'] : ['#10B981', '#059669']}
                style={styles.metricGradient}
              >
                <Target size={24} color="#FFFFFF" />
                <Text style={styles.metricValue}>{focusSessions}</Text>
                <Text style={styles.metricLabel}>{t('focusSessionsLabel')}</Text>
                <View style={styles.metricChange}>
                  <TrendingUp size={12} color="#FFFFFF" />
                  <Text style={styles.metricChangeText}>+{Math.floor(focusSessions * 0.12)}%</Text>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Focus Time Today */}
          <View style={styles.focusTimeContainer}>
            <DashboardCard style={{ backgroundColor: colors.cardBackground, padding: 20 }}>
              <View style={styles.focusTimeHeader}>
                <View style={styles.focusTimeTitle}>
                  <Clock size={22} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0, marginLeft: 10 }]}>
                    Today's Activity
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={refresh}
                  style={[styles.refreshButton, { backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)' }]}
                >
                  <RefreshCw size={14} color={colors.primary} />
                  <Text style={[styles.refreshText, { color: colors.primary }]}>Refresh</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.focusTimeStats}>
                <View style={styles.focusTimeStat}>
                  <View style={[styles.focusTimeIcon, { backgroundColor: isDarkMode ? '#DC2626' : '#FEE2E2' }]}>
                    <Smartphone size={20} color={isDarkMode ? '#FCA5A5' : '#DC2626'} />
                  </View>
                  <View style={styles.focusTimeInfo}>
                    <Text style={[styles.focusTimeLabel, { color: colors.textSecondary }]} numberOfLines={1}>Screen Time</Text>
                    <Text style={[styles.focusTimeValue, { color: colors.text }]} numberOfLines={1}>{formatTime(onSeconds)}</Text>
                  </View>
                </View>

                <View style={[styles.focusTimeDivider, { backgroundColor: colors.border }]} />

                <View style={styles.focusTimeStat}>
                  <View style={[styles.focusTimeIcon, { backgroundColor: isDarkMode ? '#059669' : '#D1FAE5' }]}>
                    <Brain size={20} color={isDarkMode ? '#6EE7B7' : '#059669'} />
                  </View>
                  <View style={styles.focusTimeInfo}>
                    <Text style={[styles.focusTimeLabel, { color: colors.textSecondary }]} numberOfLines={1}>Off-Screen</Text>
                    <Text style={[styles.focusTimeValue, { color: colors.text }]} numberOfLines={1}>{formatTime(offSeconds)}</Text>
                  </View>
                </View>
              </View>
              
              {/* Permission Request Button - Show if module available and not yet authorized */}
              {!isAuthorized && !permissionsRequested && moduleAvailable && (
                <TouchableOpacity 
                  style={[styles.permissionButton, { backgroundColor: colors.primary }]}
                  onPress={handleRequestPermissions}
                >
                  <Text style={styles.permissionButtonText}>Enable Device Usage Tracking</Text>
                </TouchableOpacity>
              )}
              
              {/* Show instructions if permissions requested but no data yet */}
              {(permissionsRequested || isAuthorized) && moduleAvailable && onSeconds === 0 && (
                <View style={[styles.instructionContainer, { backgroundColor: isDarkMode ? '#1E293B' : '#F0F9FF' }]}>
                  <Text style={[styles.instructionTitle, { color: colors.text }]}>
                    ⚙️ Setup Required
                  </Text>
                  <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                    1. Open iPhone Settings {'\n'}
                    2. Go to Screen Time {'\n'}
                    3. Enable "Share Across Devices" {'\n'}
                    4. Return to app and tap Refresh
                  </Text>
                </View>
              )}
              
              {/* Module Unavailable Message */}
              {!moduleAvailable && (
                <View style={styles.moduleUnavailableContainer}>
                  <Text style={[styles.moduleUnavailableText, { color: colors.textSecondary }]}>
                    {Platform.OS === 'ios' 
                      ? '⚠️ Screen Time tracking requires iOS 16+ and Screen Time permissions.\n\nPlease grant permissions when prompted.' 
                      : '⚠️ Screen Time tracking requires Android 5.1+\n\nPlease grant Usage Access permission when prompted.'}
                  </Text>
                </View>
              )}
              
            </DashboardCard>
          </View>

          {/* Period Selector */}
          <View style={styles.periodContainer}>
            <View style={[styles.periodSelector, { backgroundColor: colors.cardBackground }]}>
              {periods.map((period) => (
                <TouchableOpacity
                  key={period.id}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period.id && styles.periodButtonActive
                  ]}
                  onPress={() => setSelectedPeriod(period.id)}
                >
                  <Text style={[
                    styles.periodText,
                    { color: selectedPeriod === period.id ? '#FFFFFF' : colors.textSecondary },
                    selectedPeriod === period.id && styles.periodTextActive
                  ]}>
                    {period.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Charts */}
          <DashboardCard style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>{t('screenTimeVsFocusTime')}</Text>
              <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
                {selectedPeriod === 'week' ? t('thisWeeksOverview') : 
                 selectedPeriod === 'month' ? 'Last 4 Weeks' : 
                 'Last 12 Months'}
              </Text>
            </View>

            <View style={styles.chart}>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#3B3B44' }]} />
                  <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t('screenTimeLabel')}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t('focusTimeLabel')}</Text>
                </View>
              </View>

              <View style={styles.chartBars}>
                {displayData.map((data: WeeklyDataPoint, index: number) => (
                  <View key={index} style={styles.barGroup}>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: maxScreenTime > 0 ? (data.screenTime / maxScreenTime) * 80 : 0,
                            backgroundColor: '#3B3B44'
                          }
                        ]}
                      />
                      <View
                        style={[
                          styles.bar,
                          {
                            height: maxFocusTime > 0 ? (data.focusTime / maxFocusTime) * 80 : 0,
                            backgroundColor: '#10B981',
                            marginLeft: 4,
                          }
                        ]}
                      />
                    </View>
                    <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{data.day}</Text>
                  </View>
                ))}
              </View>
            </View>
          </DashboardCard>

          {/* Achievements */}
          {showAchievements && (
            <View style={styles.achievementsContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
              <View style={styles.achievementsList}>
                {achievements.map((achievement) => {
                  const IconComponent = achievement.icon;
                  return (
                    <DashboardCard key={achievement.id} style={styles.achievementCard}>
                      <View style={styles.achievementContent}>
                        <View style={[
                          styles.achievementIcon, 
                          { 
                            backgroundColor: achievement.unlocked ? achievement.color : '#E5E7EB',
                            opacity: achievement.unlocked ? 1 : 0.6 
                          }
                        ]}>
                          <IconComponent 
                            size={24} 
                            color={achievement.unlocked ? '#FFFFFF' : '#9CA3AF'} 
                          />
                        </View>

                        <View style={styles.achievementInfo}>
                          <Text style={[
                            styles.achievementTitle,
                            { opacity: achievement.unlocked ? 1 : 0.6, color: colors.text }
                          ]}>
                            {achievement.title}
                          </Text>
                          <Text style={[styles.achievementDescription, { color: colors.textSecondary }]}>
                            {achievement.description}
                          </Text>
                          
                          {achievement.unlocked ? (
                            <Text style={styles.achievementDate}>
                              {t('unlockedOn', { date: achievement.date })}
                            </Text>
                          ) : (
                            <View style={styles.progressContainer}>
                              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                                <View
                                  style={[
                                    styles.progressFill,
                                    { width: `${Math.min((achievement.progress || 0) / (achievement.total || 100) * 100, 100)}%` }
                                  ]}
                                />
                              </View>
                              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                                {achievement.progress || 0}/{achievement.total || 100}
                              </Text>
                            </View>
                          )}
                        </View>

                        {achievement.unlocked && (
                          <Award size={20} color="#F59E0B" />
                        )}
                      </View>
                    </DashboardCard>
                  );
                })}
              </View>
            </View>
          )}

          {/* Activity History */}
          <View style={styles.activitiesContainer}>
            <View style={styles.activitiesHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                {t('activityHistory')} ({totalActivities})
              </Text>
              <TouchableOpacity onPress={() => setShowActivitiesList(!showActivitiesList)}>
                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>
                  {showActivitiesList ? 'Hide' : 'Show All'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {showActivitiesList && activities.length > 0 && (
              <View style={styles.activitiesList}>
                {activities.map((activity, index) => (
                  <DashboardCard key={activity.id || index} style={styles.activityCard}>
                    <View style={styles.activityContent}>
                      <View style={[styles.activityIconContainer, { backgroundColor: isDarkMode ? '#3730A3' : '#EEF2FF' }]}>
                        <Award size={18} color={isDarkMode ? '#A78BFA' : '#3B3B44'} />
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={[styles.activityTitle, { color: colors.text }]}>
                          {activity.title}
                        </Text>
                        <Text style={[styles.activityDate, { color: colors.textSecondary }]}>
                          {activity.completedAt?.toDate ? 
                            new Date(activity.completedAt.toDate()).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 
                            'Recently'
                          }
                        </Text>
                      </View>
                      <View style={styles.activityPoints}>
                        <Text style={[styles.activityPointsText, { color: '#10B981' }]}>
                          +{activity.points}
                        </Text>
                      </View>
                    </View>
                  </DashboardCard>
                ))}
              </View>
            )}
            
            {showActivitiesList && activities.length === 0 && (
              <DashboardCard style={styles.emptyActivitiesCard}>
                <Text style={[styles.emptyActivitiesText, { color: colors.textSecondary }]}>
                  {t('noActivitiesYet')}
                </Text>
                <Text style={[styles.emptyActivitiesSubtext, { color: colors.textSecondary }]}>
                  {t('completeGoalsToSeeActivities')}
                </Text>
              </DashboardCard>
            )}
          </View>

          {/* Period Summary */}
          <DashboardCard style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {selectedPeriod === 'week' ? t('weeklySummary') : 
                 selectedPeriod === 'month' ? 'Monthly Summary' : 
                 'Yearly Summary'}
              </Text>
              <Calendar size={20} color={colors.textSecondary} />
            </View>

            <View style={styles.summaryStats}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {Math.round(totalScreenTimeHours * 10) / 10}h
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('totalScreenTime')}</Text>
                <Text style={styles.summaryChange}>
                  {selectedPeriod === 'week' ? 'This week' : 
                   selectedPeriod === 'month' ? 'Last 4 weeks' : 
                   'Last 12 months'}
                </Text>
              </View>

              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {Math.round(totalFocusHours * 10) / 10}h
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('focusTimeTotal')}</Text>
                <Text style={styles.summaryChangePositive}>
                  {selectedPeriod === 'week' ? 'This week' : 
                   selectedPeriod === 'month' ? 'Last 4 weeks' : 
                   'Last 12 months'}
                </Text>
              </View>
            </View>

            <View style={[styles.summaryInsight, { backgroundColor: isDarkMode ? '#1E293B' : '#F0F9FF', borderLeftColor: '#3B3B44' }]}>
              <Text style={[styles.insightText, { color: colors.text }]}>
                {t('progressInsightMessage')}
              </Text>
            </View>
          </DashboardCard>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  metricGradient: {
    padding: 20,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 8,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricChangeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  periodContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  periodSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#3B3B44',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  chartCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  chartHeader: {
    padding: 20,
    paddingBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
  },
  chart: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    marginBottom: 8,
  },
  bar: {
    width: 12,
    minHeight: 8,
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  achievementsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    padding: 16,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  achievementDate: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B3B44',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryChange: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  summaryChangePositive: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  summaryInsight: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
  focusTimeContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  focusTimeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  focusTimeTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '600',
  },
  focusTimeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  focusTimeStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0, // Allow shrinking
  },
  focusTimeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  focusTimeInfo: {
    flex: 1,
    minWidth: 0, // Allow shrinking
  },
  focusTimeLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  focusTimeValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  focusTimeDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 12,
  },
  permissionButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  moduleUnavailableContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  moduleUnavailableText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  instructionContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B3B44',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  helpButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  helpButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  activitiesContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  activitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activitiesList: {
    gap: 10,
  },
  activityCard: {
    padding: 14,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  activityPoints: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  activityPointsText: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyActivitiesCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyActivitiesText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyActivitiesSubtext: {
    fontSize: 13,
    textAlign: 'center',
  },
});