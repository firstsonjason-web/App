import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Settings, Bell, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, Moon, Sun, Globe, X, Camera, CreditCard as Edit3, Mail, FileText, Upload } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { DashboardCard } from '@/components/DashboardCard';
import { useDarkMode } from '@/hooks/useDarkMode';
import { getColors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

interface UserProfile {
  name: string;
  email: string;
  introduction: string;
  avatar: string;
  streak: number;
  level: string;
}

export default function ProfileScreen() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);
  
  const [notifications, setNotifications] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState<'name' | 'email' | 'introduction' | 'photo'>('name');
  const [tempValue, setTempValue] = useState('');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'promax'>('free');
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [selectedFAQCategory, setSelectedFAQCategory] = useState('general');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Alex Johnson',
    email: 'alex@example.com',
    introduction: 'Digital wellness enthusiast on a journey to mindful technology use.',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    streak: 7,
    level: 'Focus Warrior',
  });

  useEffect(() => {
    loadSettings();
    loadSubscriptionPlan();
  }, []);

  const loadSettings = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem('notifications');
      const savedDailySummary = await AsyncStorage.getItem('daily_summary');
      const savedLanguage = await AsyncStorage.getItem('language');
      const savedProfile = await AsyncStorage.getItem('userProfile');
      
      if (savedNotifications !== null) {
        setNotifications(JSON.parse(savedNotifications));
      }
      if (savedDailySummary !== null) {
        setDailySummary(JSON.parse(savedDailySummary));
      }
      if (savedLanguage !== null) {
        setSelectedLanguage(savedLanguage);
      }
      if (savedProfile !== null) {
        setUserProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const loadSubscriptionPlan = async () => {
    try {
      const savedPlan = await AsyncStorage.getItem('subscriptionPlan');
      if (savedPlan) {
        setCurrentPlan(savedPlan as 'free' | 'pro' | 'promax');
      }
    } catch (error) {
      console.log('Error loading subscription plan:', error);
    }
  };

  const saveSettings = async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const handleNotificationToggle = (value: boolean) => {
    setNotifications(value);
    saveSettings('notifications', value);
  };

  const handleDailySummaryToggle = (value: boolean) => {
    setDailySummary(value);
    saveSettings('daily_summary', value);
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    saveSettings('language', language);
    setShowLanguageModal(false);
    Alert.alert('Language Updated', `Language changed to ${language}`);
  };

  const handleEditProfile = (type: 'name' | 'email' | 'introduction' | 'photo') => {
    setEditType(type);
    if (type !== 'photo') {
      setTempValue(userProfile[type]);
      setShowEditModal(true);
    } else {
      handlePhotoUpload();
    }
  };

  const handlePhotoUpload = () => {
    Alert.alert(
      'Update Profile Photo',
      'Choose how you want to update your profile photo:',
      [
        {
          text: 'Take Photo',
          onPress: () => openCamera(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => openImagePicker(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newProfile = { ...userProfile, avatar: result.assets[0].uri };
        setUserProfile(newProfile);
        await AsyncStorage.setItem('userProfile', JSON.stringify(newProfile));
        Alert.alert('Success', 'Profile photo updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to access camera');
    }
  };

  const openImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Media library permission is required to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newProfile = { ...userProfile, avatar: result.assets[0].uri };
        setUserProfile(newProfile);
        await AsyncStorage.setItem('userProfile', JSON.stringify(newProfile));
        Alert.alert('Success', 'Profile photo updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to access media library');
    }
  };

  const handleSaveEdit = async () => {
    if (tempValue.trim()) {
      const newProfile = { ...userProfile, [editType]: tempValue.trim() };
      setUserProfile(newProfile);
      await AsyncStorage.setItem('userProfile', JSON.stringify(newProfile));
      setShowEditModal(false);
      setTempValue('');
      Alert.alert('Success', `${editType.charAt(0).toUpperCase() + editType.slice(1)} updated successfully!`);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            // In a real app, this would clear user session and navigate to login
            Alert.alert('Logged Out', 'You have been logged out successfully.');
          }
        },
      ]
    );
  };

  const handleSubscriptionSelect = async (plan: 'free' | 'pro' | 'promax') => {
    try {
      await AsyncStorage.setItem('subscriptionPlan', plan);
      setCurrentPlan(plan);
      setShowSubscriptionModal(false);
      
      const planNames = {
        free: 'Normal Plan (Free)',
        pro: 'Pro Plan ($15/month)',
        promax: 'ProMax Plan ($30/month)'
      };
      
      Alert.alert(
        'Plan Updated',
        `You have successfully switched to ${planNames[plan]}!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update subscription plan');
    }
  };

  const getPlanFeatures = (plan: 'free' | 'pro' | 'promax') => {
    switch (plan) {
      case 'free':
        return {
          name: 'Normal Plan',
          price: 'Free',
          goals: '3 daily goals',
          posts: '2 posts per day',
          friends: '5 friends total',
          reports: 'Basic progress reports',
          color: '#10B981'
        };
      case 'pro':
        return {
          name: 'Pro Plan',
          price: '$15/month',
          goals: '6 daily goals',
          posts: '10 posts per day',
          friends: '20 friends total',
          reports: 'Enhanced progress reports',
          color: '#4F46E5'
        };
      case 'promax':
        return {
          name: 'ProMax Plan',
          price: '$30/month',
          goals: '20 daily goals',
          posts: '25 posts per day',
          friends: 'Unlimited friends',
          reports: 'Comprehensive detailed reports',
          color: '#8B5CF6'
        };
    }
  };

  const languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Chinese',
    'Japanese',
    'Korean',
  ];

  const getEditIcon = (type: string) => {
    switch (type) {
      case 'name': return <Edit3 size={24} color="#4F46E5" />;
      case 'email': return <Mail size={24} color="#10B981" />;
      case 'introduction': return <FileText size={24} color="#F59E0B" />;
      case 'photo': return <Camera size={24} color="#EF4444" />;
      default: return <Edit3 size={24} color="#4F46E5" />;
    }
  };

  const getEditTitle = (type: string) => {
    switch (type) {
      case 'name': return 'Edit Name';
      case 'email': return 'Edit Email';
      case 'introduction': return 'Edit Introduction';
      case 'photo': return 'Upload Photo';
      default: return 'Edit';
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
            <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage your account and preferences</Text>
          </View>

          {/* Profile Card */}
          <TouchableOpacity onPress={() => {
            Alert.alert(
              'Edit Profile',
              'What would you like to update?',
              [
                { text: 'Name', onPress: () => handleEditProfile('name') },
                { text: 'Email', onPress: () => handleEditProfile('email') },
                { text: 'Introduction', onPress: () => handleEditProfile('introduction') },
                { text: 'Profile Photo', onPress: () => handleEditProfile('photo') },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}>
            <DashboardCard style={styles.profileCard}>
              <LinearGradient
                colors={isDarkMode ? ['#7C3AED', '#5B21B6'] : ['#8B5CF6', '#7C3AED']}
                style={styles.profileGradient}
              >
                <View style={styles.profileContent}>
                  <View style={styles.profileLeft}>
                    <View style={styles.avatarContainer}>
                      <User size={32} color="#FFFFFF" />
                    </View>
                    <View style={styles.profileInfo}>
                      <Text style={styles.profileName}>{userProfile.name}</Text>
                      <Text style={styles.profileEmail}>{userProfile.email}</Text>
                      <Text style={styles.profileStreak}>🔥 {userProfile.streak} day focus streak</Text>
                    </View>
                  </View>
                  <View style={styles.profileRight}>
                    <Text style={styles.profileLevel}>{userProfile.level}</Text>
                    <ChevronRight size={20} color="rgba(255, 255, 255, 0.7)" />
                  </View>
                </View>
              </LinearGradient>
            </DashboardCard>
          </TouchableOpacity>

          {/* Subscription Card */}
          <DashboardCard style={styles.subscriptionCard}>
            <View style={styles.subscriptionContent}>
              <View style={styles.subscriptionHeader}>
                <Text style={[styles.subscriptionTitle, { color: colors.text }]}>Subscription Plan</Text>
                <View style={[styles.currentPlanBadge, { backgroundColor: currentPlan === 'free' ? '#10B981' : currentPlan === 'pro' ? '#4F46E5' : '#8B5CF6' }]}>
                  <Text style={styles.currentPlanText}>
                    {currentPlan === 'free' ? 'FREE' : currentPlan === 'pro' ? 'PRO' : 'PRO MAX'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={() => setShowSubscriptionModal(true)}
              >
                <LinearGradient
                  colors={['#4F46E5', '#7C3AED']}
                  style={styles.subscribeGradient}
                >
                  <Text style={styles.subscribeButtonText}>
                    {currentPlan === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </DashboardCard>

          {/* Notifications */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
            <DashboardCard>
              <View style={styles.settingsList}>
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <Bell size={20} color="#4F46E5" />
                    <Text style={[styles.settingText, { color: colors.text }]}>Push Notifications</Text>
                  </View>
                  <Switch
                    value={notifications}
                    onValueChange={handleNotificationToggle}
                    trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                    thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>

                <View style={[styles.settingItem, styles.settingItemLast]}>
                  <View style={styles.settingLeft}>
                    <Settings size={20} color="#10B981" />
                    <Text style={[styles.settingText, { color: colors.text }]}>Daily Summary</Text>
                  </View>
                  <Switch
                    value={dailySummary}
                    onValueChange={handleDailySummaryToggle}
                    trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                    thumbColor={dailySummary ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>
              </View>
            </DashboardCard>
          </View>

          {/* Privacy & Security */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy & Security</Text>
            <DashboardCard>
              <View style={styles.settingsList}>
                <TouchableOpacity style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <Shield size={20} color="#F59E0B" />
                    <Text style={[styles.settingText, { color: colors.text }]}>Transparency</Text>
                  </View>
                  <ChevronRight size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </DashboardCard>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
            <DashboardCard>
              <View style={styles.settingsList}>
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    {isDarkMode ? (
                      <Moon size={20} color="#6366F1" />
                    ) : (
                      <Sun size={20} color="#F59E0B" />
                    )}
                    <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
                  </View>
                  <Switch
                    value={isDarkMode}
                    onValueChange={toggleDarkMode}
                    trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
                    thumbColor={isDarkMode ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.settingItem, styles.settingItemLast]}
                  onPress={() => setShowLanguageModal(true)}
                >
                  <View style={styles.settingLeft}>
                    <Globe size={20} color="#10B981" />
                    <Text style={[styles.settingText, { color: colors.text }]}>Language</Text>
                  </View>
                  <View style={styles.settingRight}>
                    <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{selectedLanguage}</Text>
                    <ChevronRight size={20} color={colors.textTertiary} />
                  </View>
                </TouchableOpacity>
              </View>
            </DashboardCard>
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
            <DashboardCard>
              <View style={styles.settingsList}>
                <TouchableOpacity style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <HelpCircle size={20} color="#6B7280" />
                    <Text style={[styles.settingText, { color: colors.text }]}>Help & Support</Text>
                  </View>
                  <ChevronRight size={20} color={colors.textTertiary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.settingItem, styles.settingItemLast]}
                  onPress={handleLogout}
                >
                  <View style={styles.settingLeft}>
                    <LogOut size={20} color="#EF4444" />
                    <Text style={[styles.settingText, { color: '#EF4444' }]}>Logout</Text>
                  </View>
                  <ChevronRight size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </DashboardCard>
          </View>
        </ScrollView>

        {/* Edit Profile Modal */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{getEditTitle(editType)}</Text>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.editOption}>
                {getEditIcon(editType)}
                <View style={styles.editInfo}>
                  <Text style={[styles.editTitle, { color: colors.text }]}>
                    {getEditTitle(editType)}
                  </Text>
                  <Text style={[styles.editDescription, { color: colors.textSecondary }]}>
                    Update your {editType === 'introduction' ? 'self-introduction' : editType}
                  </Text>
                </View>
              </View>

              <TextInput
                style={[
                  styles.editInput,
                  { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
                  editType === 'introduction' && styles.editInputMultiline
                ]}
                placeholder={`Enter your ${editType === 'introduction' ? 'self-introduction' : editType}...`}
                value={tempValue}
                onChangeText={setTempValue}
                placeholderTextColor={colors.textTertiary}
                multiline={editType === 'introduction'}
                textAlignVertical={editType === 'introduction' ? 'top' : 'center'}
              />
            </View>
          </SafeAreaView>
        </Modal>

        {/* Language Modal */}
        <Modal
          visible={showLanguageModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Language</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.languageList}>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language}
                  style={[
                    styles.languageItem,
                    { backgroundColor: colors.background },
                    selectedLanguage === language && styles.selectedLanguageItem
                  ]}
                  onPress={() => handleLanguageSelect(language)}
                >
                  <Text style={[
                    styles.languageText,
                    { color: colors.text },
                    selectedLanguage === language && styles.selectedLanguageText
                  ]}>
                    {language}
                  </Text>
                  {selectedLanguage === language && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Subscription Modal */}
        <Modal
          visible={showSubscriptionModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowSubscriptionModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Your Plan</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.subscriptionPlans}>
              {(['free', 'pro', 'promax'] as const).map((plan) => {
                const features = getPlanFeatures(plan);
                const isCurrentPlan = currentPlan === plan;
                
                return (
                  <TouchableOpacity
                    key={plan}
                    style={[
                      styles.planCard,
                      { backgroundColor: colors.background, borderColor: isCurrentPlan ? features.color : colors.border },
                      isCurrentPlan && { borderWidth: 2 }
                    ]}
                    onPress={() => handleSubscriptionSelect(plan)}
                  >
                    <View style={styles.planHeader}>
                      <View>
                        <Text style={[styles.planName, { color: colors.text }]}>{features.name}</Text>
                        <Text style={[styles.planPrice, { color: features.color }]}>{features.price}</Text>
                      </View>
                      {isCurrentPlan && (
                        <View style={[styles.currentBadge, { backgroundColor: features.color }]}>
                          <Text style={styles.currentBadgeText}>CURRENT</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.planFeatures}>
                      <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>🎯</Text>
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>{features.goals}</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>📝</Text>
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>{features.posts}</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>👥</Text>
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>{features.friends}</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>📊</Text>
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>{features.reports}</Text>
                      </View>
                    </View>
                    
                    {!isCurrentPlan && (
                      <View style={[styles.selectPlanButton, { backgroundColor: features.color }]}>
                        <Text style={styles.selectPlanText}>
                          {plan === 'free' ? 'Downgrade' : 'Upgrade'}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
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
  profileRight: {
    alignItems: 'flex-end',
  },
  profileLevel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 8,
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
  subscriptionCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  subscriptionContent: {
    padding: 20,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  currentPlanBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  currentPlanText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subscribeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  subscribeGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subscriptionPlans: {
    flex: 1,
    padding: 24,
  },
  planCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  currentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planFeatures: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureIcon: {
    fontSize: 16,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectPlanButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectPlanText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  settingsList: {
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  editOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  editInfo: {
    flex: 1,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  editDescription: {
    fontSize: 14,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  editInputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  languageList: {
    flex: 1,
    padding: 24,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedLanguageItem: {
    backgroundColor: '#EEF2FF',
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedLanguageText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  faqContainer: {
    flex: 1,
    padding: 24,
  },
  faqCategoriesScroll: {
    gap: 12,
    marginBottom: 20,
  },
  faqCategoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  faqCategoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  faqList: {
    flex: 1,
    marginBottom: 20,
  },
  faqItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  contactSupport: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  contactSupportTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  contactSupportText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  contactButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  contactButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  faqContainer: {
    flex: 1,
    padding: 24,
  },
  faqCategoriesScroll: {
    gap: 12,
    marginBottom: 20,
  },
  faqCategoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  faqCategoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  faqList: {
    flex: 1,
    marginBottom: 20,
  },
  faqItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  contactSupport: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  contactSupportTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  contactSupportText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  contactButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  contactButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});