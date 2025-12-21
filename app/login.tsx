import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Mail, Lock, User, MapPin, Calendar, X, Sparkles, ArrowRight, Target, Trophy, Users } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { useLanguage } from '@/hooks/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      await signIn(email.trim().toLowerCase(), password);

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

      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert(t('signInFailed'), getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Target, label: t('setDailyDigitalWellnessGoals'), color: '#14B8A6' },
    { icon: Trophy, label: t('trackYourProgressOverTime'), color: '#F59E0B' },
    { icon: Users, label: t('connectWithLikeMindedPeople'), color: '#8B5CF6' },
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
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View
                style={[
                  styles.headerSection,
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

                <Text style={styles.title}>{t('stayHealthyBeHappy')}</Text>
                <Text style={styles.subtitle}>
                  {isSignUp ? t('createYourAccountToGetStarted') : t('welcomeBackSignInToContinue')}
                </Text>
              </Animated.View>

              <View style={styles.formCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.05)']}
                  style={styles.formCardGradient}
                >
                  {isSignUp && (
                    <>
                      <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                          <User size={18} color="#5EEAD4" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            placeholder={t('fullName')}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            autoCapitalize="words"
                          />
                        </View>
                      </View>

                      <View style={styles.inputContainer}>
                        <TouchableOpacity 
                          style={styles.inputWrapper}
                          onPress={() => setShowCountryPicker(true)}
                        >
                          <MapPin size={18} color="#5EEAD4" style={styles.inputIcon} />
                          <Text style={[styles.input, styles.inputText, !country && styles.placeholder]}>
                            {country || 'Select your country *'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.rowInputs}>
                        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                          <View style={styles.inputWrapper}>
                            <Calendar size={18} color="#5EEAD4" style={styles.inputIcon} />
                            <TextInput
                              style={styles.input}
                              placeholder="Age"
                              value={age}
                              onChangeText={setAge}
                              placeholderTextColor="rgba(255,255,255,0.4)"
                              keyboardType="number-pad"
                              maxLength={3}
                            />
                          </View>
                        </View>

                        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                          <TouchableOpacity 
                            style={styles.inputWrapper}
                            onPress={() => setShowGenderPicker(true)}
                          >
                            <User size={18} color="#5EEAD4" style={styles.inputIcon} />
                            <Text style={[styles.input, styles.inputText, !gender && styles.placeholder]}>
                              {gender ? gender.charAt(0).toUpperCase() + gender.slice(1).replace('-', ' ') : 'Gender'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </>
                  )}

                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <Mail size={18} color="#5EEAD4" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder={t('emailAddress')}
                        value={email}
                        onChangeText={setEmail}
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <Lock size={18} color="#5EEAD4" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder={t('password')}
                        value={password}
                        onChangeText={setPassword}
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} color="rgba(255,255,255,0.5)" />
                        ) : (
                          <Eye size={18} color="rgba(255,255,255,0.5)" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={isSignUp ? handleSignUp : handleSignIn}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={loading ? ['#6B7280', '#4B5563'] : ['#14B8A6', '#0D9488']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.submitGradient}
                    >
                      <Text style={styles.submitText}>
                        {loading
                          ? (isSignUp ? t('creatingAccount') : t('signingIn'))
                          : (isSignUp ? t('createAccount') : t('signIn'))
                        }
                      </Text>
                      {!loading && <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />}
                    </LinearGradient>
                  </TouchableOpacity>

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
                </LinearGradient>
              </View>

              <View style={styles.features}>
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <View key={index} style={styles.feature}>
                      <View style={[styles.featureIconWrapper, { backgroundColor: `${feature.color}20` }]}>
                        <IconComponent size={20} color={feature.color} />
                      </View>
                      <Text style={styles.featureText}>{feature.label}</Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          <Modal
            visible={showCountryPicker}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setShowCountryPicker(false)}
          >
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={['#0D1F22', '#134E4A']}
                style={styles.modalGradient}
              >
                <SafeAreaView style={{ flex: 1 }}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Country</Text>
                    <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                      <X size={24} color="#5EEAD4" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.searchContainer}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search countries..."
                      value={countrySearch}
                      onChangeText={setCountrySearch}
                      placeholderTextColor="rgba(255,255,255,0.4)"
                    />
                  </View>
                  <ScrollView style={styles.modalContent}>
                    {COUNTRIES
                      .filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()))
                      .map((countryOption) => (
                        <TouchableOpacity
                          key={countryOption}
                          style={[
                            styles.countryOption,
                            country === countryOption && styles.countryOptionSelected
                          ]}
                          onPress={() => {
                            setCountry(countryOption);
                            setShowCountryPicker(false);
                            setCountrySearch('');
                          }}
                        >
                          <Text style={[
                            styles.countryOptionText,
                            country === countryOption && styles.countryOptionTextSelected
                          ]}>
                            {countryOption}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                </SafeAreaView>
              </LinearGradient>
            </View>
          </Modal>

          <Modal
            visible={showGenderPicker}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setShowGenderPicker(false)}
          >
            <View style={styles.genderModalOverlay}>
              <View style={styles.genderModalContent}>
                <LinearGradient
                  colors={['#134E4A', '#0F766E']}
                  style={styles.genderModalGradient}
                >
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
                </LinearGradient>
              </View>
            </View>
          </Modal>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 20,
  },
  headerSection: {
    marginBottom: 32,
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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(94,234,212,0.2)',
  },
  brandBadgeText: {
    color: '#5EEAD4',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 24,
    marginBottom: 8,
  },
  formCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  formCardGradient: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    paddingVertical: 16,
  },
  inputText: {
    paddingVertical: 16,
  },
  placeholder: {
    color: 'rgba(255,255,255,0.4)',
  },
  eyeIcon: {
    padding: 4,
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: {
    shadowOpacity: 0,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
  },
  toggleText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  toggleLink: {
    fontSize: 14,
    color: '#5EEAD4',
    fontWeight: '600',
  },
  features: {
    gap: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 8,
  },
  featureIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalContent: {
    flex: 1,
  },
  countryOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  countryOptionSelected: {
    backgroundColor: 'rgba(94,234,212,0.15)',
  },
  countryOptionText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
  },
  countryOptionTextSelected: {
    color: '#5EEAD4',
    fontWeight: '600',
  },
  genderModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  genderModalContent: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  genderModalGradient: {
    padding: 24,
  },
  genderModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  genderOption: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
    alignItems: 'center',
  },
  genderOptionText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  cancelOption: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    marginTop: 8,
  },
  cancelOptionText: {
    fontSize: 15,
    color: '#FCA5A5',
    fontWeight: '600',
  },
});