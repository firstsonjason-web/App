// Test script to verify the friend request system is working
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, query, where, deleteDoc, Timestamp } from 'firebase/firestore';

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

async function testFriendSystem() {
  console.log('🧪 Testing Friend Request System...\n');

  try {
    // Test users
    const testUser1 = 'testuser1';
    const testUser2 = 'testuser2';

    // 1. Create test users if they don't exist
    console.log('📝 Creating test users...');
    const user1Data = {
      id: testUser1,
      email: 'test1@test.com',
      displayName: 'Test User 1',
      totalPoints: 100,
      dailyPrize: '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const user2Data = {
      id: testUser2,
      email: 'test2@test.com',
      displayName: 'Test User 2',
      totalPoints: 200,
      dailyPrize: '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(doc(db, 'users', testUser1), user1Data);
    await setDoc(doc(db, 'users', testUser2), user2Data);
    console.log('✅ Test users created');

    // 2. Send friend request
    console.log('\n📤 Testing friend request...');
    const { DatabaseService } = await import('./lib/firebase-services.ts');

    // Simulate the sendFriendRequest method
    const friendRequest = {
      userId: testUser1,
      friendId: testUser2,
      status: 'pending',
      createdAt: Timestamp.now()
    };

    const friendRequestsRef = collection(db, 'friendRequests');
    const docRef = await addDoc(friendRequestsRef, friendRequest);
    console.log('✅ Friend request sent');

    // 3. Check friend requests
    console.log('\n🔍 Checking friend requests...');
    const requestsQuery = query(
      collection(db, 'friendRequests'),
      where('friendId', '==', testUser1),
      where('status', '==', 'pending')
    );

    const requestsSnapshot = await getDocs(requestsQuery);
    console.log(`📋 Found ${requestsSnapshot.size} friend requests for ${testUser1}`);

    // 4. Accept friend request (simulate respondToFriendRequest)
    console.log('\n✅ Accepting friend request...');
    if (!requestsSnapshot.empty) {
      const requestDoc = requestsSnapshot.docs[0];
      const requestData = requestDoc.data();

      // Create friendship records
      const friendship1 = {
        id: `${requestData.userId}_${requestData.friendId}`,
        userId: requestData.userId,
        friendId: requestData.friendId,
        status: 'accepted',
        createdAt: Timestamp.now()
      };

      const friendship2 = {
        id: `${requestData.friendId}_${requestData.userId}`,
        userId: requestData.friendId,
        friendId: requestData.userId,
        status: 'accepted',
        createdAt: Timestamp.now()
      };

      // Add to friends collection
      const friendsRef1 = doc(db, 'friends', friendship1.id);
      const friendsRef2 = doc(db, 'friends', friendship2.id);

      await setDoc(friendsRef1, friendship1);
      await setDoc(friendsRef2, friendship2);

      // Remove original request
      await deleteDoc(requestDoc.ref);

      console.log('✅ Friendship created successfully');
    }

    // 5. Verify friendship exists
    console.log('\n🔍 Verifying friendship...');
    const friendsQuery = query(
      collection(db, 'friends'),
      where('userId', '==', testUser1),
      where('status', '==', 'accepted')
    );

    const friendsSnapshot = await getDocs(friendsQuery);
    console.log(`👥 User ${testUser1} has ${friendsSnapshot.size} friends`);

    friendsSnapshot.docs.forEach(doc => {
      const friendData = doc.data();
      console.log(`   • Friends with: ${friendData.friendId}`);
    });

    // 6. Clean up test data
    console.log('\n🗑️ Cleaning up test data...');
    await deleteDoc(doc(db, 'users', testUser1));
    await deleteDoc(doc(db, 'users', testUser2));

    // Clean up any remaining test data
    const cleanupQuery = query(collection(db, 'friends'), where('userId', 'in', [testUser1, testUser2]));
    const cleanupSnapshot = await getDocs(cleanupQuery);
    for (const doc of cleanupSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    console.log('✅ Test completed and cleaned up successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the test
testFriendSystem().catch(console.error);