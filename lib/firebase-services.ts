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
  QueryDocumentSnapshot,
  onSnapshot,
  Query,
  Unsubscribe
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from './firebase-config';
import {
  deleteMediaWithAuth,
  deleteMediaBatch,
  deleteOldProfileImage,
  cleanupOrphanedMedia,
  cleanupOldMedia,
  cleanupTempMedia,
  getStorageStats
} from './storage-service';

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
  isPrivate?: boolean; // Default false (public)
  subscriptionPlan?: 'free' | 'pro' | 'promax'; // Subscription plan
  country?: string; // User's country for rankings
  age?: number; // User's age
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'; // User's gender
  bio?: string; // User's bio/introduction
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
  userId: string;
  content: string;
  timestamp: Timestamp;
  likes: string[]; // array of user IDs
  replies: Reply[];
  communityId?: string;
}

export interface Reply {
  id: string;
  userId: string;
  content: string;
  timestamp: Timestamp;
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
   userId: string;
   content: string;
   timestamp: Timestamp;
   likes: string[]; // array of user IDs
   replies: Reply[];
   communityId?: string;
   mediaUrl?: string;
   mediaType?: 'image' | 'video';
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

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  timestamp: Timestamp;
  isRead: boolean;
  messageType: 'text' | 'image' | 'system';
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
      isPrivate: false, // Default to public
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

    // Handle avatar update with old image cleanup
    if (updates.avatar) {
      try {
        // Get current profile to get the old avatar URL
        const currentProfile = await this.getUserProfile(userId);
        const oldAvatarUrl = currentProfile?.avatar;

        // Update profile first
        await updateDoc(docRef, {
          ...updates,
          updatedAt: Timestamp.now()
        });

        // Delete old avatar image if it exists and is not a default/placeholder
        if (oldAvatarUrl && oldAvatarUrl !== updates.avatar) {
          try {
            await deleteOldProfileImage(oldAvatarUrl, userId);
            console.log(`✅ Old avatar cleaned up for user: ${userId}`);
          } catch (cleanupError) {
            console.error(`Failed to cleanup old avatar for user ${userId}:`, cleanupError);
            // Don't throw error - profile update succeeded
          }
        }
      } catch (error) {
        console.error('Error updating user profile with avatar cleanup:', error);
        throw error;
      }
    } else {
      // Standard profile update without avatar changes
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    }
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
  static async createPost(postData: Omit<CommunityPost, 'id' | 'timestamp' | 'likes' | 'replies'>): Promise<string> {
    const postsRef = collection(db, 'posts');
    const docRef = await addDoc(postsRef, {
      ...postData,
      likes: [],
      replies: [],
      timestamp: Timestamp.now()
    });
    return docRef.id;
  }

