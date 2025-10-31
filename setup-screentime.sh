#!/bin/bash

echo "🔧 Setting up Screen Time native module..."
echo ""

# Step 1: Clean everything
echo "1️⃣ Cleaning build artifacts..."
rm -rf ios/build
rm -rf ios/Pods
rm -rf ~/Library/Developer/Xcode/DerivedData/boltexponativewind-*

# Step 2: Install pods
echo ""
echo "2️⃣ Installing CocoaPods dependencies..."
cd ios
pod install
cd ..

# Step 3: Rebuild
echo ""
echo "3️⃣ Rebuilding iOS app..."
echo "This will take a few minutes..."
npx expo run:ios --device

echo ""
echo "✅ Done!"
echo ""
echo "📝 What to do next:"
echo "1. Once the app opens, go to Progress tab"
echo "2. You should see 'Enable Device Usage Tracking' button"
echo "3. Tap it to grant permissions"
echo "4. Select 'All Apps & Categories'"
echo "5. Tap 'Refresh' to see your real screen time!"
echo ""
echo "⚠️ Important: If you still don't see the button:"
echo "   The module files may not be in Xcode project."
echo "   Open ios/boltexponativewind.xcworkspace in Xcode"
echo "   and manually add these files to the project:"
echo "   - ScreenTimeUsage.swift"
echo "   - ScreenTimeUsage.m"
echo "   - SharedKeys.swift"
