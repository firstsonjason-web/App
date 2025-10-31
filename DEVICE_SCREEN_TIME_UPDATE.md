# Device-Wide Screen Time Tracking - Implementation Summary

## What Changed

### ✅ New Hook: `useRealScreenTimeTracking`
Located: `/hooks/useRealScreenTimeTracking.tsx`

This hook replaces `useEnhancedScreenTimeTracking` and provides **three distinct metrics**:

1. **`todayDeviceScreenTime`** - Total screen time across ALL apps on the device
   - Source: iOS Screen Time API / Android UsageStatsManager
   - Via native modules: `ScreenTimeUsage.swift` / `AndroidUsageStats`
   - Requires user permission

2. **`todayAppScreenTime`** - Time spent in THIS app only
   - Source: AppState monitoring (foreground/background)
   - Automatic tracking, no extra permissions

3. **`todayFocusTime`** - Manual focus sessions
   - User-initiated via Start/Stop buttons
   - For intentional work/study periods

## Updated Files

### 1. `/app/(tabs)/progress.tsx`
**Changes:**
- ✅ Imports `useRealScreenTimeTracking` instead of `useEnhancedScreenTimeTracking`
- ✅ Imports `WeeklyData` type
- ✅ Uses `todayDeviceScreenTime` instead of `todayScreenTime`
- ✅ Displays "Device Screen Time" label (clarifies it's device-wide)
- ✅ Shows both device and app screen time in Device Activity section
- ✅ Weekly chart uses `data.deviceScreenTime` (from all apps)
- ✅ Summary shows "Total Device Screen Time" instead of just "Screen Time"
- ✅ Uses `refreshDeviceUsage()` from the hook

**UI Improvements:**
```
Before: "Screen Time Today: 5.2h"  (ambiguous - device or app?)
After:  "Device Screen Time: 5.2h" (clear - total device usage)
        "Time in App: 0.8h"         (new - this app only)
```

### 2. `/hooks/useRealScreenTimeTracking.tsx`
**New hook that:**
- Leverages existing `useDailyDeviceUsage` hook
- Converts native `onSeconds` to hours: `onSeconds / 3600`
- Tracks app sessions via AppState listener
- Manages focus sessions with start/stop controls
- Returns `moduleAvailable` and `permissionsRequested` status
- Provides `requestPermissions()` to trigger native authorization
- Syncs all data to Firebase Firestore

**Key Methods:**
```typescript
getTodayDeviceScreenTime() // Uses useDailyDeviceUsage().onSeconds
getTodayAppScreenTime()     // Uses AppState tracking
getTodayFocusTime()         // Uses manual session data
getWeeklyData()             // Returns last 7 days with all 3 metrics
```

### 3. `/SCREEN_TIME_TRACKING.md`
**Comprehensive documentation:**
- Explains difference between device vs app vs focus time
- Data source details (iOS FamilyControls, Android UsageStatsManager)
- Permission flow for both platforms
- Firebase structure for persistence
- Troubleshooting guide
- Testing checklist

## How It Works

### iOS Flow
1. User taps "Enable Device Usage Tracking" in Progress tab
2. `requestPermissions()` called
3. Native `ScreenTimeUsage.getTodayActiveSeconds()` invoked
4. iOS shows system authorization dialog
5. User approves → `permissionsRequested = true`
6. Hook starts receiving `onSeconds` from native module
7. Converts to hours: `deviceScreenTime = onSeconds / 3600`
8. Displays in UI as "Device Screen Time"

### Android Flow
1. User taps "Enable Device Usage Tracking"
2. Opens Android Settings → Usage Access
3. User manually enables permission
4. `AndroidUsageStats.getTodayActiveSeconds()` returns data
5. Hook processes and displays

### Weekly Data Structure
```typescript
weeklyData: [
  {
    day: "Mon",
    date: "2024-01-15",
    deviceScreenTime: 5.2,  // Total device (all apps)
    appScreenTime: 0.8,     // This app only
    focusTime: 2.5          // Manual sessions
  },
  // ... 6 more days
]
```

## Native Modules Used

### iOS: `ScreenTimeUsage.swift`
- **Frameworks**: FamilyControls, DeviceActivity, ManagedSettings
- **Method**: `getTodayActiveSeconds()`
- **Storage**: UserDefaults (`deviceUsageSeconds`)
- **Authorization**: `AuthorizationCenter.shared.requestAuthorization()`
- **Location**: `/ios/boltexponativewind/ScreenTimeUsage.swift`

### Android: `AndroidUsageStats`
- **API**: UsageStatsManager
- **Permission**: PACKAGE_USAGE_STATS
- **Method**: `getTodayActiveSeconds()`
- **Location**: (Android native module)

### Bridge: `useDailyDeviceUsage.ts`
- **Queries**: `NativeModules.ScreenTimeUsage` or `NativeModules.AndroidUsageStats`
- **Returns**: `{ onSeconds, offSeconds, refresh, requestPermissions, ... }`
- **Location**: `/hooks/useDailyDeviceUsage.ts`

## Benefits

### For Users
✅ See ACTUAL device usage (not just this app)
✅ Compare total screen time vs productive focus time
✅ Understand app-specific usage patterns
✅ Track progress toward digital wellbeing goals

### For Developers
✅ Leverages existing native modules (no new code needed)
✅ Combines OS data with app tracking seamlessly
✅ Type-safe with TypeScript interfaces
✅ Firebase sync for cross-device consistency
✅ Comprehensive error handling and permissions flow

## Testing Notes

### ⚠️ Requires Development Build
- **Expo Go does NOT support custom native modules**
- `moduleAvailable` will be `false` in Expo Go
- Device screen time will show `0.0h`
- App screen time and focus time still work

### Build Commands
```bash
# iOS development build
eas build --profile development --platform ios

# Android development build
eas build --profile development --platform android
```

### Test Checklist
- [ ] Device screen time updates when using other apps (Safari, Messages, etc.)
- [ ] App screen time only increases when THIS app is in foreground
- [ ] Focus session starts, shows live duration, ends properly
- [ ] Permission request triggers iOS dialog / Android settings
- [ ] Data persists across app restarts
- [ ] Firebase sync works (check Firestore console)
- [ ] Weekly chart shows all 7 days
- [ ] Focus percentage calculates correctly: `(focusTime / deviceScreenTime) * 100`

## Migration Path

### Old Hook (useEnhancedScreenTimeTracking)
```typescript
const { todayScreenTime, todayFocusTime } = useEnhancedScreenTimeTracking();
// Only tracked in-app time, not device-wide
```

### New Hook (useRealScreenTimeTracking)
```typescript
const { 
  todayDeviceScreenTime,  // ← NEW: Total device usage
  todayAppScreenTime,      // ← NEW: This app only
  todayFocusTime           // ← Same as before
} = useRealScreenTimeTracking();
```

## Firebase Data Example

```javascript
// Firestore document: screenTimeData/user123_2024-01-15
{
  date: "2024-01-15",
  deviceScreenTime: 5.2,  // User spent 5.2h on device today (all apps)
  appScreenTime: 0.8,     // User spent 0.8h in THIS app
  focusTime: 2.5,         // User completed 2.5h of focus sessions
  sessions: 12,           // 12 app opens today
  focusSessions: [
    {
      id: "abc123",
      startTime: 1705308000000,
      endTime: 1705311600000,
      duration: 60,  // 60 minutes
      category: "work",
      isActive: false
    }
  ],
  lastUpdated: Timestamp(2024, 0, 15, 18, 30, 0)
}
```

## Next Steps

1. **Test on Physical Device** - Install development build and verify permissions
2. **User Onboarding** - Add tooltip explaining device vs app screen time
3. **Translation Keys** - Add "Device Screen Time" and "Time in App" to translations.ts
4. **Analytics** - Track how many users enable device tracking
5. **Category Breakdown** - Show which apps contribute to device screen time (future)

## Questions?

- **Why two screen time values?** - Device time shows total digital wellbeing, app time shows engagement with THIS app
- **Why request permissions?** - iOS Screen Time is privacy-sensitive and requires explicit user consent
- **Can I track other apps?** - Not directly, but native modules provide aggregate device usage
- **Does it drain battery?** - No, reads pre-calculated data from iOS/Android system services
