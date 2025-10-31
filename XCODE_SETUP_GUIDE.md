# 🔧 Fix Screen Time Tracking - Manual Xcode Setup

## Problem
The native ScreenTimeUsage module isn't loading because the Swift files aren't properly added to the Xcode project.

## Solution: Add Files to Xcode Project

### Step 1: Open Project in Xcode
```bash
cd ios
open boltexponativewind.xcworkspace
```
**Important**: Open the `.xcworkspace` file, NOT `.xcodeproj`

### Step 2: Add Files to Project

1. In Xcode's left sidebar (Project Navigator), right-click on the `boltexponativewind` folder (blue icon)

2. Select **"Add Files to boltexponativewind..."**

3. Navigate to: `ios/boltexponativewind/`

4. Select these 3 files:
   - ✅ `ScreenTimeUsage.swift`
   - ✅ `ScreenTimeUsage.m`
   - ✅ `SharedKeys.swift`

5. Make sure these options are checked:
   - ✅ **"Copy items if needed"** - UNCHECKED (files already there)
   - ✅ **"Create groups"** - SELECTED
   - ✅ **"Add to targets"** - Check **boltexponativewind**

6. Click **"Add"**

### Step 3: Verify Files Are Added

In Project Navigator, you should see:
```
boltexponativewind/
  ├── AppDelegate.swift
  ├── ScreenTimeUsage.swift      ← Should be here
  ├── ScreenTimeUsage.m           ← Should be here  
  ├── SharedKeys.swift            ← Should be here
  └── ... other files
```

### Step 4: Clean Build Folder

1. In Xcode menu: **Product** → **Clean Build Folder** (⇧⌘K)

2. Wait for cleaning to complete

### Step 5: Build & Run

**Option A: From Xcode**
- Click the Play button (▶️) in top left
- Select your device/simulator
- Wait for build to complete

**Option B: From Terminal**
```bash
cd /Users/user/Desktop/App
npx expo run:ios
```

### Step 6: Test It!

1. App should launch
2. Go to **Progress** tab
3. You should now see **"Enable Device Usage Tracking"** button
4. Tap it → Grant permissions
5. Select **"All Apps & Categories"**
6. Tap **"Refresh"** → See your real screen time! 🎉

---

## Troubleshooting

### Still showing "module not available"?

**Check 1: Files in Project**
- Files must be in Project Navigator
- Must have target membership checked

**Check 2: Bridging Header**
- File: `boltexponativewind-Bridging-Header.h`
- Should contain React imports (already updated)

**Check 3: Entitlements**
- File: `boltexponativewind.entitlements`
- Should have `com.apple.developer.family-controls` = true
- Should have app group `group.com.owenisas.app.deviceusage`

**Check 4: Info.plist**
- File: `Info.plist`
- Should have usage descriptions (if needed)

### Build Errors?

**Error: "Module 'ScreenTimeUsage' not found"**
- Files not added to target
- Solution: Repeat Step 2, ensure target is checked

**Error: "Use of undeclared type 'Shared'"**
- SharedKeys.swift not added
- Solution: Add SharedKeys.swift to project

**Error: "No such module 'FamilyControls'"**
- iOS version too old (need iOS 15+)
- Solution: Update deployment target to iOS 15.0

---

## Quick Verification Script

Run this to check if files are in the right place:

```bash
cd /Users/user/Desktop/App/ios/boltexponativewind

echo "Checking required files..."
ls -la | grep -E "(ScreenTimeUsage|SharedKeys)"

echo ""
echo "Expected output:"
echo "  ScreenTimeUsage.swift"
echo "  ScreenTimeUsage.m" 
echo "  SharedKeys.swift"
```

All 3 files should be listed. If not, they weren't created properly.

---

## Alternative: Completely Remove Native Tracking

If you prefer to just use manual input:

1. Remove the native module code
2. Keep only manual input UI
3. Users enter screen time from iPhone Settings

Would you like me to do this instead?
