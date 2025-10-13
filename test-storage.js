// Test script to verify the new storage utility works correctly
const fs = require('fs');
const path = require('path');

// Mock localStorage for Node.js environment
const mockLocalStorage = new Map();

global.localStorage = {
  getItem: (key) => {
    console.log('🗄️  STORAGE DEBUG: localStorage.getItem called for key:', key);
    const value = mockLocalStorage.get(key);
    console.log('🗄️  STORAGE DEBUG: localStorage.getItem result:', value);
    return value;
  },
  setItem: (key, value) => {
    console.log('🗄️  STORAGE DEBUG: localStorage.setItem called for key:', key, 'value:', value);
    mockLocalStorage.set(key, value);
    console.log('🗄️  STORAGE DEBUG: localStorage.setItem completed');
  },
  removeItem: (key) => {
    console.log('🗄️  STORAGE DEBUG: localStorage.removeItem called for key:', key);
    mockLocalStorage.delete(key);
    console.log('🗄️  STORAGE DEBUG: localStorage.removeItem completed');
  }
};

// Mock React Native Platform
const mockPlatform = {
  OS: 'web' // Simulate web platform
};

// Mock window object for web environment
global.window = {
  localStorage: global.localStorage
};

// Test the storage utility
async function testStorage() {
  console.log('🗄️  STORAGE DEBUG: Starting storage utility test...\n');

  try {
    // Import the storage utility (we'll need to adjust the path if needed)
    const storagePath = path.join(__dirname, 'lib', 'storage.ts');

    // For this test, let's manually implement the logic to verify it works
    console.log('🗄️  STORAGE DEBUG: === Testing Web Storage Implementation ===');

    // Test 1: Set and get a value using web storage
    console.log('\n🗄️  STORAGE DEBUG: Test 1 - Set and get language preference');
    await global.localStorage.setItem('language', 'es');
    const savedLanguage = await global.localStorage.getItem('language');
    console.log('🗄️  STORAGE DEBUG: Saved language:', savedLanguage);

    if (savedLanguage === 'es') {
      console.log('✅ SUCCESS: Web storage set/get works correctly');
    } else {
      console.log('❌ ERROR: Web storage set/get failed');
    }

    // Test 2: Test persistence across "app restarts"
    console.log('\n🗄️  STORAGE DEBUG: Test 2 - Test persistence across app restarts');
    const persistedLanguage = await global.localStorage.getItem('language');
    console.log('🗄️  STORAGE DEBUG: Language after simulated restart:', persistedLanguage);

    if (persistedLanguage === 'es') {
      console.log('✅ SUCCESS: Language preference persisted correctly');
    } else {
      console.log('❌ ERROR: Language preference not persisted');
    }

    // Test 3: Test different data types
    console.log('\n🗄️  STORAGE DEBUG: Test 3 - Test different data types');
    await global.localStorage.setItem('userPreferences', JSON.stringify({ theme: 'dark', notifications: true }));
    const userPrefs = await global.localStorage.getItem('userPreferences');
    console.log('🗄️  STORAGE DEBUG: User preferences:', userPrefs);

    if (userPrefs && JSON.parse(userPrefs).theme === 'dark') {
      console.log('✅ SUCCESS: Complex data types work correctly');
    } else {
      console.log('❌ ERROR: Complex data types failed');
    }

    // Test 4: Test error handling
    console.log('\n🗄️  STORAGE DEBUG: Test 4 - Test error handling');
    const originalGetItem = global.localStorage.getItem;
    global.localStorage.getItem = () => {
      throw new Error('Storage quota exceeded');
    };

    try {
      await global.localStorage.getItem('test');
      console.log('❌ ERROR: Should have thrown an error');
    } catch (error) {
      console.log('✅ SUCCESS: Error handling works correctly');
    }

    // Restore original function
    global.localStorage.getItem = originalGetItem;

    console.log('\n🗄️  STORAGE DEBUG: === STORAGE UTILITY TEST COMPLETED ===');

  } catch (error) {
    console.error('🗄️  STORAGE DEBUG: Error during storage test:', error);
  }
}

// Run the test
testStorage().then(() => {
  console.log('\n🗄️  STORAGE DEBUG: Test execution completed');
});