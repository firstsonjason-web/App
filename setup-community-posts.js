// Script to set up test community posts for the new communities feature
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp, doc, setDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
require('dotenv').config();

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const testUsers = [
  { id: 'user1', name: 'Alex Chen', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150' },
  { id: 'user2', name: 'Sarah Johnson', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150' },
  { id: 'user3', name: 'Marcus Williams', avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150' },
  { id: 'user4', name: 'Emma Davis', avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150' },
  { id: 'user5', name: 'David Kim', avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150' }
];

const communityPosts = [
  {
    userId: 'user1',
    content: 'Just completed my first digital detox weekend! Feeling so much more energized and present. The first day was tough, but by Sunday I was reading books and enjoying nature. Highly recommend this to everyone! 🌿✨',
    timestamp: Timestamp.fromMillis(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likes: ['user2', 'user3', 'user4'],
    replies: [
      {
        id: 'reply1',
        userId: 'user2',
        content: 'That\'s amazing! I\'ve been trying to do the same thing. Any tips for staying motivated?',
        timestamp: Timestamp.fromMillis(Date.now() - 1.5 * 60 * 60 * 1000)
      },
      {
        id: 'reply2',
        userId: 'user1',
        content: 'Start small! I began with just 1 hour of no phone time before bed. The key is consistency, not perfection.',
        timestamp: Timestamp.fromMillis(Date.now() - 1 * 60 * 60 * 1000)
      }
    ]
  },
  {
    userId: 'user2',
    content: 'Pro tip: Use the Pomodoro technique with a twist - work for 25 minutes, then spend 5 minutes doing something mindful like stretching or deep breathing. It\'s been a game-changer for my productivity! 💪',
    timestamp: Timestamp.fromMillis(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    likes: ['user1', 'user3', 'user5'],
    replies: [
      {
        id: 'reply3',
        userId: 'user3',
        content: 'This is so inspiring! I need to try this technique.',
        timestamp: Timestamp.fromMillis(Date.now() - 3.5 * 60 * 60 * 1000)
      }
    ]
  },
  {
    userId: 'user3',
    content: 'Meditation isn\'t about emptying your mind, it\'s about being present with whatever arises. Started with just 5 minutes a day and now I can\'t imagine my routine without it. Who else is on this mindfulness journey? 🧘‍♂️',
    timestamp: Timestamp.fromMillis(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    likes: ['user1', 'user2', 'user4', 'user5'],
    replies: [
      {
        id: 'reply4',
        userId: 'user4',
        content: 'Love this approach! Mindfulness has been such a game-changer for me too.',
        timestamp: Timestamp.fromMillis(Date.now() - 5.5 * 60 * 60 * 1000)
      },
      {
        id: 'reply5',
        userId: 'user5',
        content: 'Just started my journey! Any apps you recommend?',
        timestamp: Timestamp.fromMillis(Date.now() - 5 * 60 * 60 * 1000)
      },
      {
        id: 'reply6',
        userId: 'user3',
        content: 'I love the Insight Timer app - it has tons of free guided meditations!',
        timestamp: Timestamp.fromMillis(Date.now() - 4.5 * 60 * 60 * 1000)
      }
    ]
  },
  {
    userId: 'user4',
    content: 'Day 15 of my no-phone-after-8pm challenge! It\'s amazing how much more restful my sleep has become. Instead of scrolling, I\'m journaling and reading. The hardest part was breaking the habit, but now it feels natural. 🌙',
    timestamp: Timestamp.fromMillis(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    likes: ['user1', 'user2', 'user3'],
    replies: [
      {
        id: 'reply7',
        userId: 'user1',
        content: 'This is incredible! Keep up the amazing work! 💪',
        timestamp: Timestamp.fromMillis(Date.now() - 7.5 * 60 * 60 * 1000)
      }
    ]
  },
  {
    userId: 'user5',
    content: 'Finally hit my 50-day streak! Consistency really is key. Started small with just one focused work session per day, and now it\'s become automatic. Remember: every expert was once a beginner. 🚀',
    timestamp: Timestamp.fromMillis(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
    likes: ['user1', 'user2', 'user3', 'user4'],
    replies: [
      {
        id: 'reply8',
        userId: 'user2',
        content: 'Congratulations! That\'s such an achievement! 🎉',
        timestamp: Timestamp.fromMillis(Date.now() - 9.5 * 60 * 60 * 1000)
      },
      {
        id: 'reply9',
        userId: 'user4',
        content: 'So proud of you! What\'s your secret to staying consistent?',
        timestamp: Timestamp.fromMillis(Date.now() - 9 * 60 * 60 * 1000)
      },
      {
        id: 'reply10',
        userId: 'user5',
        content: 'Tracking my progress visually and having accountability partners!',
        timestamp: Timestamp.fromMillis(Date.now() - 8.5 * 60 * 60 * 1000)
      }
    ]
  },
  {
    userId: 'user1',
    content: 'Quick productivity hack: When you feel overwhelmed, write down everything you need to do, then pick just ONE thing to focus on. The rest can wait. Your brain will thank you! 📝',
    timestamp: Timestamp.fromMillis(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    likes: ['user2', 'user3', 'user5'],
    replies: []
  },
  {
    userId: 'user3',
    content: 'Remember: Progress over perfection. Every small step counts. Don\'t let the pursuit of being perfect prevent you from getting started. 🌱',
    timestamp: Timestamp.fromMillis(Date.now() - 14 * 60 * 60 * 1000), // 14 hours ago
    likes: ['user1', 'user2', 'user4', 'user5'],
    replies: [
      {
        id: 'reply11',
        userId: 'user4',
        content: 'This is exactly what I needed to hear today. Thank you! 🙏',
        timestamp: Timestamp.fromMillis(Date.now() - 13.5 * 60 * 60 * 1000)
      }
    ]
  },
  {
    userId: 'user2',
    content: 'Digital minimalism tip: Delete apps you don\'t use regularly. If you haven\'t opened it in 30 days, it\'s probably not essential. Your phone will feel lighter and your attention more focused. 📱',
    timestamp: Timestamp.fromMillis(Date.now() - 16 * 60 * 60 * 1000), // 16 hours ago
    likes: ['user1', 'user3', 'user4'],
    replies: [
      {
        id: 'reply12',
        userId: 'user1',
        content: 'Just did this! Deleted 12 unused apps. My phone feels so much cleaner!',
        timestamp: Timestamp.fromMillis(Date.now() - 15.5 * 60 * 60 * 1000)
      }
    ]
  }
];

async function setupCommunityPosts() {
  try {
    console.log('🚀 Setting up community posts...');

    // First, create test users if they don't exist
    console.log('📝 Creating test users...');
    for (const user of testUsers) {
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, {
        id: user.id,
        email: `${user.id}@example.com`,
        displayName: user.name,
        avatar: user.avatar,
        totalPoints: Math.floor(Math.random() * 1000) + 500,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('✅ Created user:', user.name);
    }

    // Then add posts
    console.log('📝 Adding community posts...');
    for (const post of communityPosts) {
      await addDoc(collection(db, 'posts'), post);
      console.log('✅ Added post by user:', post.userId);
    }

    console.log('🎉 All community posts added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up community posts:', error);
    process.exit(1);
  }
}

setupCommunityPosts();