# Firebase Security Rules Configuration Guide

This document provides a comprehensive guide to configuring Firebase Security Rules for your Firestore database and Storage bucket based on the current project setup. Firebase Security Rules are essential for securing your data and ensuring that only authorized users can access or modify resources.

## Overview

Firebase Security Rules control access to your Firebase services (Firestore and Storage). They are written in a declarative language that allows you to define permissions based on user authentication, data structure, and custom conditions.

In your project, you have:
- **Firestore Rules**: Defined in `firestore.rules` for collections like users, goals, activities, communities, posts, etc.
- **Storage Rules**: Not currently defined (no `storage.rules` file), but Storage is used for profile images and post media.

## Prerequisites

- Firebase project set up
- Firebase CLI installed (`npm install -g firebase-tools`)
- Project initialized with `firebase init`
- Basic understanding of your app's data structure

## 1. Firestore Security Rules

Your current `firestore.rules` file defines access controls for various collections. Here's a breakdown and explanation:

### Current Rules Structure

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isValidUserData() {
      return request.auth != null &&
             request.auth.uid == resource.data.userId;
    }

    // Users collection - users can read/write their own profile
    match /users/{userId} {
      allow read, write: if isOwner(userId);
      allow read: if isAuthenticated() && resource.data.isPublic == true;
    }

    // Goals collection - users can manage their own goals
    match /goals/{goalId} {
      allow read, write: if isAuthenticated() && isValidUserData();
      allow create: if isAuthenticated() &&
        request.auth.uid == request.resource.data.userId &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid));
    }

    // Activities collection - users can read/write their own activities
    match /activities/{activityId} {
      allow read, write: if isAuthenticated() && isValidUserData();
      allow create: if isAuthenticated() &&
        request.auth.uid == request.resource.data.userId;
    }

    // Communities collection - public read for all authenticated users
    match /communities/{communityId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() &&
        request.auth.uid == request.resource.data.createdBy;
      allow update, delete: if isAuthenticated() &&
        request.auth.uid == resource.data.createdBy;
    }

    // Posts collection - community posts with proper access control
    match /posts/{postId} {
       allow read: if isAuthenticated();
       allow create: if isAuthenticated() &&
         request.auth.uid == request.resource.data.userId;
       allow update: if isAuthenticated() &&
         request.auth.uid == resource.data.userId;
       // Allow updating likes and replies arrays
       allow update: if isAuthenticated() &&
         (request.resource.data.diff(resource.data).affectedKeys().hasAny(['likes', 'replies']));
     }

    // Comments collection - users can manage their own comments
    match /comments/{commentId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() &&
        request.auth.uid == request.resource.data.authorId;
      allow update, delete: if isAuthenticated() &&
        request.auth.uid == resource.data.authorId;
    }

    // Friends collection - users can manage their own friend relationships
    match /friends/{friendId} {
      allow read: if isAuthenticated() &&
        (request.auth.uid == resource.data.userId ||
         request.auth.uid == resource.data.friendId);
      allow create: if isAuthenticated() &&
        request.auth.uid == request.resource.data.userId;
      allow update, delete: if isAuthenticated() &&
        request.auth.uid == resource.data.userId;
    }

    // FriendRequests collection - users can manage their own friend requests
    match /friendRequests/{requestId} {
      allow read: if isAuthenticated() &&
        (request.auth.uid == resource.data.userId ||
         request.auth.uid == resource.data.friendId);
      allow create: if isAuthenticated() &&
        request.auth.uid == request.resource.data.userId;
      allow update, delete: if isAuthenticated() &&
        (request.auth.uid == resource.data.userId ||
         request.auth.uid == resource.data.friendId);
    }

    // Chats collection - users can access their own chats
    match /chats/{chatId} {
      allow read: if isAuthenticated() &&
        chatId.matches(request.auth.uid + '_.*|.*_' + request.auth.uid);
      allow write: if false; // Chats are managed via messages subcollection
    }

    // Chat messages subcollection - users can send/receive messages in their chats
    match /chats/{chatId}/messages/{messageId} {
      allow read: if isAuthenticated() &&
        chatId.matches(request.auth.uid + '_.*|.*_' + request.auth.uid);
      allow create: if isAuthenticated() &&
        request.auth.uid == request.resource.data.senderId &&
        chatId.matches(request.auth.uid + '_.*|.*_' + request.auth.uid);
      allow update: if isAuthenticated() &&
        request.auth.uid == resource.data.senderId;
      allow delete: if false; // Prevent deletion of messages
    }

    // Rankings collection - public read for authenticated users
    match /rankings/{rankingId} {
      allow read: if isAuthenticated();
      allow write: if false; // Rankings are calculated server-side
    }

    // User rankings subcollection - users can read rankings data
    match /users/{userId}/rankings/{rankingId} {
      allow read: if isAuthenticated();
      allow write: if false; // Rankings are calculated server-side
    }

    // Global rankings for different time periods
    match /global_rankings/{period} {
      allow read: if isAuthenticated();
      allow write: if false; // Rankings are calculated server-side
    }

    // Admin functions - only allow from authenticated admin users
    match /admin/{document=**} {
      allow read, write: if false; // Disable admin access for now
    }

    // Public data that anyone can read (if needed)
    match /public/{document=**} {
      allow read: if true;
      allow write: if false;
    }

    // Note: Payment-related data is handled via Cloud Functions and does not require direct Firestore rules.
    // All payment operations are secured through Firebase Functions authentication and authorization.
  }
}
```

### Key Concepts in Your Rules

1. **Helper Functions**: `isAuthenticated()`, `isOwner()`, `isValidUserData()` make rules reusable and easier to maintain.

2. **Authentication Checks**: Most rules require `isAuthenticated()`, ensuring only logged-in users can access data.

3. **Ownership Validation**: Users can only modify their own data (e.g., profiles, goals, activities).

4. **Public Access**: Some data like communities and posts are readable by authenticated users, with creation/update restricted to owners.

5. **Server-Side Only**: Rankings are read-only for clients, as they are calculated server-side.

### Best Practices for Firestore Rules

- **Principle of Least Privilege**: Grant only the minimum access necessary.
- **Use Helper Functions**: Keep rules DRY (Don't Repeat Yourself).
- **Validate Data**: Ensure data integrity by checking required fields.
- **Test Rules**: Use Firebase Emulator or unit tests to verify behavior.
- **Monitor**: Use Firebase Console to monitor rule evaluations.

### Updating Firestore Rules

1. Edit `firestore.rules` in your project.
2. Deploy using Firebase CLI:
   ```
   firebase deploy --only firestore:rules
   ```
3. Test in Firebase Emulator:
   ```
   firebase emulators:start --only firestore
   ```

## 2. Firebase Storage Security Rules

Your project uses Firebase Storage for profile images (`profile-images/{userId}/...`) and post media (`post-media/{userId}/...`), but there's no `storage.rules` file. You need to create one to secure uploads and downloads.

### Creating Storage Rules

Create a new file `storage.rules` in your project root:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isValidImageType() {
      return request.resource.contentType.matches('image/.*');
    }

    function isValidVideoType() {
      return request.resource.contentType.matches('video/.*');
    }

    function isValidFileSize() {
      return request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }

    // Profile images - users can upload/delete their own profile images
    match /profile-images/{userId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) &&
        isValidImageType() &&
        isValidFileSize();
    }

    // Post media - users can upload/delete their own post media
    match /post-media/{userId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) &&
        (isValidImageType() || isValidVideoType()) &&
        isValidFileSize();
    }

    // Default deny for all other paths
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### Key Concepts in Storage Rules

1. **Path-Based Matching**: Rules match specific paths like `/profile-images/{userId}/...`.

2. **Content Type Validation**: Ensures only allowed file types (images/videos) are uploaded.

3. **Size Limits**: Prevents large file uploads that could incur costs.

4. **Ownership Checks**: Users can only upload/delete their own files.

5. **Read Access**: Authenticated users can read profile images and post media.

### Best Practices for Storage Rules

- **Validate File Types and Sizes**: Prevent malicious uploads.
- **Use Authentication**: Require login for uploads.
- **Secure Downloads**: Control who can access files.
- **Monitor Usage**: Track storage costs and access patterns.
- **Backup Important Data**: Storage rules don't protect against accidental deletions.

### Updating Storage Rules

1. Create `storage.rules` file as shown above.
2. Update `firebase.json` to include storage rules:
   ```json
   {
     "storage": {
       "rules": "storage.rules"
     }
   }
   ```
3. Deploy:
   ```
   firebase deploy --only storage
   ```
4. Test with Firebase Emulator:
   ```
   firebase emulators:start --only storage
   ```

## 3. Deployment and Testing

### Deploying Rules

1. Ensure you're logged in: `firebase login`
2. Set the project: `firebase use your-project-id`
3. Deploy both:
   ```
   firebase deploy --only firestore:rules,storage
   ```

### Testing Rules

1. **Firebase Emulator**:
   ```
   firebase emulators:start
   ```
   Test your app against local emulators.

2. **Firebase Console**: Use the Rules Playground to simulate requests.

3. **Unit Tests**: Write tests for your security rules using the Firebase Rules Unit Testing library.

### Monitoring

- Check Firebase Console > Firestore/Storage > Rules for evaluation logs.
- Monitor for security events in Firebase Console > Security.

## 4. Common Issues and Troubleshooting

- **Permission Denied**: Ensure rules match your app's access patterns.
- **Rule Evaluation Errors**: Check Firebase Console logs for details.
- **Emulator Issues**: Ensure emulators are running and your app points to them.
- **Production Deployment**: Always test rules in staging before production.

## 5. Advanced Topics

- **Custom Claims**: Use Firebase Auth custom claims for role-based access.
- **Cloud Functions**: Trigger functions on data changes for complex logic.
- **Rate Limiting**: Implement rate limits using Cloud Functions if needed.
- **Data Validation**: Add more validation in rules for data integrity.

This configuration secures your app's data while allowing necessary functionality. Adjust rules based on your specific requirements and always test thoroughly.