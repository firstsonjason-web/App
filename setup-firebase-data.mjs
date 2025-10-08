// ESM script to set up Firebase test data
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, addDoc, writeBatch, Timestamp, query, where, getDocs } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAkKGuBjbg8vXYg2cLVBq0asaUE7McBG4",
  authDomain: "app1-d31ce.firebaseapp.com",
  projectId: "app1-d31ce",
  storageBucket: "app1-d31ce.firebasestorage.app",
  messagingSenderId: "753144225985",
  appId: "1:753144225985:web:5db7acd7069f76db40f440",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class TestDataGenerator {
  constructor() {
    this.testUsers = [
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
      }
    ];

    this.goalTemplates = [
      { title: 'No social media for 2 hours', points: 50, difficulty: 'medium', category: 'screen_time' },
      { title: 'Read instead of scrolling', points: 30, difficulty: 'easy', category: 'screen_time' },
      { title: '25-minute focused work session', points: 40, difficulty: 'easy', category: 'focus' },
      { title: '10-minute meditation', points: 35, difficulty: 'easy', category: 'mindfulness' },
      { title: '30-minute walk', points: 40, difficulty: 'easy', category: 'activity' }
    ];
  }

  async setupTestData() {
    console.log('🚀 Starting test data setup...');

    try {
      const batch = writeBatch(db);

      // Create test users
      console.log('📝 Creating test users...');
      for (const testUser of this.testUsers) {
        const userProfile = {
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

      // Create test goals
      console.log('🎯 Creating test goals...');
      for (let i = 0; i < 15; i++) {
        const userIndex = Math.floor(Math.random() * this.testUsers.length);
        const goalTemplate = this.goalTemplates[Math.floor(Math.random() * this.goalTemplates.length)];

        const daysAgo = Math.floor(Math.random() * 30);
        const createdAt = Timestamp.fromMillis(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));
        const completed = Math.random() > 0.3;

        const goalData = {
          title: goalTemplate.title,
          points: goalTemplate.points,
          difficulty: goalTemplate.difficulty,
          category: goalTemplate.category,
          userId: this.testUsers[userIndex].id,
          completed,
          createdAt
        };

        if (completed) {
          goalData.completedAt = Timestamp.fromMillis(createdAt.toMillis() + (Math.random() * 7 * 24 * 60 * 60 * 1000));
        }

        const goal = goalData;

        const goalRef = doc(collection(db, 'goals'));
        batch.set(goalRef, goal);
      }

      // Create test activities
      console.log('📊 Creating test activities...');
      for (let i = 0; i < 25; i++) {
        const userIndex = Math.floor(Math.random() * this.testUsers.length);
        const goalTemplate = this.goalTemplates[Math.floor(Math.random() * this.goalTemplates.length)];

        const daysAgo = Math.floor(Math.random() * 30);
        const completedAt = Timestamp.fromMillis(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));

        const activity = {
          userId: this.testUsers[userIndex].id,
          title: goalTemplate.title,
          points: goalTemplate.points,
          completedAt
        };

        const activityRef = doc(collection(db, 'activities'));
        batch.set(activityRef, activity);
      }

      // Create rankings data
      console.log('🏆 Creating rankings data...');
      for (const testUser of this.testUsers) {
        const ranking = {
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

  generateBadges(points) {
    const badges = [];
    if (points >= 3000) badges.push('🏆', '👑', '⭐');
    else if (points >= 2500) badges.push('🥇', '⭐');
    else if (points >= 2000) badges.push('🥈', '🎯');
    else if (points >= 1500) badges.push('🥉', '💪');
    else if (points >= 1000) badges.push('🎯', '🚀');
    else if (points >= 500) badges.push('🌟', '💎');
    else badges.push('🌱', '✨');
    return badges;
  }
}

// Run the setup
const generator = new TestDataGenerator();
generator.setupTestData().catch(console.error);