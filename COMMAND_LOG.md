# Operational Command Log: Build & Submission Workflow

This document records the exact commands used to diagnose, fix, and build the application successfully after resolving environment and native crash issues.

---

## 1. Environment & Dependency Management
Commands used to fix the CocoaPods/Xcode 16 compatibility issues and manage native dependencies.

```bash
# Force update CocoaPods dependencies (after patching project.pbxproj)
cd ios && bundle exec pod install --project-directory=.

# Check Xcode project versioning for compatibility
grep "objectVersion" ios/boltexponativewind.xcodeproj/project.pbxproj

# Clear local watchman and node_modules cache (General Troubleshooting)
watchman watch-del-all && rm -rf node_modules && npm install
```

## 2. EAS Build (Cloud Compilation)
Commands used to trigger and monitor the successful Build 59.

```bash
# Trigger production build for iOS on EAS servers
npx eas-cli build --platform ios --profile production --non-interactive

# List recent builds to verify completion and get Build ID
npx eas-cli build:list --platform ios --limit 1

# Get detailed JSON metadata for the latest build (to extract IPA URL)
npx eas-cli build:list --platform ios --limit 1 --json --non-interactive
```

## 3. Manual Submission & Artifact Handling
Commands used to bypass the EAS queue and handle the signed binary.

```bash
# Download the signed IPA from Expo servers to local machine
curl -L https://expo.dev/artifacts/eas/qMaZAnmdoATZux5aWKfGVp.ipa -o build-59.ipa

# Verify the local IPA exists and check file size
ls -lh build-59.ipa

# Verify version of App Store upload tool
xcrun altool --version

# Manual upload to App Store Connect (Requires App-Specific Password)
xcrun altool --upload-app --type ios --file build-59.ipa --username "YOUR_APPLE_ID" --password "YOUR_APP_SPECIFIC_PASSWORD"
```

## 4. Diagnostics & Cleanup
Commands used to verify file states and configurations.

```bash
# Check current JS Engine configuration
grep "jsEngine" app.json

# Check for existing App Store Connect credentials
npx eas-cli credentials
```
