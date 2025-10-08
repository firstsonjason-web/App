import {
  collection,
  doc,
  setDoc,
  addDoc,
  writeBatch,
  Timestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, Goal, Activity, Community, Post, Comment, Friend, Ranking } from './firebase-services';

interface TestUser {
  id: string;
  email: string;
  displayName: string;
  totalPoints: number;
  level: string;
  country: string;
  avatar: string;
}

interface TestGoal {
  title: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'screen_time' | 'focus' | 'mindfulness' | 'activity' | 'custom';
  userId: string;
  completed: boolean;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

interface TestActivity {
  userId: string;
  title: string;
  points: number;
  completedAt: Timestamp;
}

interface TestCommunity {
  name: string;
  description: string;
  category: 'success' | 'challenge' | 'tip' | 'motivation';
  createdBy: string;
  isPublic: boolean;
}

interface TestPost {
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  category: 'success' | 'challenge' | 'tip' | 'motivation';
  communityId?: string;
  image?: string;
}

interface TestComment {
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
}

interface TestFriend {
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
}

class TestDataGenerator {
  private testUsers: TestUser[] = [
    {
      id: 'user1',
      email: 'alex.chen@example.com',
      displayName: 'Alex Chen',
      totalPoints: 3245,
      level: 'Digital Master',
      country: '🇺🇸',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 'user2',
      email: 'sarah.johnson@example.com',
      displayName: 'Sarah Johnson',
      totalPoints: 2987,
      level: 'Focus Expert',
      country: '🇨🇦',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 'user3',
      email: 'marcus.williams@example.com',
      displayName: 'Marcus Williams',
      totalPoints: 2756,
      level: 'Mindful Warrior',
      country: '🇬🇧',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 'user4',
      email: 'emma.davis@example.com',
      displayName: 'Emma Davis',
      totalPoints: 2156,
      level: 'Digital Warrior',
      country: '🇦🇺',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 'user5',
      email: 'david.kim@example.com',
      displayName: 'David Kim',
      totalPoints: 1987,
      level: 'Focus Seeker',
      country: '🇰🇷',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 'user6',
      email: 'lisa.rodriguez@example.com',
      displayName: 'Lisa Rodriguez',
      totalPoints: 1672,
      level: 'Digital Explorer',
      country: '🇪🇸',
      avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 'user7',
      email: 'james.wilson@example.com',
      displayName: 'James Wilson',
      totalPoints: 1543,
      level: 'Focus Apprentice',
      country: '🇳🇿',
      avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ];

  private goalTemplates = [
    // Screen Time Goals
    { title: 'No social media for 2 hours', points: 50, difficulty: 'medium' as const, category: 'screen_time' as const },
    { title: 'Read instead of scrolling', points: 30, difficulty: 'easy' as const, category: 'screen_time' as const },
    { title: 'Digital detox weekend', points: 200, difficulty: 'hard' as const, category: 'screen_time' as const },

    // Focus Goals
    { title: '25-minute focused work session', points: 40, difficulty: 'easy' as const, category: 'focus' as const },
    { title: 'Complete task without distractions', points: 60, difficulty: 'medium' as const, category: 'focus' as const },
    { title: 'Deep work for 2 hours', points: 150, difficulty: 'hard' as const, category: 'focus' as const },

    // Mindfulness Goals
    { title: '10-minute meditation', points: 35, difficulty: 'easy' as const, category: 'mindfulness' as const },
    { title: 'Mindful breathing exercises', points: 45, difficulty: 'medium' as const, category: 'mindfulness' as const },
    { title: 'Full mindfulness retreat day', points: 300, difficulty: 'hard' as const, category: 'mindfulness' as const },

    // Activity Goals
    { title: '30-minute walk', points: 40, difficulty: 'easy' as const, category: 'activity' as const },
    { title: 'Workout session', points: 70, difficulty: 'medium' as const, category: 'activity' as const },
    { title: 'Run 5 kilometers', points: 120, difficulty: 'hard' as const, category: 'activity' as const },

    // Custom Goals
    { title: 'Learn something new today', points: 55, difficulty: 'medium' as const, category: 'custom' as const },
    { title: 'Help someone in need', points: 80, difficulty: 'medium' as const, category: 'custom' as const },
    { title: 'Creative project completion', points: 100, difficulty: 'hard' as const, category: 'custom' as const }
  ];

  private communityTemplates: TestCommunity[] = [
    {
      name: 'Digital Wellness Champions',
      description: 'A community for those committed to healthy technology habits and digital balance.',
      category: 'success',
      createdBy: 'user1',
      isPublic: true
    },
    {
      name: 'Focus Masters',
      description: 'Share techniques and experiences about maintaining focus in a distracted world.',
      category: 'tip',
      createdBy: 'user2',
      isPublic: true
    },
    {
      name: 'Mindfulness Journey',
      description: 'Support each other on the path to mindfulness and mental clarity.',
      category: 'motivation',
      createdBy: 'user3',
      isPublic: true
    },
    {
      name: '30-Day Challenge',
      description: 'Monthly challenges to build better habits and achieve personal goals.',
      category: 'challenge',
      createdBy: 'user4',
      isPublic: true
    }
  ];

  private postTemplates: TestPost[] = [
    {
      authorId: 'user1',
      authorName: 'Alex Chen',
      authorAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'Just completed my first digital detox weekend! Feeling so much more energized and present. The first day was tough, but by Sunday I was reading books and enjoying nature. Highly recommend this to everyone! 🌿✨',
      category: 'success',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    },
    {
      authorId: 'user2',
      authorName: 'Sarah Johnson',
      authorAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'Pro tip: Use the Pomodoro technique with a twist - work for 25 minutes, then spend 5 minutes doing something mindful like stretching or deep breathing. It\'s been a game-changer for my productivity! 💪',
      category: 'tip'
    },
    {
      authorId: 'user3',
      authorName: 'Marcus Williams',
      authorAvatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'Meditation isn\'t about emptying your mind, it\'s about being present with whatever arises. Started with just 5 minutes a day and now I can\'t imagine my routine without it. Who else is on this mindfulness journey? 🧘‍♂️',
      category: 'motivation'
    },
    {
      authorId: 'user4',
      authorName: 'Emma Davis',
      authorAvatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'Day 15 of my no-phone-after-8pm challenge! It\'s amazing how much more restful my sleep has become. Instead of scrolling, I\'m journaling and reading. The hardest part was breaking the habit, but now it feels natural. 🌙',
      category: 'challenge'
    },
    {
      authorId: 'user5',
      authorName: 'David Kim',
      authorAvatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'Finally hit my 50-day streak! Consistency really is key. Started small with just one focused work session per day, and now it\'s become automatic. Remember: every expert was once a beginner. 🚀',
      category: 'success'
    }
  ];

  private commentTemplates: TestComment[] = [
    { postId: '', authorId: 'user2', authorName: 'Sarah Johnson', content: 'That\'s amazing! I\'ve been trying to do the same thing. Any tips for staying motivated?' },
    { postId: '', authorId: 'user3', authorName: 'Marcus Williams', content: 'Great job! Keep it up! 💪' },
    { postId: '', authorId: 'user4', authorName: 'Emma Davis', content: 'This is so inspiring! I need to try this technique.' },
    { postId: '', authorId: 'user1', authorName: 'Alex Chen', content: 'Love this approach! Mindfulness has been such a game-changer for me too.' },
    { postId: '', authorId: 'user6', authorName: 'Lisa Rodriguez', content: 'Thanks for sharing this! Very helpful advice.' }
  ];

  private friendConnections: TestFriend[] = [
    { userId: 'user1', friendId: 'user2', status: 'accepted' },
    { userId: 'user1', friendId: 'user3', status: 'accepted' },
    { userId: 'user2', friendId: 'user4', status: 'accepted' },
    { userId: 'user3', friendId: 'user5', status: 'accepted' },
    { userId: 'user4', friendId: 'user6', status: 'pending' },
    { userId: 'user5', friendId: 'user7', status: 'accepted' }
  ];

  async setupTestData(): Promise<void> {
    console.log('🚀 Starting test data setup...');

    try {
      const batch = writeBatch(db);

      // 1. Create test users
      console.log('📝 Creating test users...');
      for (const testUser of this.testUsers) {
        const userProfile: UserProfile = {
          id: testUser.id,
          email: testUser.email,
          displayName: testUser.displayName,
          totalPoints: testUser.totalPoints,
          dailyPrize: '',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        const userRef = doc(db, 'users', testUser.id);
        batch.set(userRef, userProfile);
      }

      // 2. Create test goals
      console.log('🎯 Creating test goals...');
      const createdGoals: string[] = [];
      for (let i = 0; i < 25; i++) {
        const userIndex = Math.floor(Math.random() * this.testUsers.length);
        const goalTemplate = this.goalTemplates[Math.floor(Math.random() * this.goalTemplates.length)];

        const daysAgo = Math.floor(Math.random() * 30);
        const createdAt = Timestamp.fromMillis(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));
        const completed = Math.random() > 0.3; // 70% completion rate
        const completedAt = completed
          ? Timestamp.fromMillis(createdAt.toMillis() + (Math.random() * 7 * 24 * 60 * 60 * 1000))
          : undefined;

        const goal: TestGoal = {
          title: goalTemplate.title,
          points: goalTemplate.points,
          difficulty: goalTemplate.difficulty,
          category: goalTemplate.category,
          userId: this.testUsers[userIndex].id,
          completed,
          createdAt,
          completedAt
        };

        const goalRef = doc(collection(db, 'goals'));
        batch.set(goalRef, goal);
        createdGoals.push(goalRef.id);
      }

      // 3. Create test activities
      console.log('📊 Creating test activities...');
      for (let i = 0; i < 50; i++) {
        const userIndex = Math.floor(Math.random() * this.testUsers.length);
        const goalTemplate = this.goalTemplates[Math.floor(Math.random() * this.goalTemplates.length)];

        const daysAgo = Math.floor(Math.random() * 30);
        const completedAt = Timestamp.fromMillis(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));

        const activity: TestActivity = {
          userId: this.testUsers[userIndex].id,
          title: goalTemplate.title,
          points: goalTemplate.points,
          completedAt
        };

        const activityRef = doc(collection(db, 'activities'));
        batch.set(activityRef, activity);
      }

      // 4. Create test communities
      console.log('🏘️ Creating test communities...');
      const createdCommunities: string[] = [];
      for (const communityTemplate of this.communityTemplates) {
        const community: Community = {
          id: '',
          name: communityTemplate.name,
          description: communityTemplate.description,
          category: communityTemplate.category,
          memberCount: Math.floor(Math.random() * 100) + 10,
          createdBy: communityTemplate.createdBy,
          createdAt: Timestamp.now(),
          isPublic: communityTemplate.isPublic
        };

        const communityRef = doc(collection(db, 'communities'));
        batch.set(communityRef, { ...community, id: communityRef.id });
        createdCommunities.push(communityRef.id);
      }

      // 5. Create test posts
      console.log('📝 Creating test posts...');
      for (let i = 0; i < this.postTemplates.length; i++) {
        const postTemplate = this.postTemplates[i];
        const communityId = createdCommunities[Math.floor(Math.random() * createdCommunities.length)];

        const post: Post = {
          id: '',
          authorId: postTemplate.authorId,
          authorName: postTemplate.authorName,
          authorAvatar: postTemplate.authorAvatar,
          content: postTemplate.content,
          category: postTemplate.category,
          image: postTemplate.image,
          likes: Math.floor(Math.random() * 20) + 1,
          comments: Math.floor(Math.random() * 10),
          createdAt: Timestamp.fromMillis(Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000)),
          communityId
        };

        const postRef = doc(collection(db, 'posts'));
        batch.set(postRef, { ...post, id: postRef.id });

        // Add comments to some posts
        if (i < 3) {
          for (let j = 0; j < 3; j++) {
            const commentTemplate = this.commentTemplates[j];
            const comment: Comment = {
              id: '',
              postId: postRef.id,
              authorId: commentTemplate.authorId,
              authorName: commentTemplate.authorName,
              content: commentTemplate.content,
              likes: Math.floor(Math.random() * 5),
              createdAt: Timestamp.fromMillis(post.createdAt.toMillis() + (Math.random() * 24 * 60 * 60 * 1000))
            };

            const commentRef = doc(collection(db, 'comments'));
            batch.set(commentRef, { ...comment, id: commentRef.id });
          }
        }
      }

      // 6. Create friend relationships
      console.log('🤝 Creating friend relationships...');
      for (const friendConnection of this.friendConnections) {
        const friend: Friend = {
          id: '',
          userId: friendConnection.userId,
          friendId: friendConnection.friendId,
          status: friendConnection.status,
          createdAt: Timestamp.fromMillis(Date.now() - (Math.random() * 15 * 24 * 60 * 60 * 1000))
        };

        const friendRef = doc(collection(db, 'friends'));
        batch.set(friendRef, { ...friend, id: friendRef.id });
      }

      // 7. Create rankings data
      console.log('🏆 Creating rankings data...');
      for (const testUser of this.testUsers) {
        const ranking: Ranking = {
          id: '',
          userId: testUser.id,
          userName: testUser.displayName,
          userAvatar: testUser.avatar,
          totalPoints: testUser.totalPoints,
          weeklyPoints: Math.floor(testUser.totalPoints * 0.1),
          monthlyPoints: Math.floor(testUser.totalPoints * 0.3),
          streak: Math.floor(Math.random() * 30) + 1,
          level: testUser.level,
          country: testUser.country,
          badges: this.generateBadges(testUser.totalPoints),
          lastUpdated: Timestamp.now()
        };

        const rankingRef = doc(collection(db, 'rankings'));
        batch.set(rankingRef, { ...ranking, id: rankingRef.id });
      }

      // Commit all changes
      await batch.commit();
      console.log('✅ Test data setup completed successfully!');

    } catch (error) {
      console.error('❌ Error setting up test data:', error);
      throw error;
    }
  }

  private generateBadges(points: number): string[] {
    const badges: string[] = [];

    if (points >= 3000) badges.push('🏆', '👑', '⭐');
    else if (points >= 2500) badges.push('🥇', '⭐');
    else if (points >= 2000) badges.push('🥈', '🎯');
    else if (points >= 1500) badges.push('🥉', '💪');
    else if (points >= 1000) badges.push('🎯', '🚀');
    else if (points >= 500) badges.push('🌟', '💎');
    else badges.push('🌱', '✨');

    return badges;
  }

  async clearAllData(): Promise<void> {
    console.log('🗑️ Clearing all test data...');

    try {
      const collections = ['users', 'goals', 'activities', 'communities', 'posts', 'comments', 'friends', 'rankings'];

      for (const collectionName of collections) {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const batch = writeBatch(db);

        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });

        if (!querySnapshot.empty) {
          await batch.commit();
          console.log(`✅ Cleared ${collectionName} collection`);
        }
      }

      console.log('🗑️ All test data cleared successfully!');
    } catch (error) {
      console.error('❌ Error clearing test data:', error);
      throw error;
    }
  }
}

export const testDataGenerator = new TestDataGenerator();
export { TestDataGenerator };