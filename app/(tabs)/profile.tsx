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
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Settings, Bell, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, Moon, Sun, Globe, X, Camera, CreditCard as Edit3, Mail, FileText, Upload, UserPlus, CreditCard } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { DashboardCard } from '@/components/DashboardCard';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import { useNotifications } from '@/hooks/useNotifications';
import { getColors } from '@/constants/Colors';
import { DatabaseService, UserProfile } from '@/lib/firebase-services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useLanguage } from '@/hooks/LanguageContext';
import { uploadProfileImage, StorageUploadError } from '@/lib/storage-service';
import * as Sharing from 'expo-sharing';
import { useStripe, StripeProvider } from '../../lib/stripe-service';

function ProfileScreen() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, signOut } = useAuth();
  const { userProfile, getTotalPoints } = useFirebaseData();
  const {
    isNotificationsEnabled,
    isDailySummaryEnabled,
    permissionStatus,
    requestPermissions,
    updateNotificationSettings
  } = useNotifications();
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const colors = getColors(isDarkMode);
  
  // Use Stripe hook
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [notifications, setNotifications] = useState(isNotificationsEnabled);
  const [dailySummary, setDailySummary] = useState(isDailySummaryEnabled);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState<'name' | 'email' | 'introduction' | 'photo'>('name');
  const [tempValue, setTempValue] = useState('');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'promax'>('free');
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [selectedFAQCategory, setSelectedFAQCategory] = useState('general');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [showProfileDetailsModal, setShowProfileDetailsModal] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'promax' | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const [localUserProfile, setLocalUserProfile] = useState<any>({
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
      const savedPrivacy = await AsyncStorage.getItem('isPrivate');

      if (savedNotifications !== null) {
        setNotifications(JSON.parse(savedNotifications));
      }
      if (savedDailySummary !== null) {
        setDailySummary(JSON.parse(savedDailySummary));
      }
      // Language is now managed by useTranslation hook
      if (savedProfile !== null) {
        setLocalUserProfile(JSON.parse(savedProfile));
      }
      if (savedPrivacy !== null) {
        setIsPrivate(JSON.parse(savedPrivacy));
      } else if (user) {
        // Load from Firebase if not in AsyncStorage
        const profile = await DatabaseService.getUserProfile(user.uid);
        if (profile) {
          setIsPrivate(profile.isPrivate || false);
        }
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const loadSubscriptionPlan = async () => {
    console.log('🔄 [Subscription Debug] Starting to load subscription plan...');
    try {
      if (user?.uid) {
        const profile = await DatabaseService.getUserProfile(user.uid);
        if (profile?.subscriptionPlan) {
          console.log('🔄 [Subscription Debug] Retrieved plan from Firebase:', profile.subscriptionPlan);
          setCurrentPlan(profile.subscriptionPlan);
          await AsyncStorage.setItem('subscriptionPlan', profile.subscriptionPlan);
          console.log('🔄 [Subscription Debug] Set current plan to:', profile.subscriptionPlan);
          return;
        }
      }
      const savedPlan = await AsyncStorage.getItem('subscriptionPlan');
      console.log('🔄 [Subscription Debug] Retrieved plan from storage:', savedPlan);
      if (savedPlan) {
        setCurrentPlan(savedPlan as 'free' | 'pro' | 'promax');
        console.log('🔄 [Subscription Debug] Set current plan to:', savedPlan);
      } else {
        console.log('🔄 [Subscription Debug] No saved plan found, keeping default (free)');
      }
    } catch (error) {
      console.error('🔄 [Subscription Debug] Error loading subscription plan:', error);
    }
    console.log('🔄 [Subscription Debug] Subscription plan loading complete');
  };

  const saveSettings = async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotifications(value);

    if (value && permissionStatus !== 'granted') {
      const granted = await requestPermissions();
      if (granted) {
        updateNotificationSettings(value, dailySummary);
      } else {
        setNotifications(false);
      }
    } else {
      updateNotificationSettings(value, dailySummary);
    }
  };

  const handleDailySummaryToggle = (value: boolean) => {
    setDailySummary(value);
    updateNotificationSettings(notifications, value);
  };

  const handlePrivacyToggle = async (value: boolean) => {
    if (!user) {
      Alert.alert(t('error'), t('userNotAuthenticated'));
      return;
    }

    try {
      setIsPrivate(value);
      await DatabaseService.updateUserProfile(user.uid, { isPrivate: value });
      await AsyncStorage.setItem('isPrivate', JSON.stringify(value));
      Alert.alert(t('success'), value ? t('profileSetToPrivate') : t('profileSetToPublic'));
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      setIsPrivate(!value); // Revert on error
      Alert.alert(t('error'), t('failedToUpdatePrivacySetting'));
    }
  };

  const handleLanguageSelect = async (language: string) => {
    try {
      // Map display name to language code
      const languageCode = languageMapping[language] as any;

      if (!languageCode) {
        Alert.alert(t('error'), t('unsupportedLanguage', { language }));
        return;
      }

      await changeLanguage(languageCode);

      setShowLanguageModal(false);

      Alert.alert(t('success'), t('languageChangedTo', { language }));
    } catch (error) {
    }
  };

  const handleEditProfile = (type: 'name' | 'email' | 'introduction' | 'photo') => {
    setEditType(type);
    if (type !== 'photo') {
      setTempValue(localUserProfile[type as keyof UserProfile] as string);
      setShowEditModal(true);
    } else {
      handlePhotoUpload();
    }
  };

  const handlePhotoUpload = async () => {
    console.log('📸 handlePhotoUpload called - showing photo options');

    // Check if we're on web
    const isWeb = require('react-native').Platform.OS === 'web';

    if (isWeb) {
      console.log('🌐 Web detected - using web-compatible image picker');
      // On web, directly open file picker since camera isn't available
      await openImagePicker();
    } else {
      // On mobile, show the alert with both options
      Alert.alert(
        t('updateProfilePhotoTitle'),
        t('updateProfilePhotoMessage'),
        [
          {
            text: t('takePhotoOption'),
            onPress: () => {
              console.log('📸 Camera option selected');
              openCamera();
            },
          },
          {
            text: t('chooseFromGalleryOption'),
            onPress: () => {
              console.log('📸 Gallery option selected');
              openImagePicker();
            },
          },
          {
            text: t('cancel'),
            style: 'cancel',
          },
        ]
      );
    }
  };

  const openCamera = async () => {
    try {
      console.log('📷 Opening camera...');

      // Check if we're on web - camera not available
      const isWeb = require('react-native').Platform.OS === 'web';
      if (isWeb) {
        console.log('🌐 Web detected - camera not available, redirecting to gallery');
        Alert.alert(
          t('cameraNotAvailable'),
          t('cameraAccessNotAvailableOnWeb'),
          [
            { text: t('chooseFromGalleryOption'), onPress: openImagePicker },
            { text: t('cancel'), style: 'cancel' }
          ]
        );
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('📷 Camera permission status:', status);
      if (status !== 'granted') {
        console.log('📷 Camera permission denied');
        Alert.alert(t('permissionNeeded'), t('cameraPermissionRequired'));
        return;
      }

      console.log('📷 Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('📷 Camera result:', result);
      if (!result.canceled && result.assets[0] && user) {
        setIsUploadingAvatar(true);
        try {
          console.log('📤 Starting avatar upload...');
          // Upload to Firebase Storage using the storage service
          // For React Native, we need to handle file:// URIs differently
          const fileUri = result.assets[0].uri;
          console.log('📤 File URI:', fileUri);
          const downloadURL = await uploadProfileImage(user.uid, fileUri, {
            contentType: 'image/jpeg',
            customMetadata: {
              uploadedBy: user.uid,
              uploadSource: 'camera'
            }
          });
          console.log('📤 Upload successful, download URL:', downloadURL);

          // Update profile in Firebase with the Storage URL
          console.log('📤 Updating user profile in database...');
          await DatabaseService.updateUserProfile(user.uid, {
            avatar: downloadURL
          });

          // Update local state
          const newProfile = { ...localUserProfile, avatar: downloadURL };
          setLocalUserProfile(newProfile);

          console.log('📤 Avatar update completed successfully');
          Alert.alert(t('success'), t('profilePhotoUpdatedSuccessfully'));
        } catch (error) {
          console.error('Error uploading profile photo:', error);

          let errorMessage = t('failedToUpdateProfilePhoto');
          if (error instanceof StorageUploadError) {
            switch (error.code) {
              case 'INVALID_PARAMS':
                errorMessage = 'Invalid upload parameters';
                break;
              case 'INVALID_FILE_TYPE':
                errorMessage = 'Invalid file type. Please select an image file.';
                break;
              case 'UPLOAD_FAILED':
                errorMessage = 'Failed to upload image. Please try again.';
                break;
              default:
                errorMessage = error.message;
            }
          }

          Alert.alert(t('error'), errorMessage);
        } finally {
          setIsUploadingAvatar(false);
        }
      }
    } catch (error) {
      setIsUploadingAvatar(false);
      console.error('Error accessing camera:', error);
      Alert.alert(t('error'), t('failedToAccessCamera'));
    }
  };

  // Helper function to process image files (for web compatibility)
  const processImageFile = async (file: File, userId: string, source: 'camera' | 'gallery') => {
    try {
      console.log('📁 Processing image file:', file.name, 'Size:', file.size);

      if (!file.type.startsWith('image/')) {
        Alert.alert(t('error'), t('pleaseSelectValidImageFile'));
        return;
      }

      // For web, create a blob URL that the storage service can handle
      const blobUrl = URL.createObjectURL(file);
      console.log('📁 Created blob URL for web:', blobUrl);

      const downloadURL = await uploadProfileImage(userId, blobUrl, {
        contentType: file.type || 'image/jpeg',
        customMetadata: {
          uploadedBy: userId,
          uploadSource: source
        }
      });

      console.log('📁 Web upload successful, download URL:', downloadURL);

      // Update profile in Firebase with the Storage URL
      console.log('📁 Updating user profile in database...');
      await DatabaseService.updateUserProfile(userId, {
        avatar: downloadURL
      });

      // Update local state
      const newProfile = { ...localUserProfile, avatar: downloadURL };
      setLocalUserProfile(newProfile);

      console.log('📁 Web avatar update completed successfully');
      Alert.alert(t('success'), t('profilePhotoUpdatedSuccessfully'));

    } catch (error) {
      console.error('📁 Error processing web image file:', error);
      Alert.alert(t('error'), t('failedToUploadImage'));
    }
  };

  const openImagePicker = async () => {
    try {
      console.log('🖼️ Opening image picker...');

      // Check if we're on web
      const isWeb = require('react-native').Platform.OS === 'web';

      if (isWeb) {
        console.log('🌐 Web detected - using web file input');
        // On web, we need to use a different approach for file selection
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file && user) {
            console.log('🖼️ Web file selected:', file.name);
            await processImageFile(file, user.uid, 'gallery');
          }
        };
        input.click();
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('🖼️ Media library permission status:', status);
      if (status !== 'granted') {
        console.log('🖼️ Media library permission denied');
        Alert.alert(t('permissionNeeded'), t('mediaLibraryPermissionRequired'));
        return;
      }

      console.log('🖼️ Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('🖼️ Image picker result:', result);
      if (!result.canceled && result.assets[0] && user) {
        setIsUploadingAvatar(true);
        try {
          console.log('🖼️ Starting gallery avatar upload...');
          // Upload to Firebase Storage using the storage service
          const fileUri = result.assets[0].uri;
          console.log('🖼️ Gallery file URI:', fileUri);
          const downloadURL = await uploadProfileImage(user.uid, fileUri, {
            contentType: 'image/jpeg',
            customMetadata: {
              uploadedBy: user.uid,
              uploadSource: 'gallery'
            }
          });
          console.log('🖼️ Gallery upload successful, download URL:', downloadURL);

          // Update profile in Firebase with the Storage URL
          console.log('🖼️ Updating user profile in database...');
          await DatabaseService.updateUserProfile(user.uid, {
            avatar: downloadURL
          });

          // Update local state
          const newProfile = { ...localUserProfile, avatar: downloadURL };
          setLocalUserProfile(newProfile);

          console.log('🖼️ Gallery avatar update completed successfully');
          Alert.alert(t('success'), t('profilePhotoUpdatedSuccessfully'));
        } catch (error) {
          console.error('Error uploading profile photo:', error);

          let errorMessage = t('failedToUpdateProfilePhoto');
          if (error instanceof StorageUploadError) {
            switch (error.code) {
              case 'INVALID_PARAMS':
                errorMessage = 'Invalid upload parameters';
                break;
              case 'INVALID_FILE_TYPE':
                errorMessage = 'Invalid file type. Please select an image file.';
                break;
              case 'UPLOAD_FAILED':
                errorMessage = 'Failed to upload image. Please try again.';
                break;
              case 'FILE_READ_FAILED':
                errorMessage = 'Failed to read image file. Please try again.';
                break;
              default:
                errorMessage = error.message;
            }
          }

          Alert.alert(t('error'), errorMessage);
        } finally {
          setIsUploadingAvatar(false);
        }
      }
    } catch (error) {
      setIsUploadingAvatar(false);
      console.error('Error accessing media library:', error);
      Alert.alert(t('error'), t('failedToAccessMediaLibrary'));
    }
  };

  const handleSaveEdit = async () => {
    if (tempValue.trim() && user) {
      try {
        // Update profile in Firebase
        const updates: any = { [editType]: tempValue.trim() };

        if (editType === 'name') {
          updates.displayName = tempValue.trim();
        } else if (editType === 'introduction') {
          // You could add an introduction field to UserProfile if needed
          updates.bio = tempValue.trim();
        }

        await DatabaseService.updateUserProfile(user.uid, updates);

        // Update local state
        const newProfile = { ...localUserProfile, [editType]: tempValue.trim() };
        setLocalUserProfile(newProfile);

        setShowEditModal(false);
        setTempValue('');
        Alert.alert(t('success'), `${editType.charAt(0).toUpperCase() + editType.slice(1)} ${t('profileUpdatedSuccessfully')}`);
      } catch (error) {
        console.error('Error updating profile:', error);
        Alert.alert(t('error'), t('failedToUpdateProfile'));
      }
    }
  };

  const handleLogout = async () => {
    console.log('🚨 LOGOUT BUTTON PRESSED - handleLogout function called');
    console.log('🚨 Current user:', user?.email);

    // Check if user is authenticated
    if (!user) {
      console.log('🚨 No user found, cannot logout');
      Alert.alert(t('error'), t('noUserCurrentlyLoggedIn'));
      return;
    }

    console.log('🚨 Starting logout process immediately (skipping dialog for web)...');

    try {
      console.log('🚨 LOGOUT CONFIRMED - Starting logout process...');
      console.log('🚨 User before signout:', user.email);

      // Call signOut from auth hook
      await signOut();
      console.log('🚨 SIGNOUT SUCCESSFUL - User signed out from Firebase');

      // Clear any stored user data
      await AsyncStorage.multiRemove(['userProfile', 'isLoggedIn', 'notifications', 'daily_summary']);
      console.log('🚨 DATA CLEARED - Local storage cleared');

      console.log('🚨 NAVIGATING TO LANDING PAGE...');
      // Navigate to landing page - use replace to prevent going back
      router.replace('/landing');
      console.log('🚨 NAVIGATION COMPLETE');

    } catch (error) {
      console.error('🚨 LOGOUT ERROR:', error);
      console.error('🚨 Error details:', JSON.stringify(error, null, 2));
      const errorMessage = error instanceof Error ? error.message : t('unknownError');
      Alert.alert(t('error'), t('failedToLogout', { errorMessage: errorMessage }));
    }
  };

  const initializePaymentSheet = async (plan: 'pro' | 'promax', retryCount: number = 0): Promise<boolean> => {
    console.log('💳 [Payment Debug] Initializing payment sheet for plan:', plan, 'Retry:', retryCount);
    if (!user?.uid) {
      console.error('💳 [Payment Debug] User not authenticated');
      Alert.alert('Error', 'User not authenticated');
      return false;
    }

    // On web, we'll show a message about redirecting to a payment page
    if (Platform.OS === 'web') {
      console.log('💳 [Payment Debug] Web platform detected, showing redirect alert');
      Alert.alert(
        t('paymentProcessing'),
        t('redirectToSecurePaymentPage'),
        [
          {
            text: t('continue'),
            onPress: () => {
              console.log('💳 [Payment Debug] User proceeded with web payment simulation');
              // On web, we would redirect to a payment page
              // For now we'll simulate a successful payment
              setTimeout(() => {
                console.log('💳 [Payment Debug] Simulating successful payment for web');
                handleSuccessfulPayment(plan);
              }, 1000); // Simulate processing delay
            }
          },
          { text: t('cancel'), style: 'cancel' }
        ]
      );
      return true;
    }

    try {
      // Create payment intent and get client secret
      console.log('💳 [Payment Debug] Creating payment intent for plan:', plan);
      const { clientSecret } = await DatabaseService.createPaymentIntent(plan);
      console.log('💳 [Payment Debug] Payment intent created, client secret received');

      const planAmount = plan === 'pro' ? 1500 : 3000; // in cents
      const planCurrency = 'usd';
      console.log('💳 [Payment Debug] Plan details - Amount:', planAmount, 'Currency:', planCurrency);

      // Initialize payment sheet with the payment intent
      console.log('💳 [Payment Debug] Calling initPaymentSheet...');
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Digital Wellness App',
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: true,
        returnURL: 'your-app://stripe-redirect', // Deep link for redirect-based payment methods
        appearance: {
          colors: {
            primary: '#4F46E5',
            background: isDarkMode ? '#1F2937' : '#FFFFFF',
            componentBackground: isDarkMode ? '#374151' : '#F9FAFB',
            componentBorder: isDarkMode ? '#4B5563' : '#E5E7EB',
            componentDivider: isDarkMode ? '#4B5563' : '#E5E7EB',
            primaryText: isDarkMode ? '#F9FAFB' : '#111827',
            secondaryText: isDarkMode ? '#D1D5DB' : '#6B7280',
            componentText: isDarkMode ? '#F9FAFB' : '#111827',
            placeholderText: isDarkMode ? '#9CA3AF' : '#9CA3AF',
            icon: isDarkMode ? '#9CA3AF' : '#6B7280',
            error: '#EF4444',
          },
          shapes: {
            borderRadius: 12,
          },
        },
      });

      if (error) {
        console.error('💳 [Payment Debug] Payment sheet initialization error:', error);
        Alert.alert(t('error'), t('failedToInitializePaymentSheet', { errorMessage: error.message }));
        return false;
      }

      console.log('💳 [Payment Debug] Payment sheet initialized successfully');
      return true;
    } catch (error) {
      console.error('💳 [Payment Debug] Exception during payment sheet initialization:', error);

      // Check if it's a network or temporary error and retry up to 2 times
      if (retryCount < 2 && (error instanceof Error && (error.message?.includes('network') || error.message?.includes('timeout')))) {
        console.log('💳 [Payment Debug] Retrying payment initialization...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return initializePaymentSheet(plan, retryCount + 1);
      }

      Alert.alert(t('error'), t('failedToInitializePaymentSheetSimple'));
      return false;
    }
  };

  const handleSubscriptionSelect = async (plan: 'free' | 'pro' | 'promax') => {
    console.log('📋 [Subscription Debug] User selected plan:', plan);
    if (plan === 'free') {
      console.log('📋 [Subscription Debug] Processing free plan selection');
      try {
        if (user?.uid) {
          await DatabaseService.updateUserProfile(user.uid, { subscriptionPlan: plan });
        }
        await AsyncStorage.setItem('subscriptionPlan', plan);
        setCurrentPlan(plan);
        setShowSubscriptionModal(false);
        console.log('📋 [Subscription Debug] Free plan saved to Firebase and storage, modal closed');

        const planNames = {
          free: 'Normal Plan (Free)',
          pro: 'Pro Plan ($15/month)',
          promax: 'ProMax Plan ($30/month)'
        };

        Alert.alert(
          t('planUpdated'),
          t('successfullySwitchedToPlan', { planName: planNames[plan] }),
          [{ text: t('ok') }]
        );
        console.log('📋 [Subscription Debug] Free plan alert shown');
      } catch (error) {
        console.error('📋 [Subscription Debug] Error updating to free plan:', error);
        Alert.alert('Error', 'Failed to update subscription plan');
      }
    } else {
      // For paid plans, show payment modal
      console.log('📋 [Subscription Debug] Processing paid plan selection:', plan);
      setSelectedPlan(plan as 'pro' | 'promax');
      setShowSubscriptionModal(false);
      setShowPaymentModal(true);
      console.log('📋 [Subscription Debug] Payment modal opened for plan:', plan);
    }
  };

  const handleSuccessfulPayment = async (plan: 'pro' | 'promax') => {
    console.log('✅ [Payment Debug] Handling successful payment for plan:', plan);
    // Payment successful
    if (user?.uid) {
      await DatabaseService.updateUserProfile(user.uid, { subscriptionPlan: plan });
    }
    await AsyncStorage.setItem('subscriptionPlan', plan);
    setCurrentPlan(plan);
    setShowPaymentModal(false);
    console.log('✅ [Payment Debug] Plan saved to Firebase and storage, state updated');

    const planNames = {
      pro: 'Pro Plan ($15/month)',
      promax: 'ProMax Plan ($30/month)'
    };

    Alert.alert(
      'Payment Successful',
      `You've successfully upgraded to the ${planNames[plan]}!`,
      [{ text: 'OK' }]
    );
    console.log('✅ [Payment Debug] Success alert shown and payment modal closed');
  };

  const openPaymentSheet = async () => {
    console.log('💰 [Payment Debug] Starting payment sheet process for plan:', selectedPlan);
    if (!selectedPlan) {
      console.error('💰 [Payment Debug] No plan selected');
      Alert.alert(t('error'), t('noPlanSelected'));
      return;
    }

    setIsProcessingPayment(true);
    try {
      console.log('💰 [Payment Debug] Initializing payment sheet...');
      const isInitialized = await initializePaymentSheet(selectedPlan);
      if (!isInitialized) {
        console.log('💰 [Payment Debug] Payment sheet initialization failed');
        setIsProcessingPayment(false);
        return;
      }

      // Only use Stripe payment sheet on native platforms
      if (Platform.OS !== 'web') {
        console.log('💰 [Payment Debug] Presenting payment sheet on native platform');
        try {
          const { error } = await presentPaymentSheet();

          if (error) {
            console.error('💰 [Payment Debug] Payment failed:', error);
            Alert.alert(t('error'), t('paymentFailed', { errorMessage: error.message }));
          } else {
            console.log('💰 [Payment Debug] Payment successful, processing...');
            // Payment successful
            if (user?.uid) {
              await DatabaseService.updateUserProfile(user.uid, { subscriptionPlan: selectedPlan });
            }
            await AsyncStorage.setItem('subscriptionPlan', selectedPlan);
            setCurrentPlan(selectedPlan);
            setShowPaymentModal(false);

            const planNames = {
              pro: 'Pro Plan ($15/month)',
              promax: 'ProMax Plan ($30/month)'
            };

            Alert.alert(
              t('paymentSuccessful'),
              t('upgradedToPlan', { planName: planNames[selectedPlan] }),
              [{ text: t('ok') }]
            );
            console.log('💰 [Payment Debug] Payment success alert shown and modal closed');
          }
        } catch (error) {
          console.error('💰 [Payment Debug] Unexpected error during payment presentation:', error);
          Alert.alert(t('error'), t('unexpectedErrorDuringPayment'));
        }
      } else {
        console.log('💰 [Payment Debug] Web platform - payment handled separately');
      }
    } catch (error) {
      console.error('💰 [Payment Debug] Unexpected error during payment:', error);
      Alert.alert(t('error'), t('unexpectedErrorDuringPayment'));
    } finally {
      setIsProcessingPayment(false);
      console.log('💰 [Payment Debug] Payment process completed');
    }
  };

  const getPlanFeatures = (plan: 'free' | 'pro' | 'promax') => {
    switch (plan) {
      case 'free':
        return {
          name: t('normalPlan'),
          price: t('freePrice'),
          goals: `3 ${t('goalsLabel')}`,
          posts: `2 ${t('postsLabel')}`,
          friends: `5 ${t('friendsLabel')}`,
          reports: t('basicReports'),
          color: '#10B981'
        };
      case 'pro':
        return {
          name: t('proPlan'),
          price: t('proPrice'),
          goals: `6 ${t('goalsLabel')}`,
          posts: `10 ${t('postsLabel')}`,
          friends: `20 ${t('friendsLabel')}`,
          reports: t('enhancedReports'),
          color: '#4F46E5'
        };
      case 'promax':
        return {
          name: t('proMaxPlan'),
          price: t('proMaxPrice'),
          goals: `20 ${t('goalsLabel')}`,
          posts: `25 ${t('postsLabel')}`,
          friends: t('unlimitedFriends'),
          reports: t('comprehensiveReports'),
          color: '#8B5CF6'
        };
    }
  };

  const languages = [
    'English',
    'Chinese (Simplified)',
    'Chinese (Traditional)',
  ];

  // Language mapping from display names to language codes
  const languageMapping: { [key: string]: string } = {
    'English': 'en',
    'Chinese (Simplified)': 'zh_CN',
    'Chinese (Traditional)': 'zh_TW',
  };

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

  const handleShareProfile = async () => {
    if (!user?.uid) {
      Alert.alert(t('error'), t('unableToShareProfile'));
      return;
    }

    try {
      // Generate deeplink URL with current user's ID
      const shareUrl = `myapp://profile/${user.uid}`;

      // Share the profile link
      await Sharing.shareAsync(shareUrl);

      console.log('Profile shared successfully');
    } catch (error) {
      console.error('Error sharing profile:', error);
      Alert.alert(t('error'), t('failedToShareProfile') || 'Failed to share profile. Please try again.');
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
            <Text style={[styles.title, { color: colors.text }]}>{t('profile')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('manageAccountPreferences')}</Text>
          </View>

          {/* Profile Card */}
           <TouchableOpacity onPress={() => setShowProfileDetailsModal(true)}>
             <DashboardCard style={styles.profileCard}>
               <LinearGradient
                 colors={isDarkMode ? ['#7C3AED', '#5B21B6'] : ['#8B5CF6', '#7C3AED']}
                 style={styles.profileGradient}
               >
                 <View style={styles.profileContent}>
                   <View style={styles.profileLeft}>
                     <View style={styles.avatarContainer}>
                       {isUploadingAvatar ? (
                         <View style={[styles.profileAvatar, styles.avatarLoading]}>
                           <Text style={styles.loadingText}>...</Text>
                         </View>
                       ) : (
                         <Image
                           source={{ uri: userProfile?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100' }}
                           style={styles.profileAvatar}
                         />
                       )}
                     </View>
                     <View style={styles.profileInfo}>
                       <Text style={styles.profileName}>{userProfile?.displayName || user?.email?.split('@')[0] || 'User'}</Text>
                       <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
                       <Text style={styles.profileStreak}>🔥 {Math.floor((userProfile?.totalPoints || 0) / 50)} day focus streak</Text>
                       <View style={styles.profileStats}>
                         <Text style={styles.profileStat}>🎯 {userProfile?.totalPoints || 0} points</Text>
                         <Text style={styles.profileStat}>⭐ Level {Math.floor((userProfile?.totalPoints || 0) / 100) + 1}</Text>
                       </View>
                     </View>
                   </View>
                   <View style={styles.profileRight}>
                     <TouchableOpacity
                       style={[
                         styles.editButton,
                         isUploadingAvatar && styles.disabledButton,
                         { zIndex: 10 } // Ensure button is on top
                       ]}
                       onPress={(e) => {
                         e.stopPropagation();
                         if (isUploadingAvatar) {
                           console.log('🔧 Edit button pressed but upload in progress');
                           return;
                         }

                         console.log('🔧 Edit button pressed - showing profile edit options');
                         Alert.alert(
                           t('editProfile'),
                           t('whatWouldYouLikeToUpdate'),
                           [
                             { text: t('nameOption'), onPress: () => {
                               console.log('🔧 Name edit selected');
                               handleEditProfile('name');
                             }},
                             { text: t('emailOption'), onPress: () => {
                               console.log('🔧 Email edit selected');
                               handleEditProfile('email');
                             }},
                             { text: t('introductionOption'), onPress: () => {
                               console.log('🔧 Introduction edit selected');
                               handleEditProfile('introduction');
                             }},
                             { text: t('profilePhotoOption'), onPress: () => {
                               console.log('🔧 Profile Photo edit selected');
                               handleEditProfile('photo');
                             }},
                             { text: t('cancelOption'), style: 'cancel' },
                           ]
                         );
                       }}
                       disabled={isUploadingAvatar}
                       activeOpacity={0.7}
                     >
                       <Edit3 size={16} color="#FFFFFF" />
                     </TouchableOpacity>
                     <ChevronRight size={20} color="rgba(255, 255, 255, 0.7)" />
                   </View>
                 </View>
               </LinearGradient>
             </DashboardCard>
           </TouchableOpacity>

          {/* Subscription Card - Limited Time Free */}
          <DashboardCard style={styles.subscriptionCard}>
            <View style={styles.subscriptionContent}>
              <View style={styles.subscriptionHeader}>
                <Text style={[styles.subscriptionTitle, { color: colors.text }]}>{t('subscriptionPlan')}</Text>
                <View style={[styles.currentPlanBadge, { backgroundColor: '#10B981' }]}>
                  <Text style={styles.currentPlanText}>
                    LIMITED TIME FREE
                  </Text>
                </View>
              </View>
              <View style={styles.limitedTimeNotice}>
                <Text style={[styles.limitedTimeText, { color: colors.text }]}>
                  🎉 All features are currently free! Enjoy unlimited access to Pro and ProMax features.
                </Text>
              </View>
            </View>
          </DashboardCard>

          {/* Notifications */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('notifications')}</Text>
            <DashboardCard>
              <View style={styles.settingsList}>
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <Bell size={20} color="#4F46E5" />
                    <Text style={[styles.settingText, { color: colors.text }]}>{t('pushNotifications')}</Text>
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
                    <Text style={[styles.settingText, { color: colors.text }]}>{t('dailySummary')}</Text>
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('privacySecurity')}</Text>
            <DashboardCard>
              <View style={styles.settingsList}>
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <Shield size={20} color="#F59E0B" />
                    <Text style={[styles.settingText, { color: colors.text }]}>{t('transparency')}</Text>
                  </View>
                  <Switch
                    value={isPrivate}
                    onValueChange={handlePrivacyToggle}
                    trackColor={{ false: '#E5E7EB', true: '#F59E0B' }}
                    thumbColor={isPrivate ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>
              </View>
            </DashboardCard>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('accountSettings')}</Text>
            <DashboardCard>
              <View style={styles.settingsList}>
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    {isDarkMode ? (
                      <Moon size={20} color="#6366F1" />
                    ) : (
                      <Sun size={20} color="#F59E0B" />
                    )}
                    <Text style={[styles.settingText, { color: colors.text }]}>{t('darkMode')}</Text>
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
                  onPress={() => {
                    setShowLanguageModal(true);
                  }}
                >
                  <View style={styles.settingLeft}>
                    <Globe size={20} color="#10B981" />
                    <Text style={[styles.settingText, { color: colors.text }]}>{t('language')}</Text>
                  </View>
                  <View style={styles.settingRight}>
                    <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                      {currentLanguage === 'en' ? 'English' :
                       currentLanguage === 'zh_CN' ? 'Chinese (Simplified)' :
                       currentLanguage === 'zh_TW' ? 'Chinese (Traditional)' :
                       currentLanguage === 'es' ? 'Spanish' :
                       currentLanguage === 'fr' ? 'French' :
                       currentLanguage === 'de' ? 'German' :
                       currentLanguage === 'it' ? 'Italian' :
                       currentLanguage === 'pt' ? 'Portuguese' :
                       currentLanguage === 'ja' ? 'Japanese' :
                       currentLanguage === 'ko' ? 'Korean' : currentLanguage}
                    </Text>
                    <ChevronRight size={20} color={colors.textTertiary} />
                  </View>
                </TouchableOpacity>
              </View>
            </DashboardCard>
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('support')}</Text>
            <DashboardCard>
              <View style={styles.settingsList}>
                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={() => setShowFAQModal(true)}
                >
                  <View style={styles.settingLeft}>
                    <HelpCircle size={20} color="#6B7280" />
                    <Text style={[styles.settingText, { color: colors.text }]}>{t('faq')}</Text>
                  </View>
                  <ChevronRight size={20} color={colors.textTertiary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <HelpCircle size={20} color="#6B7280" />
                    <Text style={[styles.settingText, { color: colors.text }]}>{t('helpAndSupport')}</Text>
                  </View>
                  <ChevronRight size={20} color={colors.textTertiary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.settingItem, styles.settingItemLast]}
                  onPress={handleLogout}
                >
                  <View style={styles.settingLeft}>
                    <LogOut size={20} color="#EF4444" />
                    <Text style={[styles.settingText, { color: '#EF4444' }]}>{t('logout')}</Text>
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
              <TouchableOpacity onPress={() => {
                setShowLanguageModal(false);
              }}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('selectLanguage')}</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.languageList}>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language}
                  style={[
                    styles.languageItem,
                    { backgroundColor: colors.background },
                    ((language === 'Chinese (Simplified)' && currentLanguage === 'zh_CN') ||
                    (language === 'Chinese (Traditional)' && currentLanguage === 'zh_TW') ||
                    currentLanguage === language.toLowerCase()) && styles.selectedLanguageItem
                  ]}
                  onPress={() => handleLanguageSelect(language)}
                >
                  <Text style={[
                    styles.languageText,
                    { color: colors.text },
                    ((language === 'Chinese (Simplified)' && currentLanguage === 'zh_CN') ||
                      (language === 'Chinese (Traditional)' && currentLanguage === 'zh_TW') ||
                      currentLanguage === language.toLowerCase()) && styles.selectedLanguageText
                  ]}>
                    {language}
                  </Text>
                  {((language === 'Chinese (Simplified)' && currentLanguage === 'zh_CN') ||
                    (language === 'Chinese (Traditional)' && currentLanguage === 'zh_TW') ||
                    currentLanguage === language.toLowerCase()) && (
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('chooseYourPlan')}</Text>
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
                          {plan === 'free' ? t('downgrade') : t('upgrade')}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Profile Details Modal */}
        <Modal
          visible={showProfileDetailsModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowProfileDetailsModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('profileDetails')}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setShowProfileDetailsModal(false);
                  Alert.alert(
                    t('editProfile'),
                    t('whatWouldYouLikeToUpdate'),
                    [
                      { text: t('nameOption'), onPress: () => handleEditProfile('name') },
                      { text: t('emailOption'), onPress: () => handleEditProfile('email') },
                      { text: t('introductionOption'), onPress: () => handleEditProfile('introduction') },
                      { text: t('profilePhotoOption'), onPress: () => handleEditProfile('photo') },
                      { text: t('cancelOption'), style: 'cancel' },
                    ]
                  );
                }}
              >
                <Edit3 size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.profileDetailsContent}>
                <View style={styles.profileDetailsAvatarContainer}>
                  {isUploadingAvatar ? (
                    <View style={[styles.profileDetailsAvatar, styles.avatarLoading]}>
                      <Text style={styles.loadingText}>...</Text>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: userProfile?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150' }}
                      style={styles.profileDetailsAvatar}
                    />
                  )}
                  <TouchableOpacity
                    style={[
                      styles.editPhotoButton,
                      isUploadingAvatar && styles.disabledButton,
                      { zIndex: 10, elevation: 5 } // Ensure button is on top for Android
                    ]}
                    onPress={() => {
                      console.log('📸 Edit photo button pressed in profile details modal');
                      if (!isUploadingAvatar) {
                        handleEditProfile('photo');
                      } else {
                        console.log('📸 Edit photo button pressed but upload in progress');
                      }
                    }}
                    disabled={isUploadingAvatar}
                    activeOpacity={0.7}
                  >
                    <Camera size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.profileDetailsInfo}>
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Display Name</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {userProfile?.displayName || user?.email?.split('@')[0] || 'User'}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{user?.email || 'user@example.com'}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Focus Streak</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      🔥 {Math.floor((userProfile?.totalPoints || 0) / 50)} days
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Current Level</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      ⭐ Level {Math.floor((userProfile?.totalPoints || 0) / 100) + 1}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Total Points</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      🎯 {userProfile?.totalPoints || 0} points
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Goals Completed</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      ✅ {Math.floor((userProfile?.totalPoints || 0) / 30)} goals
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Member Since</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      📅 {userProfile?.createdAt ? new Date(userProfile.createdAt.toMillis()).toLocaleDateString() : 'Recently'}
                    </Text>
                  </View>
                </View>

                <View style={styles.profileActions}>
                  <TouchableOpacity
                    style={[styles.profileActionButton, { backgroundColor: '#4F46E5' }]}
                    onPress={() => {
                      console.log('🔧 Edit Profile button pressed in profile actions');
                      setShowProfileDetailsModal(false);
                      Alert.alert(
                        'Edit Profile',
                        'What would you like to update?',
                        [
                          { text: 'Name', onPress: () => {
                            console.log('🔧 Name edit selected from profile actions');
                            handleEditProfile('name');
                          }},
                          { text: 'Email', onPress: () => {
                            console.log('🔧 Email edit selected from profile actions');
                            handleEditProfile('email');
                          }},
                          { text: 'Introduction', onPress: () => {
                            console.log('🔧 Introduction edit selected from profile actions');
                            handleEditProfile('introduction');
                          }},
                          { text: 'Profile Photo', onPress: () => {
                            console.log('🔧 Profile Photo edit selected from profile actions');
                            handleEditProfile('photo');
                          }},
                          { text: 'Cancel', style: 'cancel' },
                        ]
                      );
                    }}
                  >
                    <Edit3 size={20} color="#FFFFFF" />
                    <Text style={styles.profileActionText}>Edit Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.profileActionButton, { backgroundColor: '#10B981' }]}
                    onPress={handleShareProfile}
                  >
                    <UserPlus size={20} color="#FFFFFF" />
                    <Text style={styles.profileActionText}>Share Profile</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* FAQ Modal */}
        <Modal
          visible={showFAQModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowFAQModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('faq')}</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.faqContainer}>
              <View style={styles.faqList}>
                {/* FAQ Item 1 */}
                <TouchableOpacity
                  style={[styles.faqItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => setExpandedFAQ(expandedFAQ === 1 ? null : 1)}
                >
                  <View style={styles.faqQuestion}>
                    <Text style={[styles.faqQuestionText, { color: colors.text }]}>
                      1. Is the plan regular or irregular?
                    </Text>
                    <ChevronRight
                      size={20}
                      color={colors.textTertiary}
                      style={{ transform: [{ rotate: expandedFAQ === 1 ? '90deg' : '0deg' }] }}
                    />
                  </View>
                  {expandedFAQ === 1 && (
                    <View style={[styles.faqAnswer, { borderTopColor: colors.border }]}>
                      <Text style={[styles.faqAnswerText, { color: colors.textSecondary }]}>
                        —regular
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* FAQ Item 2 */}
                <TouchableOpacity
                  style={[styles.faqItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => setExpandedFAQ(expandedFAQ === 2 ? null : 2)}
                >
                  <View style={styles.faqQuestion}>
                    <Text style={[styles.faqQuestionText, { color: colors.text }]}>
                      2. What if I want to add more tasks/friends every day or gain a summary report?
                    </Text>
                    <ChevronRight
                      size={20}
                      color={colors.textTertiary}
                      style={{ transform: [{ rotate: expandedFAQ === 2 ? '90deg' : '0deg' }] }}
                    />
                  </View>
                  {expandedFAQ === 2 && (
                    <View style={[styles.faqAnswer, { borderTopColor: colors.border }]}>
                      <Text style={[styles.faqAnswerText, { color: colors.textSecondary }]}>
                        —Upgrade to the Pro or Promax plan
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* FAQ Item 3 */}
                <TouchableOpacity
                  style={[styles.faqItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => setExpandedFAQ(expandedFAQ === 3 ? null : 3)}
                >
                  <View style={styles.faqQuestion}>
                    <Text style={[styles.faqQuestionText, { color: colors.text }]}>
                      3. What can I do without using electronic devices?
                    </Text>
                    <ChevronRight
                      size={20}
                      color={colors.textTertiary}
                      style={{ transform: [{ rotate: expandedFAQ === 3 ? '90deg' : '0deg' }] }}
                    />
                  </View>
                  {expandedFAQ === 3 && (
                    <View style={[styles.faqAnswer, { borderTopColor: colors.border }]}>
                      <Text style={[styles.faqAnswerText, { color: colors.textSecondary }]}>
                        —We have recommended some mobile-free activities for users like reading books, jogging, meeting with friends…
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* FAQ Item 4 */}
                <TouchableOpacity
                  style={[styles.faqItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => setExpandedFAQ(expandedFAQ === 4 ? null : 4)}
                >
                  <View style={styles.faqQuestion}>
                    <Text style={[styles.faqQuestionText, { color: colors.text }]}>
                      4. What can I do if I have no idea how I develop a mobile-free habit?
                    </Text>
                    <ChevronRight
                      size={20}
                      color={colors.textTertiary}
                      style={{ transform: [{ rotate: expandedFAQ === 4 ? '90deg' : '0deg' }] }}
                    />
                  </View>
                  {expandedFAQ === 4 && (
                    <View style={[styles.faqAnswer, { borderTopColor: colors.border }]}>
                      <Text style={[styles.faqAnswerText, { color: colors.textSecondary }]}>
                        —go to communities and learn with the people who have much motivation
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* FAQ Item 5 */}
                <TouchableOpacity
                  style={[styles.faqItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => setExpandedFAQ(expandedFAQ === 5 ? null : 5)}
                >
                  <View style={styles.faqQuestion}>
                    <Text style={[styles.faqQuestionText, { color: colors.text }]}>
                      5. How can I gain the score?
                    </Text>
                    <ChevronRight
                      size={20}
                      color={colors.textTertiary}
                      style={{ transform: [{ rotate: expandedFAQ === 5 ? '90deg' : '0deg' }] }}
                    />
                  </View>
                  {expandedFAQ === 5 && (
                    <View style={[styles.faqAnswer, { borderTopColor: colors.border }]}>
                      <Text style={[styles.faqAnswerText, { color: colors.textSecondary }]}>
                        —Finish the daily tasks and gain the corresponding points
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Payment Modal */}
        <Modal
          visible={showPaymentModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('upgradePlan')}</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.modalContent}>
              {selectedPlan && (
                <View style={[styles.planCard, { backgroundColor: colors.background }]}>
                  <View style={styles.planHeader}>
                    <View>
                      <Text style={[styles.planName, { color: colors.text }]}>
                        {t(selectedPlan === 'pro' ? 'proPlan' : 'proMaxPlan')}
                      </Text>
                      <Text style={[styles.planPrice, { color: selectedPlan === 'pro' ? '#4F46E5' : '#8B5CF6' }]}>
                        {t(selectedPlan === 'pro' ? 'proPrice' : 'proMaxPrice')}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.planFeatures}>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>🎯</Text>
                      <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                        {`${selectedPlan === 'pro' ? 6 : 20} ${t('goalsLabel')}`}
                      </Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>📝</Text>
                      <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                        {`${selectedPlan === 'pro' ? 10 : 25} ${t('postsLabel')}`}
                      </Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>👥</Text>
                      <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                        {selectedPlan === 'pro' ? `20 ${t('friendsLabel')}` : t('unlimitedFriends')}
                      </Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureIcon}>📊</Text>
                      <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                        {t(selectedPlan === 'pro' ? 'enhancedReports' : 'comprehensiveReports')}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.selectPlanButton, { backgroundColor: selectedPlan === 'pro' ? '#4F46E5' : '#8B5CF6' }]}
                    onPress={openPaymentSheet}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.selectPlanText}>{t('proceedToPayment')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
              
              <View style={styles.paymentNote}>
                <Text style={[styles.paymentNoteText, { color: colors.textSecondary }]}>
                  {t('paymentNote')}
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

export default function WrappedProfileScreen() {
  return (
    <StripeProvider>
      <ProfileScreen />
    </StripeProvider>
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
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarLoading: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
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
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileDetailsContent: {
    padding: 24,
  },
  profileDetailsAvatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  profileDetailsAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#4F46E5',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileDetailsInfo: {
    marginBottom: 32,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  profileActions: {
    gap: 12,
  },
  profileActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  profileActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  limitedTimeNotice: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  limitedTimeText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
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
  // Duplicate styles removed - keeping only the first definition
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
  paymentNote: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  paymentNoteText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});