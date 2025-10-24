# Deeplink Functionality Test Suite

This document describes the deeplink functionality testing for the Expo React Native app.

## Overview

The app supports deeplinks for profile sharing with the following features:
- **Scheme**: `myapp`
- **Profile Deeplink Format**: `myapp://profile/{userId}`
- **Profile Sharing**: Users can share their profile via the "Share Profile" button
- **Dynamic Routing**: The app handles deeplinks using Expo Router's dynamic routes

## Test Script

### Running the Test Suite

```bash
node test-deeplinks.mjs
```

### What the Test Script Validates

1. **Deeplink Scheme Configuration** - Verifies `app.json` has the correct scheme
2. **Profile Sharing URL Generation** - Tests the `handleShareProfile` function logic
3. **Deeplink Route Configuration** - Validates the dynamic route `[userId].tsx` exists and is properly configured
4. **Firebase Integration** - Ensures Firebase services are integrated for profile loading
5. **Error Handling** - Verifies proper error handling for invalid profiles
6. **Test URL Generation** - Generates sample deeplink URLs for testing

## Manual Testing Instructions

### Device/Emulator Setup
1. Ensure the app is installed on your device/emulator
2. Make sure you're logged in to the app
3. Enable deeplinks in your device settings if needed

### Profile Sharing Test
1. Navigate to Profile tab
2. Tap on "Profile Details" (or long press profile card)
3. Tap "Share Profile" button
4. Verify that a share sheet appears with the deeplink URL
5. Expected URL format: `myapp://profile/YOUR_USER_ID`

### Deeplink Navigation Test
1. Copy a deeplink URL (e.g., `myapp://profile/test-user-123`)
2. Paste it into Notes app or any text app
3. Long press the URL and select "Open in [Your App Name]"
4. Verify that the app opens and navigates to the profile screen

### Edge Case Testing
- Test with valid user IDs
- Test with invalid/non-existent user IDs
- Test with malformed URLs
- Test deeplink from external apps

### Back Navigation Test
1. After opening a profile via deeplink
2. Use back button or gesture to return
3. Verify proper navigation back to previous screen

## Implementation Details

### Files Involved

- **`app.json`** - Contains the deeplink scheme configuration
- **`app/(tabs)/profile.tsx`** - Contains the `handleShareProfile` function
- **`app/profile/[userId].tsx`** - Dynamic route that handles deeplink navigation
- **`lib/firebase-services.ts`** - Firebase service for loading user profiles

### Deeplink Flow

1. **URL Generation**: `handleShareProfile` creates `myapp://profile/${user.uid}`
2. **URL Sharing**: Uses `expo-sharing` to share the URL
3. **App Launch/Activation**: iOS/Android launches app with the URL
4. **Route Matching**: Expo Router matches `myapp://profile/123` to `[userId].tsx`
5. **Parameter Extraction**: `useLocalSearchParams` extracts `userId` from URL
6. **Profile Loading**: `DatabaseService.getUserProfile(userId)` loads user data
7. **Error Handling**: Shows error for invalid user IDs

## Debugging Tips

- Check device logs for deeplink-related errors
- Use Android Studio/iOS Console for debugging
- Verify app scheme registration in device settings
- Test with Expo Go and production builds

## Expected Behavior

- ✅ Deeplink should open the app if closed
- ✅ Should navigate directly to the specified profile
- ✅ Should show error message for invalid user IDs
- ✅ Should maintain proper navigation stack
- ✅ Profile sharing should generate correct URLs

## Test Results

When you run the test script, you should see output similar to:

```
🔗 DEEPLINK FUNCTIONALITY TEST SUITE
=====================================

1️⃣ Testing deeplink scheme configuration...
✅ Deeplink scheme is correctly configured: myapp

2️⃣ Testing profile sharing URL generation...
✅ Profile sharing function found
✅ Deeplink URL generation logic present
✅ Deeplink URL pattern: myapp://profile/${user.uid}
✅ URL pattern format is correct

[... more tests ...]

🎯 TEST RESULTS SUMMARY
======================
✅ Passed: 6/6
❌ Failed: 0/6

🎉 All tests passed! Deeplink functionality is properly configured.
```

## Troubleshooting

### Common Issues

1. **Deeplinks not opening app**
   - Check if scheme is registered in device settings
   - Verify app is installed and not in background

2. **Profile not loading**
   - Check Firebase connection
   - Verify user ID exists in database
   - Check network connectivity

3. **Navigation issues**
   - Verify Expo Router configuration
   - Check for conflicting route patterns

### Development Testing

For development testing, you can also test deeplinks using:
- Expo Go app with development build
- iOS Simulator with Safari
- Android Emulator with browser

## Production Considerations

- Test on physical devices (iOS/Android)
- Test with different user accounts
- Test with various network conditions
- Test after app updates
- Consider adding analytics for deeplink usage