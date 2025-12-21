import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Target,
  Trophy,
  Users,
  Sparkles,
  Clock,
  Heart,
  ArrowRight,
  Zap,
  Shield,
  Leaf,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { useLanguage } from '@/hooks/LanguageContext';
import { getColors } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { t } = useLanguage();
  const colors = getColors(isDarkMode);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const cardAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    cardAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: 400 + index * 150,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const features = [
    {
      icon: Target,
      title: 'Mindful Goals',
      description: 'Set intentions that align with your values',
      gradient: ['#059669', '#10B981'],
    },
    {
      icon: Trophy,
      title: 'Earn Rewards',
      description: 'Celebrate milestones with meaningful prizes',
      gradient: ['#D97706', '#F59E0B'],
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Connect with fellow digital wellness seekers',
      gradient: ['#7C3AED', '#A78BFA'],
    },
  ];

  const highlights = [
    { icon: Zap, label: 'Real-time tracking', color: '#FBBF24' },
    { icon: Shield, label: 'Privacy focused', color: '#60A5FA' },
    { icon: Leaf, label: 'Sustainable habits', color: '#34D399' },
    { icon: Heart, label: 'Self-compassion', color: '#F472B6' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0D1F22', '#134E4A', '#0F766E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Animated.View
              style={[
                styles.heroSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.brandBadge}>
                <Sparkles size={14} color="#5EEAD4" />
                <Text style={styles.brandBadgeText}>Digital Wellness</Text>
              </View>

              <Text style={styles.heroTitle}>
                Reclaim{'\n'}Your Time
              </Text>

              <Text style={styles.heroSubtitle}>
                Build healthier digital habits through mindful awareness, 
                meaningful goals, and a supportive community.
              </Text>

              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => router.push('/login')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#14B8A6', '#0D9488']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  <Text style={styles.ctaText}>Begin Your Journey</Text>
                  <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.signInLink}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.signInText}>
                  Already a member? <Text style={styles.signInTextBold}>Sign in</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.highlightsRow}>
              {highlights.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <View key={index} style={styles.highlightItem}>
                    <View style={[styles.highlightIcon, { backgroundColor: `${item.color}20` }]}>
                      <IconComponent size={18} color={item.color} />
                    </View>
                    <Text style={styles.highlightLabel}>{item.label}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.featuresSection}>
              <Text style={styles.sectionLabel}>WHAT WE OFFER</Text>
              <Text style={styles.sectionTitle}>
                Tools for a{'\n'}Balanced Life
              </Text>

              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Animated.View
                    key={index}
                    style={[
                      styles.featureCard,
                      {
                        opacity: cardAnims[index],
                        transform: [
                          {
                            translateY: cardAnims[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: [30, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                      style={styles.featureCardGradient}
                    >
                      <View style={styles.featureIconWrapper}>
                        <LinearGradient
                          colors={feature.gradient as [string, string]}
                          style={styles.featureIconGradient}
                        >
                          <IconComponent size={24} color="#FFFFFF" />
                        </LinearGradient>
                      </View>
                      <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>{feature.title}</Text>
                        <Text style={styles.featureDescription}>
                          {feature.description}
                        </Text>
                      </View>
                      <ArrowRight size={20} color="#5EEAD4" style={styles.featureArrow} />
                    </LinearGradient>
                  </Animated.View>
                );
              })}
            </View>

            <Animated.View
              style={[
                styles.statsSection,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(20,184,166,0.15)', 'rgba(6,182,212,0.1)']}
                style={styles.statsGradient}
              >
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>10K+</Text>
                    <Text style={styles.statLabel}>Active users</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>92%</Text>
                    <Text style={styles.statLabel}>Report improvement</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>4.8</Text>
                    <Text style={styles.statLabel}>App rating</Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            <View style={styles.testimonialSection}>
              <View style={styles.testimonialCard}>
                <Text style={styles.testimonialQuote}>
                  "This app helped me realize how much time I was losing. 
                  Now I'm present for what matters."
                </Text>
                <View style={styles.testimonialAuthor}>
                  <View style={styles.testimonialAvatar}>
                    <Text style={styles.testimonialInitial}>S</Text>
                  </View>
                  <View>
                    <Text style={styles.testimonialName}>Sarah M.</Text>
                    <Text style={styles.testimonialRole}>Mindful user since 2024</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.finalCta}>
              <Clock size={32} color="#5EEAD4" />
              <Text style={styles.finalCtaTitle}>
                Your time is precious
              </Text>
              <Text style={styles.finalCtaSubtitle}>
                Start building healthier habits today. It takes less than a minute to get started.
              </Text>
              <TouchableOpacity
                style={styles.finalCtaButton}
                onPress={() => router.push('/login')}
                activeOpacity={0.85}
              >
                <Text style={styles.finalCtaButtonText}>Get Started Free</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Made with care for digital wellness
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  heroSection: {
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 32,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(94,234,212,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(94,234,212,0.2)',
  },
  brandBadgeText: {
    color: '#5EEAD4',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 52,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 58,
    marginBottom: 20,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 26,
    marginBottom: 36,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 10,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  signInLink: {
    alignSelf: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  signInText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
  },
  signInTextBold: {
    color: '#5EEAD4',
    fontWeight: '600',
  },
  highlightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 48,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  highlightIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  featuresSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#5EEAD4',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 40,
    marginBottom: 28,
  },
  featureCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featureCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  featureIconWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  featureIconGradient: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 20,
  },
  featureArrow: {
    opacity: 0.7,
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  statsGradient: {
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(94,234,212,0.2)',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  testimonialSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  testimonialCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  testimonialQuote: {
    fontSize: 18,
    color: '#FFFFFF',
    fontStyle: 'italic',
    lineHeight: 28,
    marginBottom: 24,
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  testimonialAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  testimonialInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  testimonialName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  testimonialRole: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  finalCta: {
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 48,
  },
  finalCtaTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  finalCtaSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  finalCtaButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  finalCtaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F766E',
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
});