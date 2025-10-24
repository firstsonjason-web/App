// Test script for deeplink functionality
// Tests profile sharing deeplinks and route configuration
// Run with: node test-deeplinks.mjs

import fs from 'fs';
import path from 'path';

console.log('🔗 DEEPLINK FUNCTIONALITY TEST SUITE');
console.log('=====================================\n');

// Test 1: Verify app.json has correct deeplink scheme configuration
function testDeeplinkScheme() {
  console.log('1️⃣ Testing deeplink scheme configuration...');

  try {
    const appJsonPath = './app.json';
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

    const scheme = appJson.expo?.scheme;

    if (scheme === 'myapp') {
      console.log('✅ Deeplink scheme is correctly configured:', scheme);
      return true;
    } else {
      console.log('❌ Deeplink scheme not found or incorrect. Expected: "myapp", Got:', scheme);
      return false;
    }
  } catch (error) {
    console.log('❌ Error reading app.json:', error.message);
    return false;
  }
}

// Test 2: Verify profile sharing URL generation logic
function testProfileSharingUrlGeneration() {
  console.log('\n2️⃣ Testing profile sharing URL generation...');

  try {
    const profilePath = './app/(tabs)/profile.tsx';
    const profileContent = fs.readFileSync(profilePath, 'utf8');

    // Check if handleShareProfile function exists
    const hasShareFunction = profileContent.includes('handleShareProfile');
    const hasDeeplinkGeneration = profileContent.includes('myapp://profile/');

    if (hasShareFunction && hasDeeplinkGeneration) {
      console.log('✅ Profile sharing function found');
      console.log('✅ Deeplink URL generation logic present');

      // Extract the URL pattern
      const urlPatternMatch = profileContent.match(/const shareUrl = `([^`]+)`/);
      if (urlPatternMatch) {
        const urlPattern = urlPatternMatch[1];
        console.log('✅ Deeplink URL pattern:', urlPattern);

        // Verify URL pattern format
        if (urlPattern.includes('myapp://') && urlPattern.includes('profile/') && urlPattern.includes('${user.uid}')) {
          console.log('✅ URL pattern format is correct');
          return true;
        } else {
          console.log('❌ URL pattern format is incorrect');
          return false;
        }
      } else {
        console.log('❌ Could not extract URL pattern');
        return false;
      }
    } else {
      console.log('❌ Profile sharing function or deeplink generation not found');
      return false;
    }
  } catch (error) {
    console.log('❌ Error reading profile.tsx:', error.message);
    return false;
  }
}

// Test 3: Verify deeplink route configuration
function testDeeplinkRouteConfiguration() {
  console.log('\n3️⃣ Testing deeplink route configuration...');

  try {
    const profileRoutePath = './app/profile/[userId].tsx';
    const routeContent = fs.readFileSync(profileRoutePath, 'utf8');

    // Check if dynamic route file exists
    if (fs.existsSync(profileRoutePath)) {
      console.log('✅ Dynamic profile route file exists');

      // Check if it uses useLocalSearchParams to get userId
      const hasUseLocalSearchParams = routeContent.includes('useLocalSearchParams');
      const hasUserIdParam = routeContent.includes('userId');
      const hasLoadUserProfile = routeContent.includes('loadUserProfile');

      if (hasUseLocalSearchParams && hasUserIdParam) {
        console.log('✅ Route properly configured to receive userId parameter');
      } else {
        console.log('❌ Route not properly configured for userId parameter');
        return false;
      }

      if (hasLoadUserProfile) {
        console.log('✅ Route has user profile loading functionality');
      } else {
        console.log('❌ Route missing user profile loading functionality');
        return false;
      }

      return true;
    } else {
      console.log('❌ Dynamic profile route file not found');
      return false;
    }
  } catch (error) {
    console.log('❌ Error reading profile route file:', error.message);
    return false;
  }
}

// Test 4: Verify Firebase service integration for profile loading
function testFirebaseIntegration() {
  console.log('\n4️⃣ Testing Firebase service integration...');

  try {
    const routePath = './app/profile/[userId].tsx';
    const routeContent = fs.readFileSync(routePath, 'utf8');

    const hasDatabaseService = routeContent.includes('DatabaseService');
    const hasGetUserProfile = routeContent.includes('getUserProfile');

    if (hasDatabaseService && hasGetUserProfile) {
      console.log('✅ Firebase DatabaseService integration found');
      console.log('✅ getUserProfile method usage detected');
      return true;
    } else {
      console.log('❌ Firebase integration incomplete');
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking Firebase integration:', error.message);
    return false;
  }
}

// Test 5: Generate test deeplink URLs
function generateTestDeeplinkUrls() {
  console.log('\n5️⃣ Generating test deeplink URLs...');

  const testUserIds = [
    'test-user-123',
    'user-456',
    'abc-def-ghi',
    '123456789'
  ];

  console.log('📱 Test Deeplink URLs:');
  testUserIds.forEach(userId => {
    const deeplinkUrl = `myapp://profile/${userId}`;
    console.log(`   ${deeplinkUrl}`);
  });

  console.log('\n✅ Test URLs generated successfully');
  return true;
}