  static async getPosts(limitCount: number = 20, startAfter?: any): Promise<CommunityPost[]> {
    try {
      let q = query(
        collection(db, 'posts'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      if (startAfter) {
        q = query(q, startAfter(startAfter));
      }

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

  // Get single post
  static async getPost(postId: string): Promise<CommunityPost | null> {
    const docRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as CommunityPost;
    }
    return null;
  }

  // Real-time listener for posts
  static listenToPosts(callback: (posts: CommunityPost[]) => void, limitCount: number = 20): Unsubscribe {
    const q = query(
      collection(db, 'posts'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(q, (querySnapshot) => {
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityPost[];
      callback(posts);
    });
  }

  static async likePost(postId: string, userId: string): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);

    if (postDoc.exists()) {
      const post = postDoc.data() as CommunityPost;
      const likes = post.likes || [];

      if (!likes.includes(userId)) {
        // Add like
        await updateDoc(postRef, {
          likes: [...likes, userId]
        });
      } else {
        // Remove like
        await updateDoc(postRef, {
          likes: likes.filter(id => id !== userId)
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

  // User Search Services
  static async searchUsersByUsername(searchQuery: string, limitCount: number = 20): Promise<UserProfile[]> {
    if (!searchQuery || searchQuery.trim().length < 2) {
      return [];
    }

    try {
      console.log('Searching users by username:', searchQuery);

      // Get current user ID to exclude from results
      const currentUser = auth.currentUser;
      const currentUserId = currentUser?.uid;

      // Query users collection - we'll search in displayName and email fields
      // Note: For case-insensitive search, we need to query both fields
      const usersRef = collection(db, 'users');

      // Get all users first (in a real app with many users, you'd want to implement
      // a more sophisticated search with indexes)
      const usersQuery = query(usersRef, limit(limitCount * 2));
      const usersSnapshot = await getDocs(usersQuery);

      const allUsers = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserProfile[];

      // Filter users based on search query (client-side filtering)
      const searchTerm = searchQuery.toLowerCase().trim();
      const matchingUsers = allUsers.filter(user => {
        // Skip current user
        if (currentUserId && user.id === currentUserId) {
          return false;
        }

        // Search in displayName and email
        const displayName = (user.displayName || '').toLowerCase();
        const email = (user.email || '').toLowerCase();

        return displayName.includes(searchTerm) || email.includes(searchTerm);
      });

      // Limit results and sort by relevance (displayName matches first, then email matches)
      const sortedUsers = matchingUsers
        .sort((a, b) => {
          const aDisplayName = (a.displayName || '').toLowerCase();
          const bDisplayName = (b.displayName || '').toLowerCase();
          const aEmail = (a.email || '').toLowerCase();
          const bEmail = (b.email || '').toLowerCase();

          // Prioritize displayName matches over email matches
          const aHasDisplayNameMatch = aDisplayName.includes(searchTerm);
          const bHasDisplayNameMatch = bDisplayName.includes(searchTerm);

          if (aHasDisplayNameMatch && !bHasDisplayNameMatch) return -1;
          if (!aHasDisplayNameMatch && bHasDisplayNameMatch) return 1;

          // For same match type, sort alphabetically
          return aDisplayName.localeCompare(bDisplayName);
        })
        .slice(0, limitCount);

      console.log(`Found ${sortedUsers.length} users matching "${searchQuery}"`);
      return sortedUsers;
    } catch (error) {
      console.error('Error searching users by username:', error);
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

  static async addReply(postId: string, replyData: Omit<Reply, 'id' | 'timestamp'>): Promise<string> {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);

    if (postDoc.exists()) {
      const post = postDoc.data() as CommunityPost;
      const newReply: Reply = {
        id: Date.now().toString(), // Simple ID generation
        ...replyData,
        timestamp: Timestamp.now()
      };

      await updateDoc(postRef, {
        replies: [...post.replies, newReply]
      });

      return newReply.id;
    }
    throw new Error('Post not found');
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

  static async createCommunity(communityData: Omit<Community, 'id' | 'createdAt' | 'memberCount'>): Promise<string> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const community: Omit<Community, 'id'> = {
        ...communityData,
        memberCount: 1, // Creator is the first member
        createdAt: Timestamp.now()
      };

      const communitiesRef = collection(db, 'communities');
      const docRef = await addDoc(communitiesRef, community);

      console.log('✅ Community created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating community in Firebase:', error);
      throw error;
    }
  }

  static async getCommunity(communityId: string): Promise<Community | null> {
    try {
      const communitiesQuery = query(
        collection(db, 'communities'),
        where('id', '==', communityId)
      );

      const communitiesSnapshot = await getDocs(communitiesQuery);
      if (!communitiesSnapshot.empty) {
        const communityDoc = communitiesSnapshot.docs[0];
        return {
          id: communityDoc.id,
          ...communityDoc.data()
        } as Community;
      }

      return null;
    } catch (error) {
      console.error('Error fetching community from Firebase:', error);
      throw error;
    }
  }

  static async getUserCommunities(userId: string): Promise<Community[]> {
    try {
      const communitiesQuery = query(
        collection(db, 'communities'),
        where('createdBy', '==', userId)
      );

      const communitiesSnapshot = await getDocs(communitiesQuery);
      const communities = communitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Community[];

      return communities;
    } catch (error) {
      console.error('Error fetching user communities from Firebase:', error);
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

  // Chat Services
  static generateChatId(userId1: string, userId2: string): string {
    // Create a consistent chat ID by sorting user IDs alphabetically
    const sortedIds = [userId1, userId2].sort();
    return sortedIds.join('_');
  }

  static async saveChatMessage(
    senderId: string,
    receiverId: string,
    message: string,
    messageType: 'text' | 'image' | 'system' = 'text'
  ): Promise<string> {
    if (!auth.currentUser) throw new Error('User not authenticated');

    try {
      // Get sender profile for name and avatar
      const senderProfile = await this.getUserProfile(senderId);
      if (!senderProfile) throw new Error('Sender profile not found');

      const chatId = this.generateChatId(senderId, receiverId);

      // Provide fallback values for missing avatar and display name
      const fallbackAvatar = 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100';

      const chatMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
        chatId,
        senderId,
        senderName: senderProfile.displayName || senderProfile.email?.split('@')[0] || 'User',
        senderAvatar: senderProfile.avatar || fallbackAvatar,
        message,
        isRead: false,
        messageType
      };

      // Save message to subcollection: chats/{chatId}/messages/{messageId}
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const docRef = await addDoc(messagesRef, {
        ...chatMessage,
        timestamp: Timestamp.now()
      });

      console.log('✅ Chat message saved successfully');
      return docRef.id;
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  }

  static async getChatHistory(
    currentUserId: string,
    otherUserId: string,
    limitCount: number = 50
  ): Promise<ChatMessage[]> {
    try {
      const chatId = this.generateChatId(currentUserId, otherUserId);

      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(messagesQuery);
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];

      // Sort messages chronologically (oldest first) for display
      const sortedMessages = messages
        .sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis())
        .map(message => ({
          ...message,
          // Mark messages as read when loading chat history
          isRead: message.senderId === currentUserId ? message.isRead : true
        }));

      console.log('✅ Chat history loaded successfully');
      return sortedMessages;
    } catch (error) {
      console.error('Error loading chat history:', error);
      throw error;
    }
  }

  static setupChatListener(
    currentUserId: string,
    otherUserId: string,
    callback: (messages: ChatMessage[]) => void
  ): Unsubscribe {
    try {
      const chatId = this.generateChatId(currentUserId, otherUserId);

      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChatMessage[];

        // Sort messages chronologically and mark current user's messages as read
        const sortedMessages = messages
          .sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis())
          .map(message => ({
            ...message,
            isRead: message.senderId === currentUserId ? message.isRead : true
          }));

        callback(sortedMessages);
      }, (error) => {
        console.error('Error in chat listener:', error);
      });

      console.log('✅ Chat listener setup successfully');
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up chat listener:', error);
      throw error;
    }
  }

  static async markMessagesAsRead(
    currentUserId: string,
    otherUserId: string,
    messageIds?: string[]
  ): Promise<void> {
    try {
      const chatId = this.generateChatId(currentUserId, otherUserId);

      if (messageIds && messageIds.length > 0) {
        // Mark specific messages as read
        const updatePromises = messageIds.map(messageId => {
          const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
          return updateDoc(messageRef, { isRead: true });
        });
        await Promise.all(updatePromises);
      } else {
        // Mark all unread messages from other user as read
        const messagesQuery = query(
          collection(db, 'chats', chatId, 'messages'),
          where('senderId', '==', otherUserId),
          where('isRead', '==', false)
        );

        const querySnapshot = await getDocs(messagesQuery);
        const updatePromises = querySnapshot.docs.map(doc =>
          updateDoc(doc.ref, { isRead: true })
        );
        await Promise.all(updatePromises);
      }

      console.log('✅ Messages marked as read');
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Post Management with Media Cleanup
  static async deletePost(postId: string, userId: string): Promise<void> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      // Get the post first to verify ownership and get media URL
      const post = await this.getPost(postId);
      if (!post) {
        throw new Error('Post not found');
      }

      // Check if user owns the post
      if (post.userId !== userId) {
        throw new Error('Unauthorized: User does not own this post');
      }

      // Delete associated media if it exists
      if (post.mediaUrl) {
        try {
          await deleteMediaWithAuth(post.mediaUrl, userId, userId);
          console.log(`✅ Post media deleted: ${post.mediaUrl}`);
        } catch (mediaError) {
          console.error('Error deleting post media:', mediaError);
          // Continue with post deletion even if media deletion fails
        }
      }

      // Delete the post from database
      await deleteDoc(doc(db, 'posts', postId));

      console.log(`✅ Post deleted successfully: ${postId} by user: ${userId}`);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  static async deleteUserPosts(userId: string): Promise<{ successful: string[], failed: string[] }> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      // Verify the current user is deleting their own posts or is an admin
      if (auth.currentUser.uid !== userId) {
        throw new Error('Unauthorized: Can only delete own posts');
      }

      const results = {
        successful: [] as string[],
        failed: [] as string[]
      };

      // Get all posts by the user
      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', userId)
      );

      const postsSnapshot = await getDocs(postsQuery);
      const posts = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityPost[];

      if (posts.length === 0) {
        console.log(`✅ No posts found for user: ${userId}`);
        return results;
      }

      // Collect all media URLs for batch deletion
      const mediaUrls: string[] = [];
      posts.forEach(post => {
        if (post.mediaUrl) {
          mediaUrls.push(post.mediaUrl);
        }
      });

      // Delete all media files in batch
      if (mediaUrls.length > 0) {
        try {
          const mediaResults = await deleteMediaBatch(mediaUrls, userId, userId);
          console.log(`✅ Media deletion completed: ${mediaResults.successful.length} successful, ${mediaResults.failed.length} failed`);
        } catch (mediaError) {
          console.error('Error during batch media deletion:', mediaError);
        }
      }

      // Delete all posts (use batch writes for better performance)
      const BATCH_SIZE = 10;
      for (let i = 0; i < posts.length; i += BATCH_SIZE) {
        const batch = posts.slice(i, i + BATCH_SIZE);

        // For simplicity, we'll delete posts individually
        // In a production app, you might want to use Firestore batch writes
        const deletePromises = batch.map(async (post) => {
          try {
            await deleteDoc(doc(db, 'posts', post.id));
            results.successful.push(post.id);
          } catch (error) {
            console.error(`Failed to delete post ${post.id}:`, error);
            results.failed.push(post.id);
          }
        });

        await Promise.allSettled(deletePromises);
      }

      console.log(`✅ User posts deletion completed: ${results.successful.length} successful, ${results.failed.length} failed`);
      return results;
    } catch (error) {
      console.error('Error deleting user posts:', error);
      throw error;
    }
  }

  static async deleteCommunityPosts(communityId: string, userId: string): Promise<{ successful: string[], failed: string[] }> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      // Verify community ownership or moderator permissions
      const community = await this.getCommunity(communityId);
      if (!community) {
        throw new Error('Community not found');
      }

      // Check if user is the community owner
      if (community.createdBy !== userId) {
        throw new Error('Unauthorized: Only community owners can delete community posts');
      }

      const results = {
        successful: [] as string[],
        failed: [] as string[]
      };

      // Get all posts in the community
      const postsQuery = query(
        collection(db, 'posts'),
        where('communityId', '==', communityId)
      );

      const postsSnapshot = await getDocs(postsQuery);
      const posts = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityPost[];

      if (posts.length === 0) {
        console.log(`✅ No posts found for community: ${communityId}`);
        return results;
      }

      // Collect all media URLs for batch deletion
      const mediaUrls: string[] = [];
      posts.forEach(post => {
        if (post.mediaUrl) {
          mediaUrls.push(post.mediaUrl);
        }
      });

      // Delete all media files in batch
      if (mediaUrls.length > 0) {
        try {
          const mediaResults = await deleteMediaBatch(mediaUrls, userId);
          console.log(`✅ Community media deletion completed: ${mediaResults.successful.length} successful, ${mediaResults.failed.length} failed`);
        } catch (mediaError) {
          console.error('Error during community batch media deletion:', mediaError);
        }
      }

      // Delete all posts
      const BATCH_SIZE = 10;
      for (let i = 0; i < posts.length; i += BATCH_SIZE) {
        const batch = posts.slice(i, i + BATCH_SIZE);

        const deletePromises = batch.map(async (post) => {
          try {
            await deleteDoc(doc(db, 'posts', post.id));
            results.successful.push(post.id);
          } catch (error) {
            console.error(`Failed to delete community post ${post.id}:`, error);
            results.failed.push(post.id);
          }
        });

        await Promise.allSettled(deletePromises);
      }

      console.log(`✅ Community posts deletion completed: ${results.successful.length} successful, ${results.failed.length} failed`);
      return results;
    } catch (error) {
      console.error('Error deleting community posts:', error);
      throw error;
    }
  }

  // Media Cleanup and Management Functions
  static async cleanupUserOrphanedMedia(userId: string): Promise<{ cleaned: string[], errors: string[] }> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      // Verify user is cleaning up their own media
      if (auth.currentUser.uid !== userId) {
        throw new Error('Unauthorized: Can only cleanup own media');
      }

      console.log(`🧹 Starting orphaned media cleanup for user: ${userId}`);
      const results = await cleanupOrphanedMedia(userId);

      console.log(`✅ Orphaned media cleanup completed for user ${userId}: ${results.cleaned.length} cleaned, ${results.errors.length} errors`);
      return results;
    } catch (error) {
      console.error('Error during user orphaned media cleanup:', error);
      throw error;
    }
  }

