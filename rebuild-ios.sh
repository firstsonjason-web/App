#!/bin/bash

# Screen Time Tracking - Rebuild Script
# This rebuilds the iOS app to load the native ScreenTimeUsage module

echo "🔧 Rebuilding iOS app with native Screen Time module..."
echo ""

# Clean iOS build
echo "1️⃣ Cleaning previous build..."
cd ios
rm -rf build
rm -rf Pods
rm -rf ~/Library/Developer/Xcode/DerivedData/*
cd ..

# Reinstall pods
echo ""
echo "2️⃣ Reinstalling CocoaPods..."
cd ios
pod install
cd ..

# Rebuild app
echo ""
echo "3️⃣ Rebuilding app (this may take a few minutes)..."
npx expo run:ios

echo ""
echo "✅ Done! The app should now have Screen Time tracking enabled."
echo ""
echo "📝 Next steps:"
echo "1. Look for 'Enable Device Usage Tracking' button"
echo "2. Tap it and grant permissions"
echo "3. Select 'All Apps & Categories' when prompted"
echo "4. Tap 'Refresh' to see your screen time data"
