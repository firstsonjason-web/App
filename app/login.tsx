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
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Mail, Lock, User, MapPin, Calendar, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { useLanguage } from '@/hooks/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// List of countries for selection
const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 
  'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 
  'Norway', 'Denmark', 'Finland', 'Ireland', 'New Zealand', 'Japan', 'South Korea',
  'China', 'Hong Kong', 'Taiwan', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia',
  'Philippines', 'Vietnam', 'India', 'Brazil', 'Mexico', 'Argentina', 'Chile',
  'Colombia', 'Peru', 'South Africa', 'Egypt', 'Nigeria', 'Kenya', 'United Arab Emirates',
  'Saudi Arabia', 'Israel', 'Turkey', 'Russia', 'Poland', 'Czech Republic', 'Portugal',
  'Greece', 'Romania', 'Hungary', 'Other'
].sort();

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
  const [country, setCountry] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer-not-to-say' | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Skip button removed - users must authenticate to use the app

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      Alert.alert(t('error'), t('fieldRequired'));
      return;
    }

    if (!country.trim()) {
      Alert.alert(t('error'), 'Please select your country');
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
      // Create user account with Firebase including additional data
      const additionalData: any = {
        displayName: fullName.trim(),
        country: country.trim(),
      };

      if (age && !isNaN(parseInt(age))) {
        additionalData.age = parseInt(age);
      }

      if (gender) {
        additionalData.gender = gender;
      }

      await signUp(email.trim().toLowerCase(), password, additionalData);

      // Save user data locally for compatibility with existing code
      const userProfile = {
        id: 'current-user',
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        country: country.trim(),
        age: age ? parseInt(age) : undefined,
        gender: gender || undefined,
        level: 'Digital Beginner',
        streak: 0,
        totalPoints: 0,
      };

      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      await AsyncStorage.setItem('isLoggedIn', 'true');

      // Navigate directly without popup
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert(t('signUpFailed'), error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const getAuthErrorMessage = (error: any) => {
    const code = error?.code || '';
    if (code.includes('wrong-password')) return t('invalidEmail') + ' / ' + t('passwordTooShort');
    if (code.includes('user-not-found')) return t('invalidEmail');
    if (code.includes('too-many-requests')) return t('failedToUpdateProfile');
    return error?.message || t('error');
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
        id: 'current-user',
        name: 'User',
        email: email.trim().toLowerCase(),
        level: 'Digital Beginner',
        streak: 0,
        totalPoints: 0,
      };

      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      await AsyncStorage.setItem('isLoggedIn', 'true');

      // Navigate directly without popup
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert(t('signInFailed'), getAuthErrorMessage(error));
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
                <>
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

                  <View style={styles.inputContainer}>
                    <TouchableOpacity 
                      style={styles.inputWrapper}
                      onPress={() => setShowCountryPicker(true)}
                    >
                      <MapPin size={20} color="#9CA3AF" style={styles.inputIcon} />
                      <Text style={[styles.input, !country && styles.placeholder]}>
                        {country || 'Select your country *'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <Calendar size={20} color="#9CA3AF" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Age (optional)"
                        value={age}
                        onChangeText={setAge}
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        maxLength={3}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <TouchableOpacity 
                      style={styles.inputWrapper}
                      onPress={() => setShowGenderPicker(true)}
                    >
                      <User size={20} color="#9CA3AF" style={styles.inputIcon} />
                      <Text style={[styles.input, !gender && styles.placeholder]}>
                        {gender ? gender.charAt(0).toUpperCase() + gender.slice(1).replace('-', ' ') : 'Gender (optional)'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {!isSignUp && (
                <View style={{height: 0}} />
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

        {/* Country Picker Modal */}
        <Modal
          visible={showCountryPicker}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCountryPicker(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <X size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search countries..."
                value={countrySearch}
                onChangeText={setCountrySearch}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <ScrollView style={styles.modalContent}>
              {COUNTRIES
                .filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()))
                .map((countryOption) => (
                  <TouchableOpacity
                    key={countryOption}
                    style={styles.countryOption}
                    onPress={() => {
                      setCountry(countryOption);
                      setShowCountryPicker(false);
                      setCountrySearch('');
                    }}
                  >
                    <Text style={[
                      styles.countryOptionText,
                      country === countryOption && styles.selectedOption
                    ]}>
                      {countryOption}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Gender Picker Modal */}
        <Modal
          visible={showGenderPicker}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowGenderPicker(false)}
        >
          <View style={styles.genderModalOverlay}>
            <View style={styles.genderModalContent}>
              <Text style={styles.genderModalTitle}>Select Gender</Text>
              {['male', 'female', 'other', 'prefer-not-to-say'].map((genderOption) => (
                <TouchableOpacity
                  key={genderOption}
                  style={styles.genderOption}
                  onPress={() => {
                    setGender(genderOption as any);
                    setShowGenderPicker(false);
                  }}
                >
                  <Text style={styles.genderOptionText}>
                    {genderOption.charAt(0).toUpperCase() + genderOption.slice(1).replace('-', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.genderOption, styles.cancelOption]}
                onPress={() => setShowGenderPicker(false)}
              >
                <Text style={styles.cancelOptionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  placeholder: {
    color: '#9CA3AF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
  },
  countryOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  countryOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  selectedOption: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  genderModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  genderModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    padding: 20,
  },
  genderModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  genderOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
    alignItems: 'center',
  },
  genderOptionText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  cancelOption: {
    backgroundColor: '#FEE2E2',
  },
  cancelOptionText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '600',
  },
});