// Test 6: Verify error handling in deeplink route
function testErrorHandling() {
  console.log('\n6️⃣ Testing error handling in deeplink route...');

  try {
    const routePath = './app/profile/[userId].tsx';
    const routeContent = fs.readFileSync(routePath, 'utf8');

    const hasErrorHandling = routeContent.includes('Alert.alert') &&
                            routeContent.includes('router.back') &&
                            routeContent.includes('Profile not found');

    if (hasErrorHandling) {
      console.log('✅ Error handling implemented for invalid profiles');
      return true;
    } else {
      console.log('❌ Error handling may be incomplete');
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking error handling:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const results = [
    testDeeplinkScheme(),
    testProfileSharingUrlGeneration(),
    testDeeplinkRouteConfiguration(),
    testFirebaseIntegration(),
    generateTestDeeplinkUrls(),
    testErrorHandling()
  ];

  const passedTests = results.filter(Boolean).length;
  const totalTests = results.length;

  console.log('\n🎯 TEST RESULTS SUMMARY');
  console.log('======================');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Deeplink functionality is properly configured.');
    return true;
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
    return false;
  }
}

// Manual Testing Instructions
function printManualTestingInstructions() {
  console.log('\n📋 MANUAL TESTING INSTRUCTIONS');
  console.log('==============================');
  console.log('\nTo test deeplinks manually on device/emulator:');
  console.log('\n1. 📱 DEVICE/EMULATOR SETUP:');
  console.log('   • Ensure the app is installed on your device/emulator');
  console.log('   • Make sure you\'re logged in to the app');
  console.log('   • Enable deeplinks in your device settings if needed');

  console.log('\n2. 🔗 PROFILE SHARING TEST:');
  console.log('   • Navigate to Profile tab');
  console.log('   • Tap on "Profile Details" (or long press profile card)');
  console.log('   • Tap "Share Profile" button');
  console.log('   • Verify that a share sheet appears with the deeplink URL');
  console.log('   • Expected URL format: myapp://profile/YOUR_USER_ID');

  console.log('\n3. 🔗 DEEPLINK NAVIGATION TEST:');
  console.log('   • Copy a deeplink URL (e.g., myapp://profile/test-user-123)');
  console.log('   • Paste it into Notes app or any text app');
  console.log('   • Long press the URL and select "Open in [Your App Name]"');
  console.log('   • Verify that the app opens and navigates to the profile screen');

  console.log('\n4. 🧪 EDGE CASE TESTING:');
  console.log('   • Test with valid user IDs');
  console.log('   • Test with invalid/non-existent user IDs');
  console.log('   • Test with malformed URLs');
  console.log('   • Test deeplink from external apps');

  console.log('\n5. 🔄 BACK NAVIGATION TEST:');
  console.log('   • After opening a profile via deeplink');
  console.log('   • Use back button or gesture to return');
  console.log('   • Verify proper navigation back to previous screen');

  console.log('\n6. 📊 PRODUCTION TESTING:');
  console.log('   • Test on physical devices (iOS/Android)');
  console.log('   • Test with different user accounts');
  console.log('   • Test with various network conditions');
  console.log('   • Test after app updates');

  console.log('\n🛠️  DEBUGGING TIPS:');
  console.log('   • Check device logs for deeplink-related errors');
  console.log('   • Use Android Studio/iOS Console for debugging');
  console.log('   • Verify app scheme registration in device settings');
  console.log('   • Test with Expo Go and production builds');

  console.log('\n📝 EXPECTED BEHAVIOR:');
  console.log('   • Deeplink should open the app if closed');
  console.log('   • Should navigate directly to the specified profile');
  console.log('   • Should show error message for invalid user IDs');
  console.log('   • Should maintain proper navigation stack');
}

// Main execution
runAllTests().then((success) => {
  printManualTestingInstructions();
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('\n💥 Test suite crashed:', error);
  process.exit(1);
});