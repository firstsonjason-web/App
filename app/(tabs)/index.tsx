import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Trophy, Star, X, CircleCheck as CheckCircle, Circle, Quote, Smartphone, Target, ChartBar as BarChart3, Trash2, Bell } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardCard } from '@/components/DashboardCard';
import { NotificationModal } from '@/components/NotificationModal';
import { useDarkMode } from '@/hooks/useDarkMode';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import { formatTime } from '@/lib/firebase-services';
import { NotificationService } from '@/lib/notification-service';
import { Timestamp } from 'firebase/firestore';
import { getColors } from '@/constants/Colors';
import { useLanguage } from '@/hooks/LanguageContext';

const { width } = Dimensions.get('window');

interface Goal {
  id: string;
  title: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  category: 'screen_time' | 'focus' | 'mindfulness' | 'activity' | 'custom';
  userId: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

const difficultyColors = {
  easy: '#10B981',
  medium: '#F59E0B', 
  hard: '#EF4444',
};

const difficultyPoints = {
  easy: 10,
  medium: 25,
  hard: 50,
};

const inspirationalQuotes = [
  { text: "The real problem is not whether machines think but whether men do.", author: "B.F. Skinner" },
  { text: "Technology is a useful servant but a dangerous master.", author: "Christian Lous Lange" },
  { text: "We are stuck with technology when what we really want is just stuff that works.", author: "Douglas Adams" },
  { text: "The art of being wise is knowing what to overlook.", author: "William James" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "The quieter you become, the more you are able to hear.", author: "Rumi" },
  { text: "In the depth of winter, I finally learned that there was in me an invincible summer.", author: "Albert Camus" },
  { text: "The present moment is the only time over which we have dominion.", author: "Thich Nhat Hanh" },
  { text: "Peace comes from within. Do not seek it without.", author: "Buddha" },
  { text: "The best way to take care of the future is to take care of the present moment.", author: "Thich Nhat Hanh" },
  { text: "Mindfulness is about being fully awake in our lives.", author: "Jon Kabat-Zinn" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Yesterday is history, tomorrow is a mystery, today is a gift.", author: "Eleanor Roosevelt" },
  { text: "The only way to make sense out of change is to plunge into it, move with it, and join the dance.", author: "Alan Watts" },
  { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
].map((item, index) => ({ ...item, index }));

// Rotating palette for quotes to keep them visually distinct.
const quotePalettes = [
  {
    light: { gradient: ['#F5F7FF', '#E6E9F5'], text: '#14151C', author: '#5B5B65', icon: 'rgba(0,0,0,0.16)' },
    dark:  { gradient: ['#10121B', '#1C1F2B'], text: '#F7F7FB', author: '#B2B2BE', icon: 'rgba(255,255,255,0.33)' },
  },
  {
    light: { gradient: ['#FDF4FF', '#F5E8FF'], text: '#2D1B3F', author: '#6B4E7D', icon: 'rgba(45,27,63,0.16)' },
    dark:  { gradient: ['#1F1728', '#2B2035'], text: '#F7F1FB', author: '#C8B7D8', icon: 'rgba(255,255,255,0.30)' },
  },
  {
    light: { gradient: ['#ECFDF3', '#DAF4E6'], text: '#123525', author: '#3E6B55', icon: 'rgba(18,53,37,0.14)' },
    dark:  { gradient: ['#0F1F17', '#193024'], text: '#E9F5EE', author: '#A6C8B6', icon: 'rgba(255,255,255,0.28)' },
  },
  {
    light: { gradient: ['#FFF7ED', '#FFEFD9'], text: '#5C3415', author: '#9A6B36', icon: 'rgba(92,52,21,0.14)' },
    dark:  { gradient: ['#2A1C10', '#3A2717'], text: '#FFF5E8', author: '#D9C3A4', icon: 'rgba(255,255,255,0.28)' },
  },
];

const goalCategories = [
  { id: 'screen_time', name: 'Screen Time', icon: Smartphone },
  { id: 'focus', name: 'Focus', icon: Target },
  { id: 'mindfulness', name: 'Mindfulness', icon: Star },
  { id: 'activity', name: 'Activity', icon: Trophy },
  { id: 'custom', name: 'Custom', icon: Plus },
];

const isToday = (timestamp: Timestamp): boolean => {
  const today = new Date();
  const goalDate = timestamp.toDate();
  return today.toDateString() === goalDate.toDateString();
};

export default function HomeScreen() {
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);
  const { user } = useAuth();
  const { t } = useLanguage();

  const {
    goals,
    activities,
    userProfile,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    updateDailyPrize,
    getTotalPoints,
    getCompletedGoalsCount,
    refreshData
  } = useFirebaseData();

  const [screenTime, setScreenTime] = useState({
    today: 4.5,
    goal: 6,
    yesterday: 5.2,
  });

  const [focusStreak, setFocusStreak] = useState(7);
  const [weeklyProgress, setWeeklyProgress] = useState(68);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDifficulty, setNewGoalDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [newGoalCategory, setNewGoalCategory] = useState<Goal['category']>('custom');
  const [dailyPrize, setDailyPrize] = useState('');
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [tempPrize, setTempPrize] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(inspirationalQuotes[0]);
  const [showDeleteMode, setShowDeleteMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!user) {
      router.replace('/landing');
    }
  }, [user]);

  // Update local state when Firebase data changes
  useEffect(() => {
    console.log('Goals updated in main page:', goals);
    console.log('Goals count:', goals.length);
    setTotalPoints(getTotalPoints());
    setDailyPrize(userProfile?.dailyPrize || '');
  }, [goals, userProfile, getTotalPoints]);

  // Set a random quote when component mounts
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
    setCurrentQuote({ ...inspirationalQuotes[randomIndex], index: randomIndex });
  }, []);

  // Load unread notification count
  useEffect(() => {
    if (user) {
      loadUnreadCount();
      
      // Set up real-time listener for unread count
      const unsubscribe = NotificationService.setupNotificationListener(
        user.uid,
        async (notifications) => {
          const unreadCount = notifications.filter(n => !n.read).length;
          setUnreadNotificationCount(unreadCount);
        }
      );

      return () => unsubscribe();
    }
  }, [user]);

  const loadUnreadCount = async () => {
    if (user) {
      const count = await NotificationService.getUnreadCount(user.uid);
      setUnreadNotificationCount(count);
    }
  };

  // Update points when goals change
  useEffect(() => {
    console.log('Goals changed, updating points:', goals);
    const completedPoints = getTotalPoints();
    console.log('New total points:', completedPoints);
    setTotalPoints(completedPoints);

    // Points are now stored in Firebase, no need for local storage
  }, [goals, getTotalPoints]);

  const toggleGoalCompletion = async (goalId: string) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      const wasCompleted = goal?.completed || false;
      
      // Update goal in Firebase
      await updateGoal(goalId, { completed: !wasCompleted });

      // Send notification when task is completed (not when uncompleted)
      if (!wasCompleted && user && goal) {
        await NotificationService.notifyTaskCompleted(
          user.uid,
          goal.title,
          goal.points
        );
      }

      // Refresh data to get updated activities
      await refreshData();
    } catch (error) {
      console.error('Error toggling goal completion:', error);
      Alert.alert(t('error'), t('failedToUpdateProfile'));
    }
  };

  const addNewGoal = async () => {
    if (newGoalTitle.trim()) {
      const isFreeUser = !userProfile?.subscriptionPlan || userProfile.subscriptionPlan === 'free';
      const todayGoals = goals.filter(g => isToday(g.createdAt));
      const duplicateGoal = goals.some(g => g.title.toLowerCase() === newGoalTitle.toLowerCase().trim());

      if (isFreeUser && todayGoals.length >= 3) {
        Alert.alert(t('error'), t('freeUsersCanOnlyAddUpTo3GoalsPerDay'));
        return;
      }

      if (duplicateGoal) {
        Alert.alert(t('error'), 'A goal with this title already exists.');
        return;
      }

      try {
        console.log('Starting to add new goal:', newGoalTitle);
        console.log('Current goals before adding:', goals.length);

        await addGoal({
          title: newGoalTitle,
          points: difficultyPoints[newGoalDifficulty],
          difficulty: newGoalDifficulty,
          completed: false,
          category: newGoalCategory,
        });

        console.log('Goal added successfully');
        console.log('Current goals after adding:', goals.length);

        setNewGoalTitle('');
        setNewGoalDifficulty('medium');
        setNewGoalCategory('custom');
        setShowAddGoalModal(false);
        Alert.alert(t('success'), t('activityCompleted'));

        // Refresh data to get the new goal
        console.log('Refreshing data...');
        await refreshData();
        console.log('Data refreshed, final goals count:', goals.length);
      } catch (error) {
        console.error('Error adding goal:', error);
        Alert.alert(t('error'), t('failedToUpdateProfile'));
      }
    }
  };

  const handleUpdateDailyPrize = () => {
    if (tempPrize.trim()) {
      setDailyPrize(tempPrize);
      setShowPrizeModal(false);
      setTempPrize('');
      // Update in Firebase
      updateDailyPrize(tempPrize);
      Alert.alert(t('success'), t('activityCompleted'));
    }
  };

  const openPrizeModal = () => {
    setTempPrize(dailyPrize);
    setShowPrizeModal(true);
  };

  const removeGoal = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      // Refresh data to get updated lists
      await refreshData();
    } catch (error) {
      console.error('Error removing goal:', error);
      Alert.alert(t('error'), t('failedToUpdateProfile'));
    }
  };

  const toggleDeleteMode = () => {
    setShowDeleteMode(!showDeleteMode);
  };

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

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
            <View>
              <Text style={[styles.greeting, { color: colors.text }]}>{t('goodMorning')}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('stayMindful')}</Text>
            </View>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => setShowNotifications(true)}
            >
              <Bell size={24} color={colors.text} />
              {unreadNotificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Inspirational Quote */}
          <DashboardCard
            style={styles.quoteCard}
            gradientColors={
              quotePalettes[currentQuote.index % quotePalettes.length][
                isDarkMode ? 'dark' : 'light'
              ].gradient as [string, string]
            }
          >
            <View style={styles.quoteContainer}>
              <Quote
                size={20}
                color={
                  quotePalettes[currentQuote.index % quotePalettes.length][
                    isDarkMode ? 'dark' : 'light'
                  ].icon
                }
                style={styles.quoteIcon}
              />
              <Text
                style={[
                  styles.quoteText,
                  { color: quotePalettes[currentQuote.index % quotePalettes.length][isDarkMode ? 'dark' : 'light'].text },
                ]}
              >
                &ldquo;{currentQuote.text}&rdquo;
              </Text>
              <Text
                style={[
                  styles.quoteAuthor,
                  { color: quotePalettes[currentQuote.index % quotePalettes.length][isDarkMode ? 'dark' : 'light'].author },
                ]}
              >
                — {currentQuote.author}
              </Text>
            </View>
          </DashboardCard>

          {/* Daily Awards */}
          <DashboardCard style={styles.awardsCard}>
            <View style={styles.awardsSection}>
              <View style={styles.awardsHeader}>
                <View style={styles.awardsTitle}>
                  <Trophy size={24} color="#F59E0B" />
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{t('dailyAwards')}</Text>
                </View>
                <View style={styles.awardsActions}>
                  {goals.length > 0 && (
                    <TouchableOpacity
                      style={[styles.deleteButton, showDeleteMode && styles.deleteButtonActive]}
                      onPress={toggleDeleteMode}
                    >
                      <Trash2 size={16} color={showDeleteMode ? "#FFFFFF" : "#EF4444"} />
                    </TouchableOpacity>
                  )}
                  <View style={styles.pointsContainer}>
                    <Star size={16} color="#F59E0B" />
                    <Text style={styles.pointsText}>{totalPoints} pts</Text>
                  </View>
                </View>
              </View>

              <View style={styles.goalsList}>
                {goals.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    style={[styles.goalItem, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                    onPress={() => {
                      if (showDeleteMode) {
                        Alert.alert(
                          t('deleteGoal'),
                          t('deleteGoalConfirmation'),
                          [
                            { text: t('cancel'), style: 'cancel' },
                            { text: t('delete'), style: 'destructive', onPress: () => removeGoal(goal.id) },
                          ]
                        );
                      } else {
                        toggleGoalCompletion(goal.id);
                      }
                    }}
                  >
                    <View style={styles.goalContent}>
                      {showDeleteMode ? (
                        <Trash2 size={24} color="#EF4444" />
                      ) : goal.completed ? (
                        <CheckCircle size={24} color="#10B981" />
                      ) : (
                        <Circle size={24} color="#D1D5DB" />
                      )}
                      <View style={styles.goalInfo}>
                        <Text style={[
                          styles.goalText,
                          goal.completed && styles.goalTextCompleted,
                          { color: goal.completed ? colors.textTertiary : colors.text },
                          showDeleteMode && { color: '#EF4444' }
                        ]}>
                          {goal.title}
                        </Text>
                        <View style={styles.goalMeta}>
                          <View style={[
                            styles.difficultyBadge,
                            { backgroundColor: showDeleteMode ? '#EF4444' : difficultyColors[goal.difficulty] }
                          ]}>
                            <Text style={styles.difficultyText}>
                              {showDeleteMode ? 'DELETE' : goal.difficulty.toUpperCase()}
                            </Text>
                          </View>
                          {!showDeleteMode && (
                            <Text style={styles.pointsValue}>+{goal.points} pts</Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity
                  style={[styles.addGoalButton, { backgroundColor: isDarkMode ? '#27272A' : '#F4F4F5', borderColor: isDarkMode ? '#3F3F46' : '#E4E4E7' }]}
                  onPress={() => setShowAddGoalModal(true)}
                >
                  <Plus size={20} color={colors.text} />
                  <Text style={[styles.addGoalText, { color: colors.text }]}>{t('addNewGoal')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </DashboardCard>

          {/* Daily Prize Section */}
          <DashboardCard style={styles.prizeCard}>
            <View style={styles.prizeSection}>
              <View style={styles.prizeHeader}>
                <View style={styles.prizeTitle}>
                  <Text style={styles.prizeIcon}>🎁</Text>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{t('dailyPrize')}</Text>
                </View>
                <TouchableOpacity
                  style={styles.editPrizeButton}
                  onPress={openPrizeModal}
                >
                  <Text style={styles.editPrizeText}>{t('edit')}</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.prizeContent}>
                <Text style={[styles.prizeDescription, { color: colors.textSecondary }]}>
                  {t('yourRewardForCompletingAllDailyTasks')}
                </Text>
                <View style={[styles.prizeBox, { backgroundColor: isDarkMode ? '#27272A' : '#F4F4F5', borderColor: colors.border }]}>
                  <Text style={[styles.prizeText, { color: colors.text }]}>{dailyPrize}</Text>
                </View>
                
                {/* Progress indicator */}
                <View style={styles.prizeProgress}>
                  <View style={styles.prizeProgressInfo}>
                    <Text style={[styles.prizeProgressText, { color: colors.textSecondary }]}>
                      {getCompletedGoalsCount()} / {goals.length} tasks completed
                    </Text>
                    {goals.length > 0 && goals.every(goal => goal.completed) && (
                      <Text style={styles.prizeEarnedText}>🎉 Prize Earned!</Text>
                    )}
                  </View>
                  <View style={[styles.prizeProgressBar, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.prizeProgressFill,
                        { width: `${goals.length > 0 ? (getCompletedGoalsCount() / goals.length) * 100 : 0}%` }
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
          </DashboardCard>

          {/* Recent Activity */}
          <DashboardCard>
            <View style={styles.activitySection}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{t('recentActivity')}</Text>
              {activities.length > 0 ? (
                <View style={styles.activityList}>
                  {activities.map((activity) => (
                    <View key={activity.id} style={styles.activityItem}>
                      <View style={[styles.activityDot, { backgroundColor: '#10B981' }]} />
                      <View style={styles.activityContent}>
                        <Text style={[styles.activityTitle, { color: colors.text }]}>{activity.title}</Text>
                        <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                          Success! • {formatTime(activity.completedAt)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyActivityContainer}>
                  <Text style={[styles.emptyActivityText, { color: colors.textSecondary }]}>
                    {t('yourCompletedActivities')}
                  </Text>
                </View>
              )}
            </View>
          </DashboardCard>
        </ScrollView>

        {/* Add Goal Modal */}
        <Modal
          visible={showAddGoalModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddGoalModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('addNewGoal')}</Text>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={addNewGoal}
              >
                <Text style={styles.saveButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('category')}</Text>
                <TextInput
                  style={[styles.goalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  placeholder={t('shareYourJourneyAskForAdviceOrEncourageOthers')}
                  value={newGoalTitle}
                  onChangeText={setNewGoalTitle}
                  placeholderTextColor={colors.textTertiary}
                  multiline
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('points')}</Text>
                <View style={styles.difficultySelector}>
                  {Object.entries(difficultyPoints).map(([difficulty, points]) => (
                    <TouchableOpacity
                      key={difficulty}
                      style={[
                        styles.difficultyOption,
                        { backgroundColor: colors.background, borderColor: colors.border },
                        newGoalDifficulty === difficulty && {
                          backgroundColor: difficultyColors[difficulty as keyof typeof difficultyColors],
                          borderColor: difficultyColors[difficulty as keyof typeof difficultyColors],
                        }
                      ]}
                      onPress={() => setNewGoalDifficulty(difficulty as 'easy' | 'medium' | 'hard')}
                    >
                      <Text style={[
                        styles.difficultyOptionText,
                        { color: newGoalDifficulty === difficulty ? '#FFFFFF' : colors.textSecondary },
                        newGoalDifficulty === difficulty && styles.difficultyOptionTextActive
                      ]}>
                        {difficulty.toUpperCase()}
                      </Text>
                      <Text style={[
                        styles.difficultyPoints,
                        { color: newGoalDifficulty === difficulty ? '#FFFFFF' : colors.textSecondary },
                        newGoalDifficulty === difficulty && styles.difficultyPointsActive
                      ]}>
                        +{points} pts
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('category')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categorySelector}>
                    {goalCategories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <TouchableOpacity
                          key={category.id}
                          style={[
                            styles.categoryOption,
                            { backgroundColor: colors.background },
                            newGoalCategory === category.id && styles.categoryOptionActive
                          ]}
                          onPress={() => setNewGoalCategory(category.id as Goal['category'])}
                        >
                          <IconComponent 
                            size={20} 
                            color={newGoalCategory === category.id ? '#FFFFFF' : '#6B7280'} 
                          />
                          <Text style={[
                            styles.categoryOptionText,
                            { color: newGoalCategory === category.id ? '#FFFFFF' : colors.textSecondary },
                            newGoalCategory === category.id && styles.categoryOptionTextActive
                          ]}>
                            {category.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.previewSection}>
                <Text style={[styles.previewLabel, { color: colors.text }]}>{t('points')}</Text>
                <View style={[styles.previewGoal, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Circle size={24} color="#D1D5DB" />
                  <View style={styles.previewInfo}>
                    <Text style={[styles.previewTitle, { color: colors.text }]}>
                      {newGoalTitle || 'Your goal description...'}
                    </Text>
                    <View style={styles.previewMeta}>
                      <View style={[
                        styles.previewDifficulty,
                        { backgroundColor: difficultyColors[newGoalDifficulty] }
                      ]}>
                        <Text style={styles.previewDifficultyText}>
                          {newGoalDifficulty.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.previewPoints}>
                        +{difficultyPoints[newGoalDifficulty]} pts
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Daily Prize Modal */}
        <Modal
          visible={showPrizeModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowPrizeModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('dailyPrize')}</Text>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdateDailyPrize}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('dailyPrize')}</Text>
                <Text style={[styles.prizeHint, { color: colors.textTertiary }]}>
                  {t('dailyPrize')}
                </Text>
                <TextInput
                  style={[styles.prizeInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  placeholder="e.g., Eat a few candies, Watch a movie, Buy a coffee..."
                  value={tempPrize}
                  onChangeText={setTempPrize}
                  placeholderTextColor={colors.textTertiary}
                  multiline
                />
              </View>

              <View style={styles.prizeSuggestions}>
                <Text style={[styles.suggestionsTitle, { color: colors.text }]}>{t('dailyPrize')}</Text>
                <View style={styles.suggestionsList}>
                  {[
                    '🍫 Eat a few candies',
                    '☕ Buy a special coffee',
                    '🎬 Watch a favorite movie',
                    '🛁 Take a relaxing bath',
                    '📚 Read for 30 minutes',
                    '🎮 Play games for 1 hour'
                  ].map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.suggestionItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                      onPress={() => setTempPrize(suggestion)}
                    >
                      <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Notification Modal */}
        <NotificationModal 
          visible={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  quoteCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 0,
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  quoteContainer: {
    padding: 26,
    alignItems: 'center',
    position: 'relative',
  },
  quoteIcon: {
    position: 'absolute',
    top: -10,
    left: -6,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 12,
    paddingHorizontal: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  quoteAuthor: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  progressSection: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  awardsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  awardsSection: {
    padding: 24,
  },
  awardsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  awardsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  awardsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonActive: {
    backgroundColor: '#EF4444',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
  },
  goalsList: {
    marginTop: 8,
    gap: 12,
  },
  goalItem: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  goalInfo: {
    flex: 1,
  },
  goalText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    lineHeight: 22,
  },
  goalTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  goalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  pointsValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 10,
  },
  addGoalText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3B3B44',
  },
  goalCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  goalCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  activitySection: {
    padding: 24,
  },
  activityList: {
    marginTop: 16,
    gap: 14,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyActivityContainer: {
    marginTop: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyActivityText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.7,
  },
  prizeCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  prizeSection: {
    padding: 24,
  },
  prizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  prizeTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  prizeIcon: {
    fontSize: 22,
  },
  editPrizeButton: {
    backgroundColor: 'rgba(24, 24, 27, 0.06)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editPrizeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B3B44',
  },
  prizeContent: {
    gap: 14,
  },
  prizeDescription: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  prizeBox: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  prizeText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  prizeProgress: {
    gap: 10,
  },
  prizeProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prizeProgressText: {
    fontSize: 13,
    fontWeight: '600',
  },
  prizeEarnedText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '700',
  },
  prizeProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  prizeProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  prizeInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  prizeHint: {
    fontSize: 14,
    marginBottom: 14,
    lineHeight: 20,
  },
  prizeSuggestions: {
    marginTop: 28,
  },
  suggestionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  suggestionsList: {
    gap: 10,
  },
  suggestionItem: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  saveButton: {
    backgroundColor: '#3B3B44',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  inputSection: {
    marginBottom: 28,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  difficultySelector: {
    flexDirection: 'row',
    gap: 10,
  },
  difficultyOption: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  difficultyOptionText: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  difficultyOptionTextActive: {
    color: '#FFFFFF',
  },
  difficultyPoints: {
    fontSize: 14,
    fontWeight: '700',
  },
  difficultyPointsActive: {
    color: '#FFFFFF',
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  categoryOptionActive: {
    backgroundColor: '#3B3B44',
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryOptionTextActive: {
    color: '#FFFFFF',
  },
  previewSection: {
    marginTop: 28,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewGoal: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 14,
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewDifficulty: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  previewDifficultyText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  previewPoints: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  motivationalSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  motivationalQuote: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 10,
    lineHeight: 28,
  },
  motivationalAuthor: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});