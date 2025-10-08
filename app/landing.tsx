import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Target,
  Trophy,
  Users,
  Star,
  Smartphone,
  Heart,
  ArrowRight,
  CheckCircle,
  TrendingUp
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { getColors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const colors = getColors(isDarkMode);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const features = [
    {
      icon: Target,
      title: 'Set Daily Goals',
      description: 'Create personalized digital wellness goals that matter to you',
      color: '#4F46E5',
    },
    {
      icon: Trophy,
      title: 'Earn Points',
      description: 'Get rewarded for completing goals and building healthy habits',
      color: '#F59E0B',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your digital wellness journey with detailed insights',
      color: '#10B981',
    },
    {
      icon: Users,
      title: 'Join Community',
      description: 'Connect with others on the same wellness journey',
      color: '#EC4899',
    },
    {
      icon: Heart,
      title: 'Stay Mindful',
      description: 'Build awareness around your digital habits and screen time',
      color: '#8B5CF6',
    },
    {
      icon: Star,
      title: 'Daily Rewards',
      description: 'Set personal rewards to celebrate your achievements',
      color: '#F97316',
    },
  ];

  const benefits = [
    'Reduce screen time anxiety',
    'Build healthier digital habits',
    'Increase productivity and focus',
    'Improve sleep quality',
    'Strengthen real-world connections',
    'Achieve personal wellness goals',
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#4F46E5', '#7C3AED', '#EC4899']}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroContent}>
              <Text style={styles.heroEmoji}>🌅</Text>
              <Text style={styles.heroTitle}>Stay Healthy, Be Happy</Text>
              <Text style={styles.heroSubtitle}>
                Transform your relationship with technology and build healthier digital habits
              </Text>
            </View>

            {/* Get Started Button */}
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={() => router.push('/login')}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F3F4F6']}
                style={styles.getStartedGradient}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
                <ArrowRight size={20} color="#4F46E5" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>
              Your Digital Wellness Journey
            </Text>

            <View style={styles.featuresGrid}>
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <View key={index} style={styles.featureCard}>
                    <View
                      style={[
                        styles.featureIconContainer,
                        { backgroundColor: `${feature.color}20` }
                      ]}
                    >
                      <IconComponent size={32} color={feature.color} />
                    </View>
                    <Text style={[styles.featureTitle, { color: '#FFFFFF' }]}>
                      {feature.title}
                    </Text>
                    <Text style={[styles.featureDescription, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                      {feature.description}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>
              Why Choose Stay Healthy, Be Happy?
            </Text>

            <View style={styles.benefitsList}>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <CheckCircle size={20} color="#10B981" />
                  <Text style={[styles.benefitText, { color: '#FFFFFF' }]}>
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>
              Join Thousands of Happy Users
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>10K+</Text>
                <Text style={[styles.statLabel, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                  Active Users
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>500K+</Text>
                <Text style={[styles.statLabel, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                  Goals Completed
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>4.8★</Text>
                <Text style={[styles.statLabel, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                  App Rating
                </Text>
              </View>
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <Text style={[styles.ctaTitle, { color: '#FFFFFF' }]}>
              Ready to Transform Your Digital Life?
            </Text>
            <Text style={[styles.ctaSubtitle, { color: 'rgba(255, 255, 255, 0.8)' }]}>
              Join our community of mindful technology users today
            </Text>

            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/login')}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaButtonText}>Start Your Journey</Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
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
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  getStartedButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  getStartedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4F46E5',
  },
  featuresSection: {
    padding: 24,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  benefitsSection: {
    padding: 24,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    flex: 1,
  },
  statsSection: {
    padding: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  ctaSection: {
    padding: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});