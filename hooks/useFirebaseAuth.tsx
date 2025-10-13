import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getCurrentUserId } from '@/lib/firebase-services';
import { AuthService, DatabaseService, UserProfile } from '@/lib/firebase-services';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // User is signed in, get or create profile
        try {
          let profile = await DatabaseService.getUserProfile(firebaseUser.uid);

          if (!profile) {
            // Create new profile if it doesn't exist
            await DatabaseService.createUserProfile(firebaseUser);
            profile = await DatabaseService.getUserProfile(firebaseUser.uid);
          }

          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        // User is signed out
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await AuthService.signIn(email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      const userCredential = await AuthService.signUp(email, password);

      // Create user profile
      await DatabaseService.createUserProfile(userCredential.user, { displayName });

      // Get the created profile
      const profile = await DatabaseService.getUserProfile(userCredential.user.uid);
      setUserProfile(profile);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      await AuthService.signOut();
      setUserProfile(null);
      setUser(null);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut: signOutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};