import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { auth, db } from './firebase';

// Types for our app
export interface Goal {
  id: string;
  title: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  category: 'screen_time' | 'focus' | 'mindfulness' | 'activity' | 'custom';
  userId: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  totalPoints: number;
  dailyPrize?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Activity {
  id: string;
  userId: string;
  title: string;
  completedAt: Timestamp;
  points: number;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: 'success' | 'challenge' | 'tip' | 'motivation';
  memberCount: number;
  createdBy: string;
  createdAt: Timestamp;
  isPublic: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  category: 'success' | 'challenge' | 'tip' | 'motivation';
  image?: string;
  likes: number;
  comments: number;
  createdAt: Timestamp;
  communityId?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  likes: number;
  createdAt: Timestamp;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Timestamp;
}

export interface Ranking {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  streak: number;
  level: string;
  country: string;
  badges: string[];
  lastUpdated: Timestamp;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  category: 'success' | 'challenge' | 'tip' | 'motivation';
  image?: string;
  likes: number;
  comments: number;
  createdAt: Timestamp;
  communityId?: string;
  likedBy?: string[];
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  likes: number;
  createdAt: Timestamp;
  likedBy?: string[];
}

export interface UserFriend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Timestamp;
  friendProfile?: {
    name: string;
    avatar: string;
    level: string;
    streak: number;
    lastSeen: string;
    isOnline: boolean;
  };
}

// Authentication Services
export class AuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string): Promise<UserCredential> {
    return await createUserWithEmailAndPassword(auth, email, password);
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(auth, email, password);
  }

  // Sign out
  static async signOut(): Promise<void> {
    return await signOut(auth);
  }

  // Get current user
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}

// Database Services
export class DatabaseService {
  // User Profile Services
  static async createUserProfile(user: User, additionalData?: Partial<UserProfile>): Promise<void> {
    const userProfile: UserProfile = {
      id: user.uid,
      email: user.email!,
      displayName: user.displayName || additionalData?.displayName,
      avatar: additionalData?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      totalPoints: 0,
      dailyPrize: '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      ...additionalData
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  // Goals Services
  static async createGoal(goalData: Omit<Goal, 'id' | 'createdAt'>): Promise<string> {
    try {
      console.log('Creating goal in Firebase:', goalData);
      const goalsRef = collection(db, 'goals');
      const docRef = await addDoc(goalsRef, {
        ...goalData,
        createdAt: Timestamp.now()
      });
      console.log('Goal created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating goal in Firebase:', error);
      throw error;
    }
  }

  static async getUserGoals(userId: string): Promise<Goal[]> {
    try {
      console.log('Fetching goals for user:', userId);

      // First get all goals for the user without ordering (no index needed)
      const q = query(
        collection(db, 'goals'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const goals = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Goal[];

      // Then sort them manually by createdAt (client-side sorting)
      const sortedGoals = goals.sort((a, b) =>
        b.createdAt.toMillis() - a.createdAt.toMillis()
      );

      console.log('Retrieved and sorted goals:', sortedGoals);
      return sortedGoals;
    } catch (error) {
      console.error('Error fetching goals from Firebase:', error);
      throw error;
    }
  }

  static async updateGoal(goalId: string, updates: Partial<Goal>): Promise<void> {
    const goalRef = doc(db, 'goals', goalId);
    await updateDoc(goalRef, updates);
  }

  static async deleteGoal(goalId: string): Promise<void> {
    await deleteDoc(doc(db, 'goals', goalId));
  }

  // Activities Services
  static async addActivity(activityData: Omit<Activity, 'id'>): Promise<string> {
    const activitiesRef = collection(db, 'activities');
    const docRef = await addDoc(activitiesRef, activityData);
    return docRef.id;
  }

  static async getUserActivities(userId: string, limitCount: number = 10): Promise<Activity[]> {
    try {
      console.log('Fetching activities for user:', userId);

      // First get activities without ordering (no index needed)
      const q = query(
        collection(db, 'activities'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const activities = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[];

      // Sort by completedAt and limit results (client-side)
      const sortedActivities = activities
        .sort((a, b) => b.completedAt.toMillis() - a.completedAt.toMillis())
        .slice(0, limitCount);

      console.log('Retrieved and sorted activities:', sortedActivities);
      return sortedActivities;
    } catch (error) {
      console.error('Error fetching activities from Firebase:', error);
      throw error;
    }
  }

  // Points calculation and management
  static async updateUserPoints(userId: string, pointsToAdd: number): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const currentPoints = userDoc.data().totalPoints || 0;
      await updateDoc(userRef, {
        totalPoints: currentPoints + pointsToAdd,
        updatedAt: Timestamp.now()
      });
    }
  }

  static async completeGoal(goalId: string, userId: string): Promise<void> {
    const goalRef = doc(db, 'goals', goalId);
    const goalDoc = await getDoc(goalRef);

    if (goalDoc.exists()) {
      const goal = goalDoc.data() as Goal;

      // Update goal as completed
      await updateDoc(goalRef, {
        completed: true,
        completedAt: Timestamp.now()
      });

      // Add points to user
      await this.updateUserPoints(userId, goal.points);

      // Add activity record
      await this.addActivity({
        userId,
        title: goal.title,
        completedAt: Timestamp.now(),
        points: goal.points
      });
    }
  }

  // Communities and Posts Services
  static async createPost(postData: Omit<CommunityPost, 'id' | 'createdAt' | 'likes' | 'comments'>): Promise<string> {
    const postsRef = collection(db, 'posts');
    const docRef = await addDoc(postsRef, {
      ...postData,
      likes: 0,
      comments: 0,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }

  static async getPosts(limitCount: number = 20): Promise<CommunityPost[]> {
    try {
      const q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityPost[];

      return posts;
    } catch (error) {
      console.error('Error fetching posts from Firebase:', error);
      throw error;
    }
  }

  static async likePost(postId: string, userId: string): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);

    if (postDoc.exists()) {
      const post = postDoc.data() as CommunityPost;
      const likedBy = post.likedBy || [];

      if (!likedBy.includes(userId)) {
        // Add like
        await updateDoc(postRef, {
          likes: post.likes + 1,
          likedBy: [...likedBy, userId]
        });
      } else {
        // Remove like
        await updateDoc(postRef, {
          likes: post.likes - 1,
          likedBy: likedBy.filter(id => id !== userId)
        });
      }
    }
  }

  // Friends Services
  static async sendFriendRequest(friendId: string): Promise<string> {
    if (!auth.currentUser) throw new Error('User not authenticated');

    try {
      // Check if a request already exists between these users
      const existingRequestQuery = query(
        collection(db, 'friendRequests'),
        where('userId', '==', auth.currentUser.uid),
        where('friendId', '==', friendId)
      );

      const existingRequests = await getDocs(existingRequestQuery);
      if (!existingRequests.empty) {
        throw new Error('Friend request already sent');
      }

      // Check if they're already friends
      const existingFriendshipQuery = query(
        collection(db, 'friends'),
        where('userId', '==', auth.currentUser.uid),
        where('friendId', '==', friendId)
      );

      const existingFriendship = await getDocs(existingFriendshipQuery);
      if (!existingFriendship.empty) {
        throw new Error('Already friends with this user');
      }

      const friendRequest: Omit<UserFriend, 'id' | 'createdAt'> = {
        userId: auth.currentUser.uid,
        friendId,
        status: 'pending'
      };

      const friendRequestsRef = collection(db, 'friendRequests');
      const docRef = await addDoc(friendRequestsRef, {
        ...friendRequest,
        createdAt: Timestamp.now()
      });

      console.log('✅ Friend request sent successfully');
      return docRef.id;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  static async getUserFriends(userId: string): Promise<UserFriend[]> {
    try {
      const q = query(
        collection(db, 'friends'),
        where('userId', '==', userId),
        where('status', '==', 'accepted')
      );

      const querySnapshot = await getDocs(q);
      const friends = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserFriend[];

      return friends;
    } catch (error) {
      console.error('Error fetching friends from Firebase:', error);
      throw error;
    }
  }

  static async getFriendRequests(userId: string): Promise<UserFriend[]> {
    try {
      const q = query(
        collection(db, 'friendRequests'),
        where('friendId', '==', userId),
        where('status', '==', 'pending')
      );

      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserFriend[];

      return requests;
    } catch (error) {
      console.error('Error fetching friend requests from Firebase:', error);
      throw error;
    }
  }

  static async respondToFriendRequest(requestId: string, accept: boolean): Promise<void> {
    try {
      const requestRef = doc(db, 'friendRequests', requestId);
      const requestDoc = await getDoc(requestRef);

      if (!requestDoc.exists()) {
        throw new Error('Friend request not found');
      }

      const requestData = requestDoc.data() as UserFriend;

      if (accept) {
        // Create friendship records in both directions
        const friendship1: Omit<UserFriend, 'id' | 'createdAt'> = {
          userId: requestData.userId,
          friendId: requestData.friendId,
          status: 'accepted'
        };

        const friendship2: Omit<UserFriend, 'id' | 'createdAt'> = {
          userId: requestData.friendId,
          friendId: requestData.userId,
          status: 'accepted'
        };

        // Add to friends collection (bidirectional)
        const friendsRef1 = doc(collection(db, 'friends'));
        const friendsRef2 = doc(collection(db, 'friends'));

        await setDoc(friendsRef1, { ...friendship1, id: friendsRef1.id, createdAt: Timestamp.now() });
        await setDoc(friendsRef2, { ...friendship2, id: friendsRef2.id, createdAt: Timestamp.now() });

        console.log('✅ Friendship created successfully');
      }

      // Update or delete the original request
      if (accept) {
        // Remove the original request since friendship is established
        await deleteDoc(requestRef);
      } else {
        // Update status to blocked if declined
        await updateDoc(requestRef, {
          status: 'blocked'
        });
      }

      console.log(`✅ Friend request ${accept ? 'accepted' : 'declined'} successfully`);
    } catch (error) {
      console.error('Error responding to friend request:', error);
      throw error;
    }
  }

  static async getSuggestedFriends(userId: string, limitCount: number = 10): Promise<any[]> {
    try {
      // Get users who are not already friends and not the current user
      const friendsQuery = query(
        collection(db, 'friendRequests'),
        where('status', '==', 'accepted')
      );

      const friendsSnapshot = await getDocs(friendsQuery);
      const friendIds = new Set();

      friendsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.userId === userId) friendIds.add(data.friendId);
        if (data.friendId === userId) friendIds.add(data.userId);
      });

      // Get all users
      const usersQuery = query(collection(db, 'users'), limit(limitCount * 2));
      const usersSnapshot = await getDocs(usersQuery);
      const allUsers = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter out current user and existing friends
      const suggestedUsers = allUsers.filter(user =>
        user.id !== userId && !friendIds.has(user.id)
      ).slice(0, limitCount);

      return suggestedUsers;
    } catch (error) {
      console.error('Error fetching suggested friends:', error);
      throw error;
    }
  }

  // Rankings/Leaderboard Services
  static async getLeaderboard(limitCount: number = 50): Promise<any[]> {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('totalPoints', 'desc'),
        limit(limitCount)
      );

      const usersSnapshot = await getDocs(usersQuery);
      const users = usersSnapshot.docs.map((doc, index) => {
        const userData = doc.data();
        return {
          id: doc.id,
          name: userData.displayName || userData.email?.split('@')[0] || 'User',
          avatar: userData.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
          points: userData.totalPoints || 0,
          rank: index + 1,
          level: `Level ${Math.floor((userData.totalPoints || 0) / 100) + 1}`,
          streak: Math.floor((userData.totalPoints || 0) / 50),
          country: '🇺🇸', // Default, could be added to user profile
          weeklyChange: Math.floor(Math.random() * 20) - 10, // Mock data for now
          badges: ['🎯', '💎', '🚀'], // Mock data for now
        };
      });

      return users;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  static async updateUserRanking(userId: string): Promise<void> {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (userProfile) {
        // Update user's ranking data
        const rankingData = {
          userId,
          userName: userProfile.displayName || userProfile.email?.split('@')[0] || 'User',
          userAvatar: userProfile.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
          totalPoints: userProfile.totalPoints || 0,
          weeklyPoints: 0, // Would need to calculate weekly points
          monthlyPoints: 0, // Would need to calculate monthly points
          streak: Math.floor((userProfile.totalPoints || 0) / 50),
          level: `Level ${Math.floor((userProfile.totalPoints || 0) / 100) + 1}`,
          country: '🇺🇸', // Default
          badges: ['🎯', '💎', '🚀'], // Mock data for now
          lastUpdated: Timestamp.now()
        };

        // Update or create ranking document
        await setDoc(doc(db, 'rankings', userId), rankingData);
      }
    } catch (error) {
      console.error('Error updating user ranking:', error);
      throw error;
    }
  }

  static async addComment(commentData: Omit<CommunityComment, 'id' | 'createdAt' | 'likes'>): Promise<string> {
    const commentsRef = collection(db, 'comments');
    const docRef = await addDoc(commentsRef, {
      ...commentData,
      likes: 0,
      createdAt: Timestamp.now()
    });

    // Update post comment count
    const postRef = doc(db, 'posts', commentData.postId);
    const postDoc = await getDoc(postRef);
    if (postDoc.exists()) {
      const post = postDoc.data() as CommunityPost;
      await updateDoc(postRef, {
        comments: post.comments + 1
      });
    }

    return docRef.id;
  }

  static async getPostComments(postId: string): Promise<CommunityComment[]> {
    try {
      const q = query(
        collection(db, 'comments'),
        where('postId', '==', postId),
        orderBy('createdAt', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const comments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityComment[];

      return comments;
    } catch (error) {
      console.error('Error fetching comments from Firebase:', error);
      throw error;
    }
  }

  static async likeComment(commentId: string, userId: string): Promise<void> {
    const commentRef = doc(db, 'comments', commentId);
    const commentDoc = await getDoc(commentRef);

    if (commentDoc.exists()) {
      const comment = commentDoc.data() as CommunityComment;
      const likedBy = comment.likedBy || [];

      if (!likedBy.includes(userId)) {
        await updateDoc(commentRef, {
          likes: comment.likes + 1,
          likedBy: [...likedBy, userId]
        });
      } else {
        await updateDoc(commentRef, {
          likes: comment.likes - 1,
          likedBy: likedBy.filter(id => id !== userId)
        });
      }
    }
  }
}

// Utility functions
export const getCurrentUserId = (): string | null => {
  const user = auth.currentUser;
  return user ? user.uid : null;
};

export const formatTimestamp = (timestamp: Timestamp): string => {
  return timestamp.toDate().toLocaleDateString();
};

export const formatTime = (timestamp: Timestamp): string => {
  return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};