// Test Firebase connection and verify data
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function testFirebaseConnection() {
  console.log('🔍 Testing Firebase connection...');

  try {
    // Test connection by listing collections
    const collections = ['users', 'goals', 'activities', 'rankings'];

    for (const collectionName of collections) {
      const querySnapshot = await getDocs(collection(db, collectionName));
      console.log(`✅ ${collectionName}: ${querySnapshot.size} documents`);

      // Show first few documents as examples
      if (querySnapshot.size > 0) {
        querySnapshot.forEach((doc, index) => {
          if (index < 2) { // Show first 2 documents
            console.log(`  📄 ${doc.id}:`, doc.data());
          }
        });
      }
    }

    console.log('✅ Firebase connection test completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
}

testFirebaseConnection().catch(console.error);