import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Play,
  Clock,
  Users,
  Heart,
  Leaf,
  Book,
  Music,
  Camera,
  Palette,
  Coffee,
  Mountain,
  Waves,
  Sun,
  Moon,
  TreePine,
  Flower,
  Star,
  ExternalLink,
  CheckCircle,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardCard } from '@/components/DashboardCard';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import { formatTime, Activity as FirebaseActivity, DatabaseService } from '@/lib/firebase-services';
import { getColors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '@/hooks/LanguageContext';

interface ActivityTemplate {
  id: number;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Physical' | 'Creative' | 'Social' | 'Mindful' | 'Learning';
  icon: any;
  color: string;
  benefits: string[];
  videoId?: string;
  videoTitle?: string;
  videoThumbnail?: string;
}

const activityTemplates: ActivityTemplate[] = [
  {
    id: 1,
    title: 'Nature Walk',
    description: 'Take a peaceful walk in a park, forest, or any natural setting. Focus on the sounds, smells, and sights around you.',
    duration: '20-60 minutes',
    difficulty: 'Easy',
    category: 'Physical',
    icon: TreePine,
    color: '#10B981',
    benefits: ['Reduces stress', 'Improves mood', 'Boosts creativity', 'Enhances focus'],
    videoId: '3oLculV1Od8',
    videoTitle: 'Benefits of Nature Walking - Mindful Movement',
    videoThumbnail: 'https://images.pexels.com/photos/1496373/pexels-photo-1496373.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 2,
    title: 'Journaling',
    description: 'Write down your thoughts, feelings, or daily experiences. Use prompts or free-write whatever comes to mind.',
    duration: '10-30 minutes',
    difficulty: 'Easy',
    category: 'Mindful',
    icon: Book,
    color: '#3B3B44',
    benefits: ['Improves self-awareness', 'Reduces anxiety', 'Enhances memory', 'Clarifies thoughts'],
    videoId: 'U2_cDF3GCzM',
    videoTitle: 'How to Start Journaling - A Beginner\'s Guide',
    videoThumbnail: 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 3,
    title: 'Cooking a New Recipe',
    description: 'Try cooking something you\'ve never made before. Focus on the process, ingredients, and flavors.',
    duration: '30-90 minutes',
    difficulty: 'Medium',
    category: 'Creative',
    icon: Coffee,
    color: '#F59E0B',
    benefits: ['Develops creativity', 'Improves focus', 'Provides satisfaction', 'Nourishes body'],
    videoId: 'CJauy8hpANQ',
    videoTitle: 'Mindful Cooking - Being Present in the Kitchen',
    videoThumbnail: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 4,
    title: 'Drawing or Sketching',
    description: 'Create art with pencil, pen, or any drawing materials. Draw from observation or imagination.',
    duration: '15-60 minutes',
    difficulty: 'Easy',
    category: 'Creative',
    icon: Palette,
    color: '#3F3F46',
    benefits: ['Enhances creativity', 'Improves focus', 'Reduces stress', 'Develops observation skills'],
    videoId: 'Zi4bsTqe3Lk',
    videoTitle: 'Drawing for Beginners - Mindful Art Practice',
    videoThumbnail: 'https://images.pexels.com/photos/1053687/pexels-photo-1053687.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 5,
    title: 'Reading a Book',
    description: 'Immerse yourself in a physical book. Choose fiction, non-fiction, poetry, or any genre you enjoy.',
    duration: '20-120 minutes',
    difficulty: 'Easy',
    category: 'Learning',
    icon: Book,
    color: '#06B6D4',
    benefits: ['Expands knowledge', 'Improves vocabulary', 'Reduces stress', 'Enhances empathy'],
    videoId: 'ShdRyZDFx4U',
    videoTitle: 'The Benefits of Reading Physical Books',
    videoThumbnail: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 6,
    title: 'Gardening',
    description: 'Plant, water, or tend to plants. Even indoor plants or herbs on a windowsill count!',
    duration: '15-90 minutes',
    difficulty: 'Medium',
    category: 'Physical',
    icon: Flower,
    color: '#10B981',
    benefits: ['Connects with nature', 'Provides physical activity', 'Reduces stress', 'Grows food/beauty'],
    videoId: 'pLQuIuokP6Q',
    videoTitle: 'Therapeutic Gardening - Growing Wellness',
    videoThumbnail: 'https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 7,
    title: 'Call a Friend or Family',
    description: 'Have a meaningful conversation with someone you care about. Listen actively and share genuinely.',
    duration: '15-60 minutes',
    difficulty: 'Easy',
    category: 'Social',
    icon: Heart,
    color: '#EF4444',
    benefits: ['Strengthens relationships', 'Reduces loneliness', 'Improves mood', 'Builds support network'],
    videoId: 'DHe6FNDRKuA',
    videoTitle: 'The Importance of Human Connection',
    videoThumbnail: 'https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 8,
    title: 'Learn a Musical Instrument',
    description: 'Practice guitar, piano, ukulele, or any instrument. Even 15 minutes of practice makes a difference.',
    duration: '15-60 minutes',
    difficulty: 'Hard',
    category: 'Creative',
    icon: Music,
    color: '#F59E0B',
    benefits: ['Enhances cognitive function', 'Improves coordination', 'Provides creative outlet', 'Builds discipline'],
    videoId: '8DbcKNaAKHY',
    videoTitle: 'Learning Music - Benefits for Mind and Soul',
    videoThumbnail: 'https://images.pexels.com/photos/1751731/pexels-photo-1751731.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

const categories = [
  { id: 'all', name: 'All Activities', color: '#6B7280' },
  { id: 'Physical', name: 'Physical', color: '#10B981' },
  { id: 'Creative', name: 'Creative', color: '#3F3F46' },
  { id: 'Social', name: 'Social', color: '#EF4444' },
  { id: 'Mindful', name: 'Mindful', color: '#3B3B44' },
  { id: 'Learning', name: 'Learning', color: '#06B6D4' },
];

const difficultyColors = {
  Easy: '#10B981',
  Medium: '#F59E0B',
  Hard: '#EF4444',
};

export default function ActivitiesScreen() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { activities, userProfile } = useFirebaseData();
  const colors = getColors(isDarkMode);
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);
  const [userAddictionLevel, setUserAddictionLevel] = useState<'low' | 'moderate' | 'high' | null>(null);
  const [randomSuggestedActivity, setRandomSuggestedActivity] = useState<ActivityTemplate | null>(null);

  const selectRandomActivity = () => {
    // Select a random activity from the templates
    const randomIndex = Math.floor(Math.random() * activityTemplates.length);
    setRandomSuggestedActivity(activityTemplates[randomIndex]);
  };

  useEffect(() => {
    loadUserAddictionLevel();
    selectRandomActivity();
  }, [user]);

  const loadUserAddictionLevel = async () => {
    if (!user) return;

    try {
      // For now, use a simple calculation based on user's total points
      // In a real app, this could be more sophisticated
      const totalPoints = userProfile?.totalPoints || 0;
      let level: 'low' | 'moderate' | 'high';

      if (totalPoints < 100) {
        level = 'high'; // New users likely need more help
      } else if (totalPoints < 500) {
        level = 'moderate';
      } else {
        level = 'low';
      }

      setUserAddictionLevel(level);
    } catch (error) {
      console.log('Error determining addiction level:', error);
    }
  };

  const getRecommendedActivities = () => {
    if (!userAddictionLevel) return activityTemplates;

    switch (userAddictionLevel) {
      case 'low':
        // Light activities for users with low digital dependency
        return activityTemplates.filter(activity =>
          activity.difficulty === 'Easy' &&
          ['Creative', 'Learning', 'Mindful'].includes(activity.category)
        );
      case 'moderate':
        // Structured activities for moderate users
        return activityTemplates.filter(activity =>
          ['Easy', 'Medium'].includes(activity.difficulty) &&
          ['Physical', 'Creative', 'Social'].includes(activity.category)
        );
      case 'high':
        // Intensive activities for high dependency users
        return activityTemplates.filter(activity =>
          ['Medium', 'Hard'].includes(activity.difficulty) &&
          ['Physical', 'Mindful'].includes(activity.category)
        );
      default:
        return activityTemplates;
    }
  };
  const recommendedActivities = getRecommendedActivities();
  const filteredActivities = selectedCategory === 'all'
    ? recommendedActivities
    : recommendedActivities.filter(activity => activity.category === selectedCategory);

  // Get user's completed activities for display
  const userCompletedActivities = activities.map(firebaseActivity => {
    const templateActivity = activityTemplates.find(template => template.title === firebaseActivity.title);
    return templateActivity ? { ...templateActivity, completedAt: firebaseActivity.completedAt } : null;
  }).filter(Boolean);

  const openYouTubeVideo = async (videoId: string, videoTitle: string) => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const supported = await Linking.canOpenURL(youtubeUrl);
    
    if (supported) {
      await Linking.openURL(youtubeUrl);
    } else {
      Alert.alert(
        'Unable to open video',
        `Please search for "${videoTitle}" on YouTube manually.`,
        [{ text: 'OK' }]
      );
    }
  };

  const toggleActivityExpansion = (activityId: number) => {
    setExpandedActivity(expandedActivity === activityId ? null : activityId);
  };

  const completeActivity = async (activity: ActivityTemplate) => {
    if (!user) {
      Alert.alert(t('error'), t('failedToUpdateProfile'));
      return;
    }

    try {
      // Add activity to Firebase
      await DatabaseService.addActivity({
        userId: user.uid,
        title: activity.title,
        completedAt: new Date() as any, // Firebase Timestamp
        points: activity.difficulty === 'Easy' ? 10 : activity.difficulty === 'Medium' ? 20 : 30
      });

      Alert.alert(
        t('activityCompleted'),
        `${t('success')} completing "${activity.title}"! ${t('pointsEarned')} ${activity.difficulty === 'Easy' ? 10 : activity.difficulty === 'Medium' ? 20 : 30} ${t('points')}.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error completing activity:', error);
      Alert.alert(t('error'), t('failedToUpdateProfile'));
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
            <Text style={[styles.title, { color: colors.text }]}>{t('activities')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {userAddictionLevel
                ? `${t('personalizedActivities')} ${userAddictionLevel} ${t('digitalDependencyLevel')}`
                : t('discoverOfflineActivities')
              }
            </Text>
          </View>

          {/* Personalization Notice */}
          {userAddictionLevel && (
            <View style={styles.personalizationNotice}>
              <DashboardCard style={styles.noticeCard}>
                <View style={styles.noticeContent}>
                  <Text style={styles.noticeIcon}>
                    {userAddictionLevel === 'low' ? '🌱' : 
                     userAddictionLevel === 'moderate' ? '⚖️' : '🚨'}
                  </Text>
                  <View style={styles.noticeText}>
                    <Text style={[styles.noticeTitle, { color: colors.text }]}>
                      {t('personalizedForYou')}
                    </Text>
                    <Text style={[styles.noticeDescription, { color: colors.textSecondary }]}>
                      {t('wellnessAssessmentRecommendation')}
                    </Text>
                  </View>
                </View>
              </DashboardCard>
            </View>
          )}

          {/* Random Suggested Activity */}
          {randomSuggestedActivity && (
            <View style={styles.featuredContainer}>
              <DashboardCard style={styles.featuredCard}>
                <LinearGradient
                  colors={
                    randomSuggestedActivity.color === '#10B981' ? (isDarkMode ? ['#047857', '#065F46'] : ['#10B981', '#059669']) :
                    randomSuggestedActivity.color === '#3B3B44' ? (isDarkMode ? ['#3730A3', '#312E81'] : ['#3B3B44', '#4338CA']) :
                    randomSuggestedActivity.color === '#F59E0B' ? (isDarkMode ? ['#D97706', '#B45309'] : ['#F59E0B', '#D97706']) :
                    randomSuggestedActivity.color === '#3F3F46' ? (isDarkMode ? ['#6D28D9', '#5B21B6'] : ['#3F3F46', '#27272A']) :
                    randomSuggestedActivity.color === '#06B6D4' ? (isDarkMode ? ['#0891B2', '#0E7490'] : ['#06B6D4', '#0891B2']) :
                    randomSuggestedActivity.color === '#EF4444' ? (isDarkMode ? ['#DC2626', '#B91C1C'] : ['#EF4444', '#DC2626']) :
                    (isDarkMode ? ['#047857', '#065F46'] : ['#10B981', '#059669'])
                  }
                  style={styles.featuredGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.featuredContent}>
                    <View style={styles.featuredText}>
                      <View style={styles.randomBadge}>
                        <Text style={styles.randomBadgeText}>🎲 Random Suggestion</Text>
                      </View>
                      <Text style={styles.featuredTitle}>{randomSuggestedActivity.title}</Text>
                      <Text style={styles.featuredSubtitle}>
                        {randomSuggestedActivity.category} • {randomSuggestedActivity.duration}
                      </Text>
                      <Text style={styles.featuredDescription}>
                        {randomSuggestedActivity.description.length > 100 
                          ? randomSuggestedActivity.description.substring(0, 100) + '...' 
                          : randomSuggestedActivity.description}
                      </Text>
                      <TouchableOpacity 
                        style={styles.refreshButton}
                        onPress={selectRandomActivity}
                      >
                        <Text style={styles.refreshButtonText}>↻ Get Another Suggestion</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.featuredIcon}>
                      {React.createElement(randomSuggestedActivity.icon, { size: 48, color: "#FFFFFF" })}
                    </View>
                  </View>
                </LinearGradient>
              </DashboardCard>
            </View>
          )}

          {/* Category Filter */}
          <View style={styles.categoriesContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    { backgroundColor: colors.cardBackground, borderColor: colors.border },
                    selectedCategory === category.id && {
                      backgroundColor: category.color,
                      borderColor: category.color,
                    }
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={[
                    styles.categoryText,
                    { color: selectedCategory === category.id ? '#FFFFFF' : colors.textSecondary },
                    selectedCategory === category.id && styles.categoryTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Activities List */}
          <View style={styles.activitiesContainer}>
            {filteredActivities.map((activity) => {
              const activityData = activity as any; // Type assertion for static activity data
              const IconComponent = activityData.icon;
              const isExpanded = expandedActivity === activityData.id;

              return (
                <DashboardCard key={activityData.id} style={styles.activityCard}>
                  <TouchableOpacity
                    style={styles.activityHeader}
                    onPress={() => toggleActivityExpansion(activityData.id)}
                  >
                    <View style={[styles.activityIcon, { backgroundColor: activityData.color }]}>
                      <IconComponent size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={[styles.activityTitle, { color: colors.text }]}>{activityData.title}</Text>
                      <View style={styles.activityMeta}>
                        <View style={[
                          styles.difficultyBadge,
                          { backgroundColor: difficultyColors[activityData.difficulty as keyof typeof difficultyColors] }
                        ]}>
                          <Text style={styles.difficultyText}>{activityData.difficulty}</Text>
                        </View>
                        <View style={styles.durationContainer}>
                          <Clock size={14} color={colors.textSecondary} />
                          <Text style={[styles.durationText, { color: colors.textSecondary }]}>{activityData.duration}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.activityDetails}>
                      <Text style={[styles.activityDescription, { color: colors.text }]}>{activityData.description}</Text>

                      <View style={styles.benefitsSection}>
                        <Text style={[styles.benefitsTitle, { color: colors.text }]}>Benefits:</Text>
                        <View style={styles.benefitsList}>
                          {activityData.benefits.map((benefit: string, index: number) => (
                            <View key={index} style={styles.benefitItem}>
                              <Star size={12} color={activityData.color} />
                              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>{benefit}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {activityData.videoId && (
                        <View style={styles.videoSection}>
                          <Text style={[styles.videoSectionTitle, { color: colors.text }]}>Learn More:</Text>
                          <TouchableOpacity
                            style={[styles.videoCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={() => openYouTubeVideo(activityData.videoId, activityData.videoTitle)}
                          >
                            <Image
                              source={{ uri: activityData.videoThumbnail }}
                              style={styles.videoThumbnail}
                            />
                            <View style={styles.videoOverlay}>
                              <Play size={24} color="#FFFFFF" />
                            </View>
                            <View style={styles.videoInfo}>
                              <Text style={[styles.videoTitle, { color: colors.text }]}>{activityData.videoTitle}</Text>
                              <View style={styles.videoMeta}>
                                <ExternalLink size={14} color={colors.textSecondary} />
                                <Text style={[styles.videoSource, { color: colors.textSecondary }]}>Watch on YouTube</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* Complete Activity Button */}
                      <TouchableOpacity
                        style={[styles.completeButton, { backgroundColor: activityData.color }]}
                        onPress={() => completeActivity(activityData)}
                      >
                        <CheckCircle size={20} color="#FFFFFF" />
                        <Text style={styles.completeButtonText}>Mark as Complete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </DashboardCard>
              );
            })}
          </View>

          {/* User's Completed Activities */}
          {user && activities.length > 0 && (
            <View style={styles.completedSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('yourCompletedActivities')}
              </Text>
              <View style={styles.activitiesContainer}>
                {activities.slice(0, 3).map((firebaseActivity, index) => {
                  // Find matching template activity for icon and color
                  const templateActivity = activityTemplates.find(template => template.title === firebaseActivity.title);

                  return (
                    <DashboardCard key={`completed-${firebaseActivity.id}`} style={styles.completedActivityCard}>
                      <View style={styles.completedActivityHeader}>
                        <View style={[styles.activityIcon, { backgroundColor: templateActivity?.color || '#6B7280' }]}>
                          {templateActivity?.icon ? (
                            React.createElement(templateActivity.icon, { size: 24, color: "#FFFFFF" })
                          ) : (
                            <TreePine size={24} color="#FFFFFF" />
                          )}
                        </View>
                        <View style={styles.activityInfo}>
                          <Text style={[styles.activityTitle, { color: colors.text }]}>
                            {firebaseActivity.title || 'Unknown Activity'}
                          </Text>
                          <Text style={[styles.completedDate, { color: colors.textSecondary }]}>
                            Completed {formatTime(firebaseActivity.completedAt)}
                          </Text>
                        </View>
                        <View style={styles.completedBadge}>
                          <CheckCircle size={20} color="#10B981" />
                        </View>
                      </View>
                    </DashboardCard>
                  );
                })}
              </View>
            </View>
          )}

          {/* Daily Challenge */}
          <View style={styles.challengeContainer}>
            <DashboardCard>
              <View style={styles.challengeContent}>
                <Text style={[styles.challengeTitle, { color: colors.text }]}>{t('todaysChallenge')}</Text>
                <Text style={[styles.challengeDescription, { color: colors.textSecondary }]}>
                  {t('tryNewActivity')}
                </Text>
                <View style={styles.challengeStats}>
                  <View style={styles.challengeStat}>
                    <Text style={styles.challengeStatValue}>3</Text>
                    <Text style={[styles.challengeStatLabel, { color: colors.textSecondary }]}>{t('activitiesTried')}</Text>
                  </View>
                  <View style={styles.challengeStat}>
                    <Text style={styles.challengeStatValue}>45</Text>
                    <Text style={[styles.challengeStatLabel, { color: colors.textSecondary }]}>{t('minutesOffline')}</Text>
                  </View>
                </View>
              </View>
            </DashboardCard>
          </View>
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
  featuredContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  featuredCard: {
    padding: 0,
    overflow: 'hidden',
  },
  featuredGradient: {
    padding: 24,
  },
  featuredContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredText: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  featuredIcon: {
    opacity: 0.3,
  },
  randomBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  randomBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesScroll: {
    paddingHorizontal: 24,
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  activitiesContainer: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  activityCard: {
    padding: 0,
    overflow: 'hidden',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityDetails: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  activityDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  benefitsSection: {
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  benefitsList: {
    gap: 6,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
  },
  videoSection: {
    marginTop: 8,
  },
  videoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  videoCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  videoThumbnail: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  videoOverlay: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    bottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoSource: {
    fontSize: 12,
  },
  challengeContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  challengeContent: {
    padding: 20,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  challengeStat: {
    alignItems: 'center',
  },
  challengeStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  challengeStatLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  personalizationNotice: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  noticeCard: {
    padding: 16,
  },
  noticeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  noticeIcon: {
    fontSize: 24,
  },
  noticeText: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  noticeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  completedSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  completedActivityCard: {
    padding: 0,
    overflow: 'hidden',
  },
  completedActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  completedDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  completedBadge: {
    marginLeft: 'auto',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});