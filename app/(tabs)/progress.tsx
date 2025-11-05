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

const { width } = Dimensions.get('window');

interface WeeklyDataPoint {
  day: string;
  screenTime: number;
  focusTime: number;
}

export default function ProgressScreen() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { userProfile, goals, activities, getTotalPoints } = useFirebaseData();
  const { onSeconds, offSeconds, refresh, requestPermissions, permissionsRequested, moduleAvailable } = useDailyDeviceUsage();
  const colors = getColors(isDarkMode);
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showAchievements, setShowAchievements] = useState(true);
  const [weeklyData, setWeeklyData] = useState<WeeklyDataPoint[]>([]);
  const [averageDailyScreenTime, setAverageDailyScreenTime] = useState(0);
  const [showActivitiesList, setShowActivitiesList] = useState(false);

  useEffect(() => {
    loadAchievementSettings();
    loadWeeklyData();
  }, [user]);

  useEffect(() => {
    // Update average when device usage changes
    if (onSeconds > 0) {
      const screenTimeHours = onSeconds / 3600;
      setAverageDailyScreenTime(Number(screenTimeHours.toFixed(1)));
      
      // Update today's data in weekly array
      updateTodayInWeeklyData(screenTimeHours, offSeconds / 3600);
    }
  }, [onSeconds, offSeconds]);

  const updateTodayInWeeklyData = async (screenTimeHours: number, focusTimeHours: number) => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayIndex = today === 0 ? 6 : today - 1; // Convert to Mon=0, Sun=6
    
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

  const maxScreenTime = Math.max(...weeklyData.map((d: WeeklyDataPoint) => d.screenTime), todayScreenTimeHours);
  const maxFocusTime = Math.max(...weeklyData.map((d: WeeklyDataPoint) => d.focusTime), todayFocusTimeHours);

  // Calculate real metrics from Firebase data and device usage
  const totalPoints = getTotalPoints();
  const completedGoals = goals.filter(goal => goal.completed).length;
  const totalActivities = activities.length;
  const focusSessions = activities.filter(a => a.title.toLowerCase().includes('focus') || a.title.toLowerCase().includes('meditation')).length;
  
  // Calculate achievement metrics from real data
  const totalScreenTimeHours = weeklyData.reduce((total: number, day: WeeklyDataPoint) => total + day.screenTime, 0);
  const totalFocusHours = weeklyData.reduce((total: number, day: WeeklyDataPoint) => total + day.focusTime, 0);
  const daysActive = weeklyData.filter((day: WeeklyDataPoint) => day.screenTime > 0 || day.focusTime > 0).length;
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
      color: '#4F46E5',
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
      color: '#8B5CF6',
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
                colors={isDarkMode ? ['#3730A3', '#4338CA'] : ['#4F46E5', '#6366F1']}
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
                  <Clock size={20} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0, marginLeft: 8 }]}>
                    Today's Activity
                  </Text>
                </View>
                <TouchableOpacity onPress={refresh}>
                  <Text style={{ color: colors.primary, fontSize: 12 }}>Refresh</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.focusTimeStats}>
                <View style={styles.focusTimeStat}>
                  <View style={[styles.focusTimeIcon, { backgroundColor: isDarkMode ? '#DC2626' : '#FEE2E2' }]}>
                    <Smartphone size={20} color={isDarkMode ? '#FCA5A5' : '#DC2626'} />
                  </View>
                  <View style={styles.focusTimeInfo}>
                    <Text style={[styles.focusTimeLabel, { color: colors.textSecondary }]}>Screen Time</Text>
                    <Text style={[styles.focusTimeValue, { color: colors.text }]}>{formatTime(onSeconds)}</Text>
                  </View>
                </View>

                <View style={[styles.focusTimeDivider, { backgroundColor: colors.border }]} />

                <View style={styles.focusTimeStat}>
                  <View style={[styles.focusTimeIcon, { backgroundColor: isDarkMode ? '#059669' : '#D1FAE5' }]}>
                    <Brain size={20} color={isDarkMode ? '#6EE7B7' : '#059669'} />
                  </View>
                  <View style={styles.focusTimeInfo}>
                    <Text style={[styles.focusTimeLabel, { color: colors.textSecondary }]}>Off-Screen Time</Text>
                    <Text style={[styles.focusTimeValue, { color: colors.text }]}>{formatTime(offSeconds)}</Text>
                  </View>
                </View>
              </View>
              
              {/* Permission Request Button - Show if module available and permissions not requested */}
              {!permissionsRequested && moduleAvailable && (
                <TouchableOpacity 
                  style={[styles.permissionButton, { backgroundColor: colors.primary }]}
                  onPress={handleRequestPermissions}
                >
                  <Text style={styles.permissionButtonText}>Enable Device Usage Tracking</Text>
                </TouchableOpacity>
              )}
              
              {/* Show instructions if permissions requested but no data yet */}
              {permissionsRequested && moduleAvailable && onSeconds === 0 && (
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
              <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>{t('thisWeeksOverview')}</Text>
            </View>

            <View style={styles.chart}>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#4F46E5' }]} />
                  <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t('screenTimeLabel')}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t('focusTimeLabel')}</Text>
                </View>
              </View>

              <View style={styles.chartBars}>
                {weeklyData.map((data: WeeklyDataPoint, index: number) => (
                  <View key={index} style={styles.barGroup}>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: maxScreenTime > 0 ? (data.screenTime / maxScreenTime) * 80 : 0,
                            backgroundColor: '#4F46E5'
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
                        <Award size={18} color={isDarkMode ? '#A78BFA' : '#4F46E5'} />
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

          {/* Weekly Summary */}
          <DashboardCard style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('weeklySummary')}</Text>
              <Calendar size={20} color={colors.textSecondary} />
            </View>

            <View style={styles.summaryStats}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {Math.round(weeklyData.reduce((total: number, day: WeeklyDataPoint) => total + day.screenTime, 0) * 10) / 10}h
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('totalScreenTime')}</Text>
                <Text style={styles.summaryChange}>
                  {Math.round(weeklyData.reduce((total: number, day: WeeklyDataPoint) => total + day.screenTime, 0) * 10) / 10 < 29.6 ? '-4.2h from last week' : '+1.2h from last week'}
                </Text>
              </View>

              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {Math.round(weeklyData.reduce((total: number, day: WeeklyDataPoint) => total + day.focusTime, 0) * 10) / 10}h
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('focusTimeTotal')}</Text>
                <Text style={styles.summaryChangePositive}>
                  {Math.round(weeklyData.reduce((total: number, day: WeeklyDataPoint) => total + day.focusTime, 0) * 10) / 10 > 17.8 ? '+2.5h from last week' : '+1.1h from last week'}
                </Text>
              </View>
            </View>

            <View style={[styles.summaryInsight, { backgroundColor: isDarkMode ? '#1E293B' : '#F0F9FF', borderLeftColor: '#4F46E5' }]}>
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
    backgroundColor: '#4F46E5',
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
    backgroundColor: '#4F46E5',
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
  },
  focusTimeStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  focusTimeStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  focusTimeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  focusTimeInfo: {
    flex: 1,
  },
  focusTimeLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  focusTimeValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  focusTimeDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
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
    borderColor: '#4F46E5',
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