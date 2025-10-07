import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Medal, Crown, Star, TrendingUp, Users, Target, Calendar, Award, Zap, Siren as Fire, ChevronUp, ChevronDown } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardCard } from '@/components/DashboardCard';
import { useDarkMode } from '@/hooks/useDarkMode';
import { getColors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

interface User {
  id: number;
  name: string;
  avatar: string;
  points: number;
  rank: number;
  level: string;
  streak: number;
  country: string;
  weeklyChange: number;
  badges: string[];
}

const initialLeaderboard: User[] = [
  {
    id: 1,
    name: 'Alex Chen',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    points: 3245,
    rank: 1,
    level: 'Digital Master',
    streak: 28,
    country: '🇺🇸',
    weeklyChange: 12,
    badges: ['🏆', '🔥', '⭐']
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    points: 2987,
    rank: 2,
    level: 'Focus Expert',
    streak: 21,
    country: '🇨🇦',
    weeklyChange: 8,
    badges: ['🥈', '🎯', '💪']
  },
  {
    id: 3,
    name: 'Marcus Williams',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    points: 2756,
    rank: 3,
    level: 'Mindful Warrior',
    streak: 19,
    country: '🇬🇧',
    weeklyChange: 5,
    badges: ['🥉', '🧘', '🌟']
  },
  {
    id: 4,
    name: 'You',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    points: 2156,
    rank: 4,
    level: 'Digital Warrior',
    streak: 15,
    country: '🇺🇸',
    weeklyChange: 3,
    badges: ['🎯', '💎', '🚀']
  },
  {
    id: 5,
    name: 'Emma Davis',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150',
    points: 1987,
    rank: 5,
    level: 'Focus Seeker',
    streak: 12,
    country: '🇦🇺',
    weeklyChange: -2,
    badges: ['🌱', '📚', '✨']
  },
  {
    id: 6,
    name: 'David Kim',
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
    points: 1834,
    rank: 6,
    level: 'Mindful Beginner',
    streak: 9,
    country: '🇰🇷',
    weeklyChange: 1,
    badges: ['🌿', '🎨', '🏃']
  },
  {
    id: 7,
    name: 'Lisa Rodriguez',
    avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=150',
    points: 1672,
    rank: 7,
    level: 'Digital Explorer',
    streak: 7,
    country: '🇪🇸',
    weeklyChange: -1,
    badges: ['🗺️', '🌸', '💫']
  },
  {
    id: 8,
    name: 'James Wilson',
    avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150',
    points: 1543,
    rank: 8,
    level: 'Focus Apprentice',
    streak: 5,
    country: '🇳🇿',
    weeklyChange: 4,
    badges: ['🎪', '🎭', '🎨']
  }
];

const timeframes = [
  { id: 'daily', name: 'Today' },
  { id: 'weekly', name: 'This Week' },
  { id: 'monthly', name: 'This Month' },
  { id: 'alltime', name: 'All Time' },
];

const categories = [
  { id: 'global', name: 'Global', icon: Users },
  { id: 'friends', name: 'Friends', icon: Star },
  { id: 'country', name: 'Country', icon: Target },
];

export default function RankingsScreen() {
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);
  const [leaderboard, setLeaderboard] = useState<User[]>(initialLeaderboard);
  const [selectedTimeframe, setSelectedTimeframe] = useState('weekly');
  const [selectedCategory, setSelectedCategory] = useState('global');
  const [userPoints, setUserPoints] = useState(2156);

  // Load user's current points from Daily Awards
  useEffect(() => {
    const loadUserPoints = () => {
      try {
        // Get points from global storage (in a real app, this would be from AsyncStorage or API)
        const dailyPoints = global.userDailyPoints || 0;
        // Add daily points to existing total (simulating cumulative scoring)
        const totalPoints = 2156 + dailyPoints;
        setUserPoints(totalPoints);
        
        // Update the current user in the leaderboard state
        setLeaderboard(prevLeaderboard => {
          const updatedLeaderboard = [...prevLeaderboard];
          const userIndex = updatedLeaderboard.findIndex(user => user.name === 'You');
          if (userIndex !== -1) {
            updatedLeaderboard[userIndex].points = totalPoints;
            
            // Recalculate rank based on new points
            const sortedUsers = [...updatedLeaderboard].sort((a, b) => b.points - a.points);
            const newRank = sortedUsers.findIndex(user => user.name === 'You') + 1;
            updatedLeaderboard[userIndex].rank = newRank;
          }
          return updatedLeaderboard;
        });
      } catch (error) {
        console.log('Error loading user points:', error);
      }
    };

    loadUserPoints();
    
    // Set up interval to check for point updates
    const interval = setInterval(loadUserPoints, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentUser = leaderboard.find(user => user.name === 'You');
  const topUsers = leaderboard.slice(0, 3);
  const otherUsers = leaderboard.slice(3);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} color="#FFD700" />;
      case 2:
        return <Medal size={24} color="#C0C0C0" />;
      case 3:
        return <Medal size={24} color="#CD7F32" />;
      default:
        return (
          <View style={styles.rankNumber}>
            <Text style={styles.rankNumberText}>{rank}</Text>
          </View>
        );
    }
  };

  const getRankColors = (rank: number) => {
    switch (rank) {
      case 1:
        return ['#FFD700', '#FFA500'];
      case 2:
        return ['#C0C0C0', '#A8A8A8'];
      case 3:
        return ['#CD7F32', '#B8860B'];
      default:
        return ['#6B7280', '#9CA3AF'];
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
            <Text style={[styles.title, { color: colors.text }]}>Rankings</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Compete with users worldwide</Text>
          </View>

          {/* Your Rank Card */}
          {currentUser && (
            <DashboardCard style={styles.yourRankCard}>
              <LinearGradient
                colors={isDarkMode ? ['#3730A3', '#4338CA'] : ['#4F46E5', '#6366F1']}
                style={styles.yourRankGradient}
              >
                <View style={styles.yourRankContent}>
                  <View style={styles.yourRankLeft}>
                    <Text style={styles.yourRankTitle}>Your Rank</Text>
                    <View style={styles.yourRankInfo}>
                      <Text style={styles.yourRankPosition}>#{currentUser.rank}</Text>
                      <View style={styles.yourRankChange}>
                        {currentUser.weeklyChange > 0 ? (
                          <ChevronUp size={16} color="#10B981" />
                        ) : (
                          <ChevronDown size={16} color="#EF4444" />
                        )}
                        <Text style={[
                          styles.yourRankChangeText,
                          { color: currentUser.weeklyChange > 0 ? '#10B981' : '#EF4444' }
                        ]}>
                          {Math.abs(currentUser.weeklyChange)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.yourRankPoints}>{userPoints} points</Text>
                  </View>
                  <View style={styles.yourRankRight}>
                    <Image source={{ uri: currentUser.avatar }} style={styles.yourRankAvatar} />
                    <View style={styles.yourRankBadges}>
                      {currentUser.badges.map((badge, index) => (
                        <Text key={index} style={styles.badge}>{badge}</Text>
                      ))}
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </DashboardCard>
          )}

          {/* Timeframe Selector */}
          <View style={styles.timeframeContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.timeframeScroll}
            >
              {timeframes.map((timeframe) => (
                <TouchableOpacity
                  key={timeframe.id}
                  style={[
                    styles.timeframeButton,
                    { backgroundColor: colors.cardBackground, borderColor: colors.border },
                    selectedTimeframe === timeframe.id && styles.timeframeButtonActive
                  ]}
                  onPress={() => setSelectedTimeframe(timeframe.id)}
                >
                  <Text style={[
                    styles.timeframeText,
                    { color: selectedTimeframe === timeframe.id ? '#FFFFFF' : colors.textSecondary },
                    selectedTimeframe === timeframe.id && styles.timeframeTextActive
                  ]}>
                    {timeframe.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Category Selector */}
          <View style={styles.categoryContainer}>
            <View style={styles.categoryButtons}>
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      { backgroundColor: colors.cardBackground, borderColor: colors.border },
                      selectedCategory === category.id && styles.categoryButtonActive
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <IconComponent 
                      size={20} 
                      color={selectedCategory === category.id ? '#FFFFFF' : '#6B7280'} 
                    />
                    <Text style={[
                      styles.categoryText,
                      { color: selectedCategory === category.id ? '#FFFFFF' : colors.textSecondary },
                      selectedCategory === category.id && styles.categoryTextActive
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Top 3 Podium */}
          <View style={styles.podiumContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Champions</Text>
            <View style={styles.podium}>
              {/* 2nd Place */}
              <View style={[styles.podiumPlace, styles.secondPlace]}>
                <LinearGradient
                  colors={isDarkMode ? ['#9CA3AF', '#6B7280'] : getRankColors(2)}
                  style={styles.podiumGradient}
                >
                  <Image source={{ uri: topUsers[1].avatar }} style={styles.podiumAvatar} />
                  <Medal size={20} color="#C0C0C0" />
                  <Text style={styles.podiumName}>{topUsers[1].name}</Text>
                  <Text style={styles.podiumPoints}>{topUsers[1].points}</Text>
                </LinearGradient>
              </View>

              {/* 1st Place */}
              <View style={[styles.podiumPlace, styles.firstPlace]}>
                <LinearGradient
                  colors={isDarkMode ? ['#F59E0B', '#D97706'] : getRankColors(1)}
                  style={styles.podiumGradient}
                >
                  <Image source={{ uri: topUsers[0].avatar }} style={styles.podiumAvatar} />
                  <Crown size={24} color="#FFD700" />
                  <Text style={styles.podiumName}>{topUsers[0].name}</Text>
                  <Text style={styles.podiumPoints}>{topUsers[0].points}</Text>
                  <View style={styles.crownEffect}>
                    <Star size={12} color="#FFD700" />
                  </View>
                </LinearGradient>
              </View>

              {/* 3rd Place */}
              <View style={[styles.podiumPlace, styles.thirdPlace]}>
                <LinearGradient
                  colors={isDarkMode ? ['#CD7F32', '#A0522D'] : getRankColors(3)}
                  style={styles.podiumGradient}
                >
                  <Image source={{ uri: topUsers[2].avatar }} style={styles.podiumAvatar} />
                  <Medal size={20} color="#CD7F32" />
                  <Text style={styles.podiumName}>{topUsers[2].name}</Text>
                  <Text style={styles.podiumPoints}>{topUsers[2].points}</Text>
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Leaderboard */}
          <View style={styles.leaderboardContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Leaderboard</Text>
            <DashboardCard>
              <View style={styles.leaderboardContent}>
                {otherUsers.map((user) => (
                  <View 
                    key={user.id} 
                    style={[
                      styles.leaderboardItem,
                      user.name === 'You' && [styles.currentUserItem, { backgroundColor: isDarkMode ? '#1E293B' : '#EEF2FF' }]
                    ]}
                  >
                    <View style={styles.leaderboardLeft}>
                      {getRankIcon(user.rank)}
                      <Image source={{ uri: user.avatar }} style={styles.leaderboardAvatar} />
                      <View style={styles.leaderboardInfo}>
                        <View style={styles.leaderboardNameRow}>
                          <Text style={[
                            styles.leaderboardName,
                            { color: colors.text },
                            user.name === 'You' && styles.currentUserName
                          ]}>
                            {user.name}
                          </Text>
                          <Text style={styles.leaderboardCountry}>{user.country}</Text>
                        </View>
                        <Text style={[styles.leaderboardLevel, { color: colors.textSecondary }]}>{user.level}</Text>
                        <View style={styles.leaderboardMeta}>
                          <Fire size={12} color="#F59E0B" />
                          <Text style={styles.leaderboardStreak}>{user.streak} days</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.leaderboardRight}>
                      <Text style={[styles.leaderboardPoints, { color: colors.text }]}>{user.points}</Text>
                      <View style={styles.leaderboardChange}>
                        {user.weeklyChange > 0 ? (
                          <ChevronUp size={14} color="#10B981" />
                        ) : user.weeklyChange < 0 ? (
                          <ChevronDown size={14} color="#EF4444" />
                        ) : null}
                        <Text style={[
                          styles.leaderboardChangeText,
                          { 
                            color: user.weeklyChange > 0 ? '#10B981' : 
                                   user.weeklyChange < 0 ? '#EF4444' : '#6B7280'
                          }
                        ]}>
                          {user.weeklyChange > 0 ? '+' : ''}{user.weeklyChange}
                        </Text>
                      </View>
                      <View style={styles.leaderboardBadges}>
                        {user.badges.slice(0, 3).map((badge, index) => (
                          <Text key={index} style={styles.smallBadge}>{badge}</Text>
                        ))}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </DashboardCard>
          </View>

          {/* Competition Stats */}
          <View style={styles.statsContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Competition Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Users size={24} color="#4F46E5" />
                <Text style={styles.statValue}>2.4M</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Users</Text>
              </View>
              <View style={styles.statCard}>
                <Trophy size={24} color="#F59E0B" />
                <Text style={styles.statValue}>156</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Countries</Text>
              </View>
              <View style={styles.statCard}>
                <Target size={24} color="#10B981" />
                <Text style={styles.statValue}>89%</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Goal Success</Text>
              </View>
            </View>
          </View>

          {/* Rewards Preview */}
          <DashboardCard style={styles.rewardsCard}>
            <View style={styles.rewardsContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Rewards</Text>
              <Text style={[styles.rewardsDescription, { color: colors.textSecondary }]}>
                Top performers earn exclusive badges and unlock special features!
              </Text>
              <View style={styles.rewardsList}>
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardBadge}>🏆</Text>
                  <Text style={[styles.rewardText, { color: colors.text }]}>Top 1: Golden Crown Badge</Text>
                </View>
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardBadge}>🥈</Text>
                  <Text style={[styles.rewardText, { color: colors.text }]}>Top 10: Silver Star Badge</Text>
                </View>
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardBadge}>🎯</Text>
                  <Text style={[styles.rewardText, { color: colors.text }]}>Top 100: Focus Master Badge</Text>
                </View>
              </View>
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
  yourRankCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 0,
    overflow: 'hidden',
  },
  yourRankGradient: {
    padding: 20,
  },
  yourRankContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yourRankLeft: {
    flex: 1,
  },
  yourRankTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 8,
  },
  yourRankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  yourRankPosition: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  yourRankChange: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  yourRankChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  yourRankPoints: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  yourRankRight: {
    alignItems: 'center',
  },
  yourRankAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 8,
  },
  yourRankBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    fontSize: 16,
  },
  timeframeContainer: {
    marginBottom: 24,
  },
  timeframeScroll: {
    paddingHorizontal: 24,
    gap: 12,
  },
  timeframeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  timeframeButtonActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeframeTextActive: {
    color: '#FFFFFF',
  },
  categoryContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  podiumContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 8,
  },
  podiumPlace: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  firstPlace: {
    marginBottom: 0,
  },
  secondPlace: {
    marginBottom: 20,
  },
  thirdPlace: {
    marginBottom: 40,
  },
  podiumGradient: {
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  podiumPoints: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  crownEffect: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  leaderboardContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  leaderboardContent: {
    padding: 0,
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  currentUserItem: {
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
  },
  currentUserName: {
    color: '#4F46E5',
  },
  leaderboardCountry: {
    fontSize: 14,
  },
  leaderboardLevel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  leaderboardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  leaderboardStreak: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  leaderboardRight: {
    alignItems: 'flex-end',
  },
  leaderboardPoints: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  leaderboardChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 4,
  },
  leaderboardChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  leaderboardBadges: {
    flexDirection: 'row',
    gap: 2,
  },
  smallBadge: {
    fontSize: 12,
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  rewardsCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  rewardsContent: {
    padding: 20,
  },
  rewardsDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  rewardsList: {
    gap: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardBadge: {
    fontSize: 20,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '500',
  },
});