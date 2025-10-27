import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
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
import { useScreenTimeTracking } from '@/hooks/useScreenTimeTracking';
import { getColors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '@/hooks/LanguageContext';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { userProfile, goals, activities, getTotalPoints } = useFirebaseData();
  const { todayScreenTime, weeklyData, averageDailyScreenTime } = useScreenTimeTracking();
  const colors = getColors(isDarkMode);
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showAchievements, setShowAchievements] = useState(true);

  useEffect(() => {
    loadAchievementSettings();
  }, [user]);

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

  const maxScreenTime = Math.max(...weeklyData.map(d => d.screenTime));
  const maxFocusTime = Math.max(...weeklyData.map(d => d.focusTime));

  // Calculate real metrics from Firebase data
  const totalPoints = getTotalPoints();
  const completedGoals = goals.filter(goal => goal.completed).length;
  const totalActivities = activities.length;
  const avgScreenTime = averageDailyScreenTime; // Use real screen time data
  const focusSessions = Math.floor(totalPoints / 25); // Estimate based on points

  const achievements = [
    {
      id: 1,
      title: t('focusMasterTitle'),
      description: t('focusMasterDescription'),
      icon: Target,
      color: '#4F46E5',
      unlocked: focusSessions >= 7,
      date: focusSessions >= 7 ? new Date().toISOString().split('T')[0] : undefined,
    },
    {
      id: 2,
      title: t('digitalMinimalistTitle'),
      description: t('digitalMinimalistDescription'),
      icon: TrendingDown,
      color: '#10B981',
      unlocked: avgScreenTime < 3.5, // Assuming 25% reduction from 4.2h
      date: avgScreenTime < 3.5 ? new Date().toISOString().split('T')[0] : undefined,
    },
    {
      id: 3,
      title: t('mindfulWarriorTitle'),
      description: t('mindfulWarriorDescription'),
      icon: Brain,
      color: '#F59E0B',
      unlocked: false,
      progress: Math.min(focusSessions * 2, 50), // Estimate mindfulness sessions
    },
    {
      id: 4,
      title: t('timeGuardianTitle'),
      description: t('timeGuardianDescription'),
      icon: Award,
      color: '#8B5CF6',
      unlocked: false,
      progress: Math.min(completedGoals * 2, 30), // Estimate days maintained
    },
  ];

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
                <Text style={styles.metricValue}>{avgScreenTime}h</Text>
                <Text style={styles.metricLabel}>{t('avgDaily')}</Text>
                <View style={styles.metricChange}>
                  <TrendingDown size={12} color="#FFFFFF" />
                  <Text style={styles.metricChangeText}>{avgScreenTime < 4.2 ? '-18%' : '+5%'}</Text>
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
                {weeklyData.map((data, index) => (
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
                                    { width: `${Math.min(achievement.progress || 0, 100)}%` }
                                  ]}
                                />
                              </View>
                              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                                {achievement.progress || 0}/50
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

          {/* Weekly Summary */}
          <DashboardCard style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('weeklySummary')}</Text>
              <Calendar size={20} color={colors.textSecondary} />
            </View>

            <View style={styles.summaryStats}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {Math.round(weeklyData.reduce((total, day) => total + day.screenTime, 0) * 10) / 10}h
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('totalScreenTime')}</Text>
                <Text style={styles.summaryChange}>
                  {Math.round(weeklyData.reduce((total, day) => total + day.screenTime, 0) * 10) / 10 < 29.6 ? '-4.2h from last week' : '+1.2h from last week'}
                </Text>
              </View>

              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {Math.round(weeklyData.reduce((total, day) => total + day.focusTime, 0) * 10) / 10}h
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('focusTimeTotal')}</Text>
                <Text style={styles.summaryChangePositive}>
                  {Math.round(weeklyData.reduce((total, day) => total + day.focusTime, 0) * 10) / 10 > 17.8 ? '+2.5h from last week' : '+1.1h from last week'}
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
});