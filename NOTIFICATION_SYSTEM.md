# Notification System Implementation

## Overview
A comprehensive notification system has been implemented for your Expo Go app that handles:
- Message notifications
- Task/goal completion notifications
- Friend request notifications
- Achievement notifications
- Screen time warnings
- Daily summaries

## Key Features

### 1. Notification Service (`lib/notification-service.ts`)
- **Local Notifications**: Uses `expo-notifications` for local push notifications
- **Firebase Integration**: Stores notifications in Firestore for persistence
- **Real-time Updates**: Listens to notification changes in real-time
- **Multiple Notification Types**:
  - Messages from friends
  - Task completions with points earned
  - Friend requests
  - Achievements unlocked
  - Screen time warnings
  - Daily summaries

### 2. Notification Modal (`components/NotificationModal.tsx`)
- Beautiful UI to display all notifications
- Mark as read/unread functionality
- Delete individual notifications
- Mark all as read feature
- Navigate to relevant screens when tapping notifications
- Real-time updates

### 3. Integration Points

#### Home Screen (`app/(tabs)/index.tsx`)
- Notification bell icon in header with badge showing unread count
- Real-time unread count updates
- Automatically sends notification when a goal is completed
- Opens NotificationModal when bell is tapped

#### Friends Screen (`app/(tabs)/friends.tsx`)
- Sends notification when friend request is sent
- Sends notification when chat message is sent
- Recipients receive both local notification AND Firebase notification

#### Profile Screen (`app/(tabs)/profile.tsx`)
- Notification permission toggle
- Daily summary notification scheduling
- Requests permissions when enabling notifications

## How It Works

### 1. Notification Permissions
When users enable notifications in the profile screen:
1. App requests notification permissions
2. If granted, schedules daily summary at 8 PM
3. Enables all notification types

### 2. Goal Completion Notifications
When a user completes a goal:
```typescript
await NotificationService.notifyTaskCompleted(
  userId,
  goalTitle,
  pointsEarned
);
```
- Creates local notification immediately
- Saves to Firestore for persistence
- Shows in notification modal

### 3. Message Notifications
When a user sends a message:
```typescript
await NotificationService.notifyNewMessage(
  recipientUserId,
  senderName,
  messageText,
  chatId
);
```
- Recipient gets local notification
- Notification saved to Firestore
- Can tap to navigate to chat

### 4. Friend Request Notifications
When sending a friend request:
```typescript
await NotificationService.notifyFriendRequest(
  recipientUserId,
  senderName,
  senderId
);
```
- Recipient gets notified
- Can tap to view friend requests

## Usage

### For Users:
1. Enable notifications in Profile > Settings
2. Allow notification permissions when prompted
3. Tap the bell icon in home screen to view all notifications
4. Tap notifications to navigate to relevant screen
5. Swipe/tap to delete notifications
6. Use "Mark all read" to clear unread status

### For Developers:

#### Send a custom notification:
```typescript
import { NotificationService } from '@/lib/notification-service';

// Send notification
await NotificationService.sendLocalNotification(
  'Notification Title',
  'Notification body text',
  { customData: 'value' },
  0 // delay in seconds, 0 = immediate
);

// Save to Firestore
await NotificationService.saveNotification(
  userId,
  'custom_type',
  'Title',
  'Body',
  { customData: 'value' },
  '/route/to/navigate'
);
```

#### Listen to notifications in real-time:
```typescript
const unsubscribe = NotificationService.setupNotificationListener(
  userId,
  (notifications) => {
    // Handle updated notifications
    console.log('New notifications:', notifications);
  }
);

// Clean up when component unmounts
return () => unsubscribe();
```

## Firestore Structure

Notifications are stored in Firestore under the `notifications` collection:

```typescript
{
  userId: string;           // User who receives the notification
  type: 'message' | 'task_completed' | 'friend_request' | ...;
  title: string;            // Notification title
  body: string;             // Notification body text
  data: any;                // Additional data (optional)
  read: boolean;            // Read status
  createdAt: Timestamp;     // Creation time
  actionUrl?: string;       // Route to navigate when tapped
}
```

## Scheduled Notifications

### Daily Summary (8 PM)
Automatically scheduled when notifications are enabled:
- Shows daily stats
- Screen time summary
- Goals completed
- Points earned

Can be customized in `NotificationService.scheduleDailySummary()`

## Expo Go Compatibility

This implementation is fully compatible with Expo Go:
- ✅ Uses `expo-notifications` (built into Expo Go)
- ✅ Local notifications work perfectly
- ✅ No native code required
- ✅ Works on iOS and Android
- ✅ Firebase Firestore for persistence

## Future Enhancements

Potential additions:
1. Push notifications via Expo Push Notification service
2. Notification sounds customization
3. Notification channels/categories
4. Rich notifications with images
5. Action buttons in notifications
6. Notification history with date grouping
7. Notification preferences per type

## Testing

To test notifications:
1. Complete a goal → Should get notification
2. Send a friend request → Recipient should get notification
3. Send a message → Recipient should get notification
4. Check notification bell icon → Should show unread count
5. Tap bell → Should open notification modal
6. Tap notification → Should navigate to relevant screen

## Notes

- Notifications require permission from the user
- Daily summary scheduled at 8 PM daily
- Unread count updates in real-time
- Notifications persist in Firebase even if app is closed
- Local notifications work even without internet (after permission granted)
