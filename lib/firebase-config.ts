import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { testDataGenerator } from './setupTestData';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: any;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Demo and Development Configuration
export class FirebaseConfig {
  private static isEmulatorConnected = false;

  /**
   * Initialize Firebase for development with emulators
   */
  static async initializeForDevelopment(): Promise<void> {
    if (process.env.NODE_ENV === 'development' && !this.isEmulatorConnected) {
      try {
        console.log('🔧 Connecting to Firebase emulators...');

        // Connect to Firestore emulator (default port 8080)
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('✅ Firestore emulator connected');

        // Connect to Functions emulator (default port 5001)
        connectFunctionsEmulator(functions, 'localhost', 5001);
        console.log('✅ Functions emulator connected');

        // Connect to Storage emulator (default port 9199)
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log('✅ Storage emulator connected');

        this.isEmulatorConnected = true;
        console.log('🚀 Firebase emulators initialized successfully');
      } catch (error) {
        console.error('❌ Failed to connect to Firebase emulators:', error);
      }
    }
  }

  /**
   * Setup test data for demo purposes
   */
  static async setupDemoData(): Promise<void> {
    try {
      console.log('🎭 Setting up demo data...');
      await testDataGenerator.setupTestData();
      console.log('✅ Demo data setup completed');
    } catch (error) {
      console.error('❌ Failed to setup demo data:', error);
      throw error;
    }
  }

  /**
   * Reset database for demo purposes (WARNING: This will delete all data)
   */
  static async resetDemoDatabase(): Promise<void> {
    try {
      console.log('⚠️ Resetting demo database...');
      await testDataGenerator.clearAllData();
      console.log('✅ Database reset completed');
    } catch (error) {
      console.error('❌ Failed to reset database:', error);
      throw error;
    }
  }

  /**
   * Initialize Firebase with demo data (for presentations or testing)
   */
  static async initializeWithDemoData(): Promise<void> {
    try {
      console.log('🚀 Initializing Firebase with demo data...');

      // Initialize emulators for development
      await this.initializeForDevelopment();

      // Clear existing data
      await this.resetDemoDatabase();

      // Setup fresh demo data
      await this.setupDemoData();

      console.log('🎉 Firebase initialization with demo data completed!');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase with demo data:', error);
      throw error;
    }
  }

  /**
   * Check if Firebase is properly configured
   */
  static validateConfiguration(): boolean {
    const requiredEnvVars = [
      'EXPO_PUBLIC_FIREBASE_API_KEY',
      'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
      'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'EXPO_PUBLIC_FIREBASE_APP_ID'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      console.error('❌ Missing Firebase environment variables:', missingVars);
      return false;
    }

    console.log('✅ Firebase configuration is valid');
    return true;
  }

  /**
   * Get Firebase configuration status
   */
  static getConfigurationStatus(): {
    isValid: boolean;
    emulatorsConnected: boolean;
    environment: string;
    projectId: string;
  } {
    return {
      isValid: this.validateConfiguration(),
      emulatorsConnected: this.isEmulatorConnected,
      environment: process.env.NODE_ENV || 'production',
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'unknown'
    };
  }
}

// Utility functions for the app
export const getCurrentUserId = (): string | null => {
  const user = auth.currentUser;
  return user ? user.uid : null;
};

export const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return 'Unknown';
  try {
    return timestamp.toDate().toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
};

export const formatTime = (timestamp: any): string => {
  if (!timestamp) return 'Unknown';
  try {
    return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Invalid Time';
  }
};

// Error handling utilities
export class FirebaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'FirebaseError';
  }
}

export const handleFirebaseError = (error: any): FirebaseError => {
  console.error('Firebase operation failed:', error);

  if (error.code) {
    switch (error.code) {
      case 'permission-denied':
        return new FirebaseError('Access denied. Please check your permissions.', error.code);
      case 'not-found':
        return new FirebaseError('The requested document was not found.', error.code);
      case 'already-exists':
        return new FirebaseError('This document already exists.', error.code);
      case 'failed-precondition':
        return new FirebaseError('Operation failed due to current state.', error.code);
      case 'unavailable':
        return new FirebaseError('Service temporarily unavailable. Please try again.', error.code);
      default:
        return new FirebaseError(error.message || 'An unknown Firebase error occurred.', error.code);
    }
  }

  return new FirebaseError(error.message || 'An unexpected error occurred.');
};

// Export the main Firebase app instance
export default app;