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
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardCard } from '@/components/DashboardCard';
import { useDarkMode } from '@/hooks/useDarkMode';
import { getColors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Activity {
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

const activities: Activity[] = [
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
    color: '#4F46E5',
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
    color: '#8B5CF6',
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
  { id: 'Creative', name: 'Creative', color: '#8B5CF6' },
  { id: 'Social', name: 'Social', color: '#EF4444' },
  { id: 'Mindful', name: 'Mindful', color: '#4F46E5' },
  { id: 'Learning', name: 'Learning', color: '#06B6D4' },
];

const difficultyColors = {
  Easy: '#10B981',
  Medium: '#F59E0B',
  Hard: '#EF4444',
};

export default function ActivitiesScreen() {
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);
  const [userAddictionLevel, setUserAddictionLevel] = useState<'low' | 'moderate' | 'high' | null>(null);

  useEffect(() => {
    loadUserAddictionLevel();
  }, []);

  const loadUserAddictionLevel = async () => {
    try {
      const level = await AsyncStorage.getItem('addictionLevel');
      if (level) {
        setUserAddictionLevel(level as 'low' | 'moderate' | 'high');
      }
    } catch (error) {
      console.log('Error loading addiction level:', error);
    }
  };

  const getRecommendedActivities = () => {
    if (!userAddictionLevel) return activities;
    
    switch (userAddictionLevel) {
      case 'low':
        // Light activities for users with low digital dependency
        return activities.filter(activity => 
          activity.difficulty === 'Easy' && 
          ['Creative', 'Learning', 'Mindful'].includes(activity.category)
        );
      case 'moderate':
        // Structured activities for moderate users
        return activities.filter(activity => 
          ['Easy', 'Medium'].includes(activity.difficulty) &&
          ['Physical', 'Creative', 'Social'].includes(activity.category)
        );
      case 'high':
        // Intensive activities for high dependency users
        return activities.filter(activity => 
          ['Medium', 'Hard'].includes(activity.difficulty) &&
          ['Physical', 'Mindful'].includes(activity.category)
        );
      default:
        return activities;
    }
  };
  const recommendedActivities = getRecommendedActivities();
  const filteredActivities = selectedCategory === 'all' 
    ? recommendedActivities 
    : recommendedActivities.filter(activity => activity.category === selectedCategory);

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
            <Text style={[styles.title, { color: colors.text }]}>Device-Free Activities</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {userAddictionLevel 
                ? `Personalized activities for your ${userAddictionLevel} digital dependency level`
                : 'Discover meaningful ways to spend your time offline'
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
                      Personalized for You
                    </Text>
                    <Text style={[styles.noticeDescription, { color: colors.textSecondary }]}>
                      These activities are recommended based on your digital wellness assessment
                    </Text>
                  </View>
                </View>
              </DashboardCard>
            </View>
          )}

          {/* Featured Activity */}
          <View style={styles.featuredContainer}>
            <DashboardCard style={styles.featuredCard}>
              <LinearGradient
                colors={isDarkMode ? ['#047857', '#065F46'] : ['#10B981', '#059669']}
                style={styles.featuredGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.featuredContent}>
                  <View style={styles.featuredText}>
                    <Text style={styles.featuredTitle}>Activity of the Day</Text>
                    <Text style={styles.featuredSubtitle}>
                      Take a 20-minute nature walk
                    </Text>
                    <Text style={styles.featuredDescription}>
                      Step outside and reconnect with the natural world around you
                    </Text>
                  </View>
                  <View style={styles.featuredIcon}>
                    <TreePine size={48} color="#FFFFFF" />
                  </View>
                </View>
              </LinearGradient>
            </DashboardCard>
          </View>

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
              const IconComponent = activity.icon;
              const isExpanded = expandedActivity === activity.id;
              
              return (
                <DashboardCard key={activity.id} style={styles.activityCard}>
                  <TouchableOpacity
                    style={styles.activityHeader}
                    onPress={() => toggleActivityExpansion(activity.id)}
                  >
                    <View style={[styles.activityIcon, { backgroundColor: activity.color }]}>
                      <IconComponent size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={[styles.activityTitle, { color: colors.text }]}>{activity.title}</Text>
                      <View style={styles.activityMeta}>
                        <View style={[
                          styles.difficultyBadge,
                          { backgroundColor: difficultyColors[activity.difficulty] }
                        ]}>
                          <Text style={styles.difficultyText}>{activity.difficulty}</Text>
                        </View>
                        <View style={styles.durationContainer}>
                          <Clock size={14} color={colors.textSecondary} />
                          <Text style={[styles.durationText, { color: colors.textSecondary }]}>{activity.duration}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.activityDetails}>
                      <Text style={[styles.activityDescription, { color: colors.text }]}>{activity.description}</Text>
                      
                      <View style={styles.benefitsSection}>
                        <Text style={[styles.benefitsTitle, { color: colors.text }]}>Benefits:</Text>
                        <View style={styles.benefitsList}>
                          {activity.benefits.map((benefit, index) => (
                            <View key={index} style={styles.benefitItem}>
                              <Star size={12} color={activity.color} />
                              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>{benefit}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {activity.videoId && (
                        <View style={styles.videoSection}>
                          <Text style={[styles.videoSectionTitle, { color: colors.text }]}>Learn More:</Text>
                          <TouchableOpacity
                            style={[styles.videoCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={() => openYouTubeVideo(activity.videoId!, activity.videoTitle!)}
                          >
                            <Image 
                              source={{ uri: activity.videoThumbnail }} 
                              style={styles.videoThumbnail}
                            />
                            <View style={styles.videoOverlay}>
                              <Play size={24} color="#FFFFFF" />
                            </View>
                            <View style={styles.videoInfo}>
                              <Text style={[styles.videoTitle, { color: colors.text }]}>{activity.videoTitle}</Text>
                              <View style={styles.videoMeta}>
                                <ExternalLink size={14} color={colors.textSecondary} />
                                <Text style={[styles.videoSource, { color: colors.textSecondary }]}>Watch on YouTube</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </DashboardCard>
              );
            })}
          </View>

          {/* Daily Challenge */}
          <View style={styles.challengeContainer}>
            <DashboardCard>
              <View style={styles.challengeContent}>
                <Text style={[styles.challengeTitle, { color: colors.text }]}>Today's Challenge</Text>
                <Text style={[styles.challengeDescription, { color: colors.textSecondary }]}>
                  Try one new activity from the list above for at least 15 minutes. 
                  Notice how you feel before and after!
                </Text>
                <View style={styles.challengeStats}>
                  <View style={styles.challengeStat}>
                    <Text style={styles.challengeStatValue}>3</Text>
                    <Text style={[styles.challengeStatLabel, { color: colors.textSecondary }]}>Activities Tried</Text>
                  </View>
                  <View style={styles.challengeStat}>
                    <Text style={styles.challengeStatValue}>45</Text>
                    <Text style={[styles.challengeStatLabel, { color: colors.textSecondary }]}>Minutes Offline</Text>
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
});