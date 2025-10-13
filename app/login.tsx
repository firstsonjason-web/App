import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { useLanguage } from '@/hooks/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const { signIn, signUp, user } = useAuth();
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Skip button removed - users must authenticate to use the app

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      Alert.alert(t('error'), t('fieldRequired'));
      return;
    }

    if (!email.includes('@')) {
      Alert.alert(t('error'), t('invalidEmail'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('error'), t('passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      // Create user account with Firebase
      await signUp(email.trim().toLowerCase(), password, fullName.trim());

      // Save user data locally for compatibility with existing code
      const userProfile = {
        id: 'current-user', // Firebase will handle the actual user ID
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        level: 'Digital Beginner',
        streak: 0,
        totalPoints: 0,
      };

      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      await AsyncStorage.setItem('isLoggedIn', 'true');

      Alert.alert(
        t('accountCreated'),
        t('welcomeToApp'),
        [
          {
            text: t('getStarted'),
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert(t('signUpFailed'), error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('error'), t('fieldRequired'));
      return;
    }

    if (!email.includes('@')) {
      Alert.alert(t('error'), t('invalidEmail'));
      return;
    }

    setLoading(true);

    try {
      // Sign in with Firebase
      await signIn(email.trim().toLowerCase(), password);

      // Save user data locally for compatibility with existing code
      const userProfile = {
        id: 'current-user', // Firebase will handle the actual user ID
        name: 'User', // This will be updated from Firebase profile
        email: email.trim().toLowerCase(),
        level: 'Digital Beginner',
        streak: 0,
        totalPoints: 0,
      };

      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      await AsyncStorage.setItem('isLoggedIn', 'true');

      Alert.alert(
        t('welcomeBack'),
        t('welcome'),
        [
          {
            text: t('continue'),
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert(t('signInFailed'), error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#7C3AED', '#EC4899']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{t('stayHealthyBeHappy')}</Text>
              <Text style={styles.subtitle}>
                {isSignUp ? t('createYourAccountToGetStarted') : t('welcomeBackSignInToContinue')}
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {isSignUp && (
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <User size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('fullName')}
                      value={fullName}
                      onChangeText={setFullName}
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              )}

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('emailAddress')}
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('password')}
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#9CA3AF" />
                    ) : (
                      <Eye size={20} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={isSignUp ? handleSignUp : handleSignIn}
                disabled={loading}
              >
                <LinearGradient
                  colors={loading ? ['#9CA3AF', '#6B7280'] : ['#FFFFFF', '#F3F4F6']}
                  style={styles.submitGradient}
                >
                  <Text style={[styles.submitText, loading && styles.submitTextDisabled]}>
                    {loading
                      ? (isSignUp ? t('creatingAccount') : t('signingIn'))
                      : (isSignUp ? t('createAccount') : t('signIn'))
                    }
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Toggle Sign Up/Sign In */}
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                  {isSignUp ? t('alreadyHaveAnAccount') : t('dontHaveAnAccount')}
                </Text>
                <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                  <Text style={styles.toggleLink}>
                    {isSignUp ? t('signIn') : t('createAccount')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Features */}
            <View style={styles.features}>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>🎯</Text>
                <Text style={styles.featureText}>{t('setDailyDigitalWellnessGoals')}</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>📊</Text>
                <Text style={styles.featureText}>{t('trackYourProgressOverTime')}</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>👥</Text>
                <Text style={styles.featureText}>{t('connectWithLikeMindedPeople')}</Text>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4F46E5',
  },
  submitTextDisabled: {
    color: '#FFFFFF',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  toggleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  toggleLink: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  features: {
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    flex: 1,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 24,
  },
  skipText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});