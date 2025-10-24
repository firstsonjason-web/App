import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, MessageCircle, UserPlus, ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { DashboardCard } from '@/components/DashboardCard';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import { getColors } from '@/constants/Colors';
import { DatabaseService } from '@/lib/firebase-services';
import { useLanguage } from '@/hooks/LanguageContext';

interface UserProfile {
  name: string;
  email: string;
  introduction: string;
  avatar: string;
  streak: number;
  level: string;
  totalPoints: number;
  createdAt?: any;
}

export default function SharedProfileScreen() {
  const { isDarkMode } = useDarkMode();
  const { user: currentUser } = useAuth();
  const { userProfile } = useFirebaseData();
  const { t } = useLanguage();
  const colors = getColors(isDarkMode);

  const { userId } = useLocalSearchParams();
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUserProfile(userId as string);
    }
  }, [userId]);

  const loadUserProfile = async (uid: string) => {
    try {
      setLoading(true);

      // Get user profile from Firebase
      const userProfile = await DatabaseService.getUserProfile(uid);

      if (userProfile) {
        setProfileUser({
          name: userProfile.displayName || 'User',
          email: userProfile.email || '',
          introduction: 'Digital wellness enthusiast on a journey to mindful technology use.',
          avatar: userProfile.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
          streak: Math.floor((userProfile.totalPoints || 0) / 50),
          level: `Level ${Math.floor((userProfile.totalPoints || 0) / 100) + 1}`,
          totalPoints: userProfile.totalPoints || 0,
          createdAt: userProfile.createdAt,
        });
      } else {
        Alert.alert(t('error'), 'User profile not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert(t('error'), 'Failed to load user profile');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    // Navigate to chat or messaging feature
    Alert.alert('Message', `Send message to ${profileUser?.name}`);
  };

  const handleFollowUser = async () => {
    if (!currentUser || !profileUser) return;

    try {
      // Here you would implement the follow functionality
      // For now, just toggle the UI state
      setIsFollowing(!isFollowing);

      Alert.alert(
        isFollowing ? 'Unfollowed' : 'Following',
        isFollowing
          ? `You are no longer following ${profileUser.name}`
          : `You are now following ${profileUser.name}`
      );
    } catch (error) {
      console.error('Error following user:', error);
      Alert.alert(t('error'), 'Failed to follow user');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profileUser) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>Profile not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Card */}
          <DashboardCard style={styles.profileCard}>
            <LinearGradient
              colors={isDarkMode ? ['#7C3AED', '#5B21B6'] : ['#8B5CF6', '#7C3AED']}
              style={styles.profileGradient}
            >
              <View style={styles.profileContent}>
                <View style={styles.profileLeft}>
                  <View style={styles.avatarContainer}>
                    <Image
                      source={{ uri: profileUser.avatar }}
                      style={styles.profileAvatar}
                    />
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{profileUser.name}</Text>
                    <Text style={styles.profileEmail}>{profileUser.email}</Text>
                    <Text style={styles.profileStreak}>🔥 {profileUser.streak} day focus streak</Text>
                    <View style={styles.profileStats}>
                      <Text style={styles.profileStat}>🎯 {profileUser.totalPoints} points</Text>
                      <Text style={styles.profileStat}>⭐ {profileUser.level}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </DashboardCard>

          {/* Profile Introduction */}
          <DashboardCard style={styles.introCard}>
            <View style={styles.introContent}>
              <Text style={[styles.introTitle, { color: colors.text }]}>
                About {profileUser.name}
              </Text>
              <Text style={[styles.introText, { color: colors.textSecondary }]}>
                {profileUser.introduction}
              </Text>
            </View>
          </DashboardCard>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4F46E5' }]}
              onPress={handleSendMessage}
            >
              <MessageCircle size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Send Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: isFollowing ? '#10B981' : '#6B7280' }
              ]}
              onPress={handleFollowUser}
            >
              <UserPlus size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Profile Stats */}
          <DashboardCard style={styles.statsCard}>
            <View style={styles.statsContent}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {Math.floor(profileUser.totalPoints / 30)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Goals Completed
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {profileUser.streak}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Day Streak
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {Math.floor((profileUser.totalPoints || 0) / 100) + 1}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Current Level
                </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 0,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: 20,
  },
  profileContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  profileStreak: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  profileStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  profileStat: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  introCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  introContent: {
    padding: 20,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});