  static async cleanupOldUserMedia(userId: string, daysOld: number = 30): Promise<{ cleaned: string[], errors: string[] }> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      // Verify user is cleaning up their own media
      if (auth.currentUser.uid !== userId) {
        throw new Error('Unauthorized: Can only cleanup own media');
      }

      console.log(`🧹 Starting old media cleanup for user: ${userId} (older than ${daysOld} days)`);
      const results = await cleanupOldMedia(daysOld, userId);

      console.log(`✅ Old media cleanup completed for user ${userId}: ${results.cleaned.length} cleaned, ${results.errors.length} errors`);
      return results;
    } catch (error) {
      console.error('Error during old media cleanup:', error);
      throw error;
    }
  }

  static async cleanupTempUserMedia(userId: string): Promise<{ cleaned: string[], errors: string[] }> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      // Verify user is cleaning up their own media
      if (auth.currentUser.uid !== userId) {
        throw new Error('Unauthorized: Can only cleanup own media');
      }

      console.log(`🧹 Starting temp media cleanup for user: ${userId}`);
      const results = await cleanupTempMedia(userId);

      console.log(`✅ Temp media cleanup completed for user ${userId}: ${results.cleaned.length} cleaned, ${results.errors.length} errors`);
      return results;
    } catch (error) {
      console.error('Error during temp media cleanup:', error);
      throw error;
    }
  }

  static async getUserStorageStats(userId: string): Promise<{ totalFiles: number, totalSize: number, oldestFile?: Date, newestFile?: Date }> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      // Verify user is getting stats for their own media
      if (auth.currentUser.uid !== userId) {
        throw new Error('Unauthorized: Can only get stats for own media');
      }

      console.log(`📊 Getting storage stats for user: ${userId}`);
      const stats = await getStorageStats(userId);

      console.log(`✅ Storage stats retrieved for user ${userId}: ${stats.totalFiles} files, ${stats.totalSize} bytes`);
      return stats;
    } catch (error) {
      console.error('Error getting user storage stats:', error);
      throw error;
    }
  }

  static async comprehensiveUserCleanup(userId: string): Promise<{
    orphaned: { cleaned: string[], errors: string[] },
    old: { cleaned: string[], errors: string[] },
    temp: { cleaned: string[], errors: string[] }
  }> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      // Verify user is cleaning up their own media
      if (auth.currentUser.uid !== userId) {
        throw new Error('Unauthorized: Can only cleanup own media');
      }

      console.log(`🧹 Starting comprehensive cleanup for user: ${userId}`);

      const results = {
        orphaned: { cleaned: [] as string[], errors: [] as string[] },
        old: { cleaned: [] as string[], errors: [] as string[] },
        temp: { cleaned: [] as string[], errors: [] as string[] }
      };

      // Run all cleanup operations
      try {
        results.orphaned = await cleanupOrphanedMedia(userId);
      } catch (error) {
        console.error('Error in orphaned cleanup:', error);
        results.orphaned.errors.push(error instanceof Error ? error.message : 'Unknown error');
      }

      try {
        results.old = await cleanupOldMedia(30, userId); // 30 days
      } catch (error) {
        console.error('Error in old media cleanup:', error);
        results.old.errors.push(error instanceof Error ? error.message : 'Unknown error');
      }

      try {
        results.temp = await cleanupTempMedia(userId);
      } catch (error) {
        console.error('Error in temp media cleanup:', error);
        results.temp.errors.push(error instanceof Error ? error.message : 'Unknown error');
      }

      const totalCleaned = results.orphaned.cleaned.length + results.old.cleaned.length + results.temp.cleaned.length;
      const totalErrors = results.orphaned.errors.length + results.old.errors.length + results.temp.errors.length;

      console.log(`✅ Comprehensive cleanup completed for user ${userId}: ${totalCleaned} cleaned, ${totalErrors} errors`);
      return results;
    } catch (error) {
      console.error('Error during comprehensive cleanup:', error);
      throw error;
    }
  }

  static async getUnreadMessageCount(currentUserId: string): Promise<number> {
    try {
      // Get all user's chat IDs by querying messages where user is not the sender
      const messagesQuery = query(
        collection(db, 'chats'),
        orderBy('timestamp', 'desc')
      );

      const chatsSnapshot = await getDocs(messagesQuery);
      let totalUnread = 0;

      for (const chatDoc of chatsSnapshot.docs) {
        const chatId = chatDoc.id;

        // Check if current user is part of this chat
        const chatUserIds = chatId.split('_');
        if (!chatUserIds.includes(currentUserId)) continue;

        const otherUserId = chatUserIds.find(id => id !== currentUserId);
        if (!otherUserId) continue;

        const unreadQuery = query(
          collection(db, 'chats', chatId, 'messages'),
          where('senderId', '==', otherUserId),
          where('isRead', '==', false),
          limit(1) // Just need to check if any exist
        );

        const unreadSnapshot = await getDocs(unreadQuery);
        if (!unreadSnapshot.empty) {
          totalUnread++;
        }
      }

      return totalUnread;
    } catch (error) {
      console.error('Error getting unread message count:', error);
      throw error;
    }
  }

  // Payment Services
  static async createPaymentIntent(plan: 'pro' | 'promax'): Promise<{ clientSecret: string, paymentIntentId: string }> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const createPaymentIntentCallable = httpsCallable(functions, 'createPaymentIntent');
      const result = await createPaymentIntentCallable({ plan });

      return result.data as { clientSecret: string, paymentIntentId: string };
    } catch (error) {
      console.error('Error creating payment intent:', error);

      // Handle specific Firebase errors
      if (error instanceof Error) {
        if (error.message.includes('unauthenticated')) {
          throw new Error('Please log in to proceed with payment.');
        } else if (error.message.includes('invalid-argument')) {
          throw new Error('Invalid subscription plan selected.');
        } else if (error.message.includes('internal')) {
          throw new Error('Payment service is temporarily unavailable. Please try again later.');
        }
      }

      throw error;
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