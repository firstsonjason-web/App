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
import { Plus, Trophy, Star, X, CircleCheck as CheckCircle, Circle, Quote, Smartphone, Target, ChartBar as BarChart3, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardCard } from '@/components/DashboardCard';
import { useDarkMode } from '@/hooks/useDarkMode';
import { getColors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

interface Goal {
  id: number;
  title: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  category: 'screen_time' | 'focus' | 'mindfulness' | 'activity' | 'custom';
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
  {
    text: "The real problem is not whether machines think but whether men do.",
    author: "B.F. Skinner"
  },
  {
    text: "Technology is a useful servant but a dangerous master.",
    author: "Christian Lous Lange"
  },
  {
    text: "We are stuck with technology when what we really want is just stuff that works.",
    author: "Douglas Adams"
  },
  {
    text: "The art of being wise is knowing what to overlook.",
    author: "William James"
  },
  {
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci"
  },
  {
    text: "The quieter you become, the more you are able to hear.",
    author: "Rumi"
  },
  {
    text: "In the depth of winter, I finally learned that there was in me an invincible summer.",
    author: "Albert Camus"
  },
  {
    text: "The present moment is the only time over which we have dominion.",
    author: "Thich Nhat Hanh"
  },
  {
    text: "Peace comes from within. Do not seek it without.",
    author: "Buddha"
  },
  {
    text: "The best way to take care of the future is to take care of the present moment.",
    author: "Thich Nhat Hanh"
  },
  {
    text: "Mindfulness is about being fully awake in our lives.",
    author: "Jon Kabat-Zinn"
  },
  {
    text: "The mind is everything. What you think you become.",
    author: "Buddha"
  },
  {
    text: "Yesterday is history, tomorrow is a mystery, today is a gift.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "The only way to make sense out of change is to plunge into it, move with it, and join the dance.",
    author: "Alan Watts"
  },
  {
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde"
  }
];

const goalCategories = [
  { id: 'screen_time', name: 'Screen Time', icon: Smartphone },
  { id: 'focus', name: 'Focus', icon: Target },
  { id: 'mindfulness', name: 'Mindfulness', icon: Star },
  { id: 'activity', name: 'Activity', icon: Trophy },
  { id: 'custom', name: 'Custom', icon: Plus },
];

export default function HomeScreen() {
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);
  
  const [screenTime, setScreenTime] = useState({
    today: 4.5,
    goal: 6,
    yesterday: 5.2,
  });

  const [focusStreak, setFocusStreak] = useState(7);
  const [weeklyProgress, setWeeklyProgress] = useState(68);
  const [dailyGoals, setDailyGoals] = useState<Goal[]>([
  ]);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDifficulty, setNewGoalDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [newGoalCategory, setNewGoalCategory] = useState<Goal['category']>('custom');
  const [dailyPrize, setDailyPrize] = useState('');
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [tempPrize, setTempPrize] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(inspirationalQuotes[0]);
  const [recentActivities, setRecentActivities] = useState<Array<{
    id: number;
    title: string;
    completedAt: string;
  }>>([]);
  const [showDeleteMode, setShowDeleteMode] = useState(false);

  // Load saved points from storage on component mount
  useEffect(() => {
    const loadSavedPoints = async () => {
      try {
        // In a real app, this would load from AsyncStorage or a database
        // For now, we'll use the calculated points from completed goals
        const completedPoints = dailyGoals
          .filter(goal => goal.completed)
          .reduce((sum, goal) => sum + goal.points, 0);
        setTotalPoints(completedPoints);
      } catch (error) {
        console.log('Error loading saved points:', error);
      }
    };
    
    loadSavedPoints();
  }, []);

  useEffect(() => {
    // Set a random quote when component mounts
    const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
    setCurrentQuote(inspirationalQuotes[randomIndex]);
  }, []);

  useEffect(() => {
    const completedPoints = dailyGoals
      .filter(goal => goal.completed)
      .reduce((sum, goal) => sum + goal.points, 0);
    setTotalPoints(completedPoints);
    
    // Save points to storage for Rankings page
    const savePointsToStorage = async () => {
      try {
        // In a real app, this would save to AsyncStorage or send to backend
        // For demo purposes, we'll store in a global variable or context
        global.userDailyPoints = completedPoints;
      } catch (error) {
        console.log('Error saving points:', error);
      }
    };
    
    savePointsToStorage();
  }, [dailyGoals]);

  const toggleGoalCompletion = (goalId: number) => {
    setDailyGoals(prevGoals =>
      prevGoals.map(goal =>
        goal.id === goalId
          ? { 
              ...goal, 
              completed: !goal.completed 
            }
          : goal
      )
    );
    
    // Add to recent activities when goal is completed
    const goal = dailyGoals.find(g => g.id === goalId);
    if (goal && !goal.completed) {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setRecentActivities(prev => [
        {
          id: goalId,
          title: goal.title,
          completedAt: `Success! • ${timeString}`,
        },
        ...prev.slice(0, 4) // Keep only the 5 most recent activities
      ]);
    } else if (goal && goal.completed) {
      // Remove from recent activities when goal is unchecked
      setRecentActivities(prev => prev.filter(activity => activity.id !== goalId));
    }
  };

  const addNewGoal = () => {
    if (newGoalTitle.trim()) {
      const newGoal: Goal = {
        id: Date.now(),
        title: newGoalTitle,
        points: difficultyPoints[newGoalDifficulty],
        difficulty: newGoalDifficulty,
        completed: false,
        category: newGoalCategory,
      };
      
      setDailyGoals([...dailyGoals, newGoal]);
      setNewGoalTitle('');
      setNewGoalDifficulty('medium');
      setNewGoalCategory('custom');
      setShowAddGoalModal(false);
      Alert.alert('Success', 'New goal added to your daily awards!');
    }
  };

  const updateDailyPrize = () => {
    if (tempPrize.trim()) {
      setDailyPrize(tempPrize);
      setShowPrizeModal(false);
      setTempPrize('');
      Alert.alert('Success', 'Your daily prize has been updated!');
    }
  };

  const openPrizeModal = () => {
    setTempPrize(dailyPrize);
    setShowPrizeModal(true);
  };

  const removeGoal = (goalId: number) => {
    setDailyGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
    // Also remove from recent activities if it was completed
    setRecentActivities(prev => prev.filter(activity => activity.id !== goalId));
    // Also remove from recent activities if it was completed
    setRecentActivities(prev => prev.filter(activity => activity.id !== goalId));
  };

  const toggleDeleteMode = () => {
    setShowDeleteMode(!showDeleteMode);
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
            <Text style={[styles.greeting, { color: colors.text }]}>Good morning! 🌅</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Stay mindful, stay healthy</Text>
          </View>

          {/* Inspirational Quote */}
          <DashboardCard style={styles.quoteCard}>
            <LinearGradient
              colors={isDarkMode ? ['#1E40AF', '#3B82F6'] : ['#2563EB', '#60A5FA']}
              style={styles.quoteGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.quoteContent}>
                <Quote size={24} color="rgba(255, 255, 255, 0.7)" style={styles.quoteIcon} />
                <Text style={styles.quoteText}>"{currentQuote.text}"</Text>
                <Text style={styles.quoteAuthor}>— {currentQuote.author}</Text>
              </View>
            </LinearGradient>
          </DashboardCard>

          {/* Daily Awards */}
          <DashboardCard style={styles.awardsCard}>
            <View style={styles.awardsSection}>
              <View style={styles.awardsHeader}>
                <View style={styles.awardsTitle}>
                  <Trophy size={24} color="#F59E0B" />
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Daily Awards</Text>
                </View>
                <View style={styles.awardsActions}>
                  {dailyGoals.length > 0 && (
                    <TouchableOpacity
                      style={[styles.deleteButton, showDeleteMode && styles.deleteButtonActive]}
                      onPress={toggleDeleteMode}
                    >
                      <Trash2 size={16} color={showDeleteMode ? "#FFFFFF" : "#EF4444"} />
                    </TouchableOpacity>
                  )}
                  {dailyGoals.length > 0 && (
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
                {dailyGoals.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    style={[styles.goalItem, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                    onPress={() => {
                      if (showDeleteMode) {
                        Alert.alert(
                          'Remove Goal',
                          `Remove "${goal.title}" from today's awards?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Remove', style: 'destructive', onPress: () => removeGoal(goal.id) },
                          ]
                        );
                      } else {
                      if (showDeleteMode) {
                        Alert.alert(
                          'Remove Goal',
                          `Remove "${goal.title}" from today's awards?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Remove', style: 'destructive', onPress: () => removeGoal(goal.id) },
                          ]
                        );
                      } else {
                        toggleGoalCompletion(goal.id);
                      }
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
                            <Text style={styles.pointsValue}>+{goal.points} pts</Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity
                  style={[styles.addGoalButton, { backgroundColor: isDarkMode ? '#1E293B' : '#EEF2FF', borderColor: isDarkMode ? '#334155' : '#E0E7FF' }]}
                  onPress={() => setShowAddGoalModal(true)}
                >
                  <Plus size={20} color="#4F46E5" />
                  <Text style={styles.addGoalText}>Add New Goal</Text>
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
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Daily Prize</Text>
                </View>
                <TouchableOpacity 
                  style={styles.editPrizeButton}
                  onPress={openPrizeModal}
                >
                  <Text style={styles.editPrizeText}>Edit</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.prizeContent}>
                <Text style={[styles.prizeDescription, { color: colors.textSecondary }]}>
                  Your reward for completing all daily tasks:
                </Text>
                <View style={[styles.prizeBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F0F9FF', borderColor: isDarkMode ? '#334155' : '#E0F2FE' }]}>
                  <Text style={[styles.prizeText, { color: isDarkMode ? '#60A5FA' : '#0369A1' }]}>{dailyPrize}</Text>
                </View>
                
                {/* Progress indicator */}
                <View style={styles.prizeProgress}>
                  <View style={styles.prizeProgressInfo}>
                    <Text style={[styles.prizeProgressText, { color: colors.textSecondary }]}>
                      {dailyGoals.filter(goal => goal.completed).length} / {dailyGoals.length} tasks completed
                    </Text>
                    {dailyGoals.length > 0 && dailyGoals.every(goal => goal.completed) && (
                      <Text style={styles.prizeEarnedText}>🎉 Prize Earned!</Text>
                    )}
                  </View>
                  <View style={[styles.prizeProgressBar, { backgroundColor: colors.border }]}>
                    <View 
                      style={[
                        styles.prizeProgressFill,
                        { width: `${(dailyGoals.filter(goal => goal.completed).length / dailyGoals.length) * 100}%` }
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
              <Text style={[styles.cardTitle, { color: colors.text }]}>Recent Activity</Text>
              {recentActivities.length > 0 ? (
                <View style={styles.activityList}>
                  {recentActivities.map((activity) => (
                    <View key={activity.id} style={styles.activityItem}>
                      <View style={[styles.activityDot, { backgroundColor: '#10B981' }]} />
                      <View style={styles.activityContent}>
                        <Text style={[styles.activityTitle, { color: colors.text }]}>{activity.title}</Text>
                        <Text style={[styles.activityTime, { color: colors.textSecondary }]}>{activity.completedAt}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyActivityContainer}>
                  <Text style={[styles.emptyActivityText, { color: colors.textSecondary }]}>
                    Complete your daily goals to see your achievements here! 🎯
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Goal</Text>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={addNewGoal}
              >
                <Text style={styles.saveButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Goal Description</Text>
                <TextInput
                  style={[styles.goalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  placeholder="e.g., Read for 30 minutes, No social media before noon..."
                  value={newGoalTitle}
                  onChangeText={setNewGoalTitle}
                  placeholderTextColor={colors.textTertiary}
                  multiline
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Difficulty Level</Text>
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
                <Text style={[styles.inputLabel, { color: colors.text }]}>Category</Text>
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
                <Text style={[styles.previewLabel, { color: colors.text }]}>Preview:</Text>
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Set Daily Prize</Text>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={updateDailyPrize}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Daily Reward( but not too much! )</Text>
                <Text style={[styles.prizeHint, { color: colors.textTertiary }]}>
                  Set a small reward for yourself when you complete all daily tasks
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
                <Text style={[styles.suggestionsTitle, { color: colors.text }]}>Popular Rewards:</Text>
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
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  quoteCard: {
    paddingHorizontal: 24,
    marginBottom: 24,
    padding: 0,
    overflow: 'hidden',
  },
  quoteGradient: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  quoteContent: {
    alignItems: 'center',
    position: 'relative',
  },
  quoteIcon: {
    position: 'absolute',
    top: -8,
    left: -8,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  quoteAuthor: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  progressSection: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  awardsCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  awardsSection: {
    padding: 20,
  },
  awardsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  awardsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  awardsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonActive: {
    backgroundColor: '#EF4444',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  goalsList: {
    marginTop: 16,
    gap: 16,
  },
  goalItem: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  goalTextCompleted: {
    textDecorationLine: 'line-through',
  },
  goalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pointsValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 8,
  },
  addGoalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
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
    padding: 20,
  },
  activityList: {
    marginTop: 16,
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 14,
  },
  emptyActivityContainer: {
    marginTop: 16,
    padding: 20,
    alignItems: 'center',
  },
  emptyActivityText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  prizeCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  prizeSection: {
    padding: 20,
  },
  prizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  prizeTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prizeIcon: {
    fontSize: 20,
  },
  editPrizeButton: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editPrizeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  prizeContent: {
    gap: 12,
  },
  prizeDescription: {
    fontSize: 14,
    fontWeight: '500',
  },
  prizeBox: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  prizeText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  prizeProgress: {
    gap: 8,
  },
  prizeProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prizeProgressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  prizeEarnedText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  prizeProgressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  prizeProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  prizeInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  prizeHint: {
    fontSize: 14,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  prizeSuggestions: {
    marginTop: 24,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  goalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  difficultySelector: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyOption: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  difficultyOptionText: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  difficultyOptionTextActive: {
    color: '#FFFFFF',
  },
  difficultyPoints: {
    fontSize: 14,
    fontWeight: '600',
  },
  difficultyPointsActive: {
    color: '#FFFFFF',
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  categoryOptionActive: {
    backgroundColor: '#4F46E5',
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryOptionTextActive: {
    color: '#FFFFFF',
  },
  previewSection: {
    marginTop: 24,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewGoal: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewDifficulty: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  previewDifficultyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  previewPoints: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  motivationalSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  motivationalQuote: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 26,
  },
  motivationalAuthor: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});