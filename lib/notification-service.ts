import * as Notifications from 'expo-notifications';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase-config';

export interface AppNotification {
  id: string;
  userId: string;
  type: 'message' | 'task_completed' | 'friend_request' | 'achievement' | 'daily_summary' | 'screen_time_warning' | 'goal_reminder';
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: Timestamp;
  actionUrl?: string;
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  // Request notification permissions
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Get Expo push token for remote notifications (not needed for local, but useful for future)
  static async getExpoPushToken(): Promise<string | null> {
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      return token;
    } catch (error) {
      console.error('Error getting Expo push token:', error);
      return null;
    }
  }

  // Save notification to Firestore
  static async saveNotification(
    userId: string,
    type: AppNotification['type'],
    title: string,
    body: string,
    data?: any,
    actionUrl?: string
  ): Promise<string | null> {
    try {
      const notificationData = {
        userId,
        type,
        title,
        body,
        data: data || {},
        read: false,
        createdAt: Timestamp.now(),
        actionUrl: actionUrl || '',
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving notification:', error);
      return null;
    }
  }

  // Send local notification
  static async sendLocalNotification(
    title: string,
    body: string,
    data?: any,
    delaySeconds: number = 0
  ): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger: delaySeconds > 0 
          ? { 
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: delaySeconds 
            }
          : null, // null means show immediately
      });
      
      return notificationId;
    } catch (error) {
      console.error('Error sending local notification:', error);
      return null;
    }
  }

  // Send notification for new message
  static async notifyNewMessage(
    userId: string,
    senderName: string,
    message: string,
    chatId: string
  ): Promise<void> {
    const title = `💬 New message from ${senderName}`;
    const body = message.length > 100 ? message.substring(0, 100) + '...' : message;
    
    // Save to Firestore
    await this.saveNotification(
      userId,
      'message',
      title,
      body,
      { chatId, senderName },
      `/chat/${chatId}`
    );

    // Send local notification
    await this.sendLocalNotification(title, body, { chatId });
  }

  // Send notification for task/goal completed
  static async notifyTaskCompleted(
    userId: string,
    taskTitle: string,
    pointsEarned: number
  ): Promise<void> {
    const title = '🎯 Goal Completed!';
    const body = `You completed "${taskTitle}" and earned ${pointsEarned} points!`;
    
    // Save to Firestore
    await this.saveNotification(
      userId,
      'task_completed',
      title,
      body,
      { taskTitle, pointsEarned },
      '/progress'
    );

    // Send local notification
    await this.sendLocalNotification(title, body, { taskTitle, pointsEarned });
  }

  // Send notification for friend request
  static async notifyFriendRequest(
    userId: string,
    requesterName: string,
    requesterId: string
  ): Promise<void> {
    const title = '👥 New Friend Request';
    const body = `${requesterName} wants to be your friend!`;
    
    // Save to Firestore
    await this.saveNotification(
      userId,
      'friend_request',
      title,
      body,
      { requesterName, requesterId },
      '/friends?tab=requests'
    );

    // Send local notification
    await this.sendLocalNotification(title, body, { requesterId });
  }

  // Send notification for achievement unlocked
  static async notifyAchievement(
    userId: string,
    achievementTitle: string,
    achievementDescription: string
  ): Promise<void> {
    const title = '🏆 Achievement Unlocked!';
    const body = `${achievementTitle}: ${achievementDescription}`;
    
    // Save to Firestore
    await this.saveNotification(
      userId,
      'achievement',
      title,
      body,
      { achievementTitle, achievementDescription },
      '/profile'
    );

    // Send local notification
    await this.sendLocalNotification(title, body, { achievementTitle });
  }

  // Send screen time warning
  static async notifyScreenTimeWarning(
    userId: string,
    screenTimeHours: number
  ): Promise<void> {
    const title = '⚠️ Screen Time Alert';
    const body = `You've been using your device for ${screenTimeHours.toFixed(1)} hours today. Consider taking a break!`;
    
    // Save to Firestore
    await this.saveNotification(
      userId,
      'screen_time_warning',
      title,
      body,
      { screenTimeHours },
      '/progress'
    );

    // Send local notification
    await this.sendLocalNotification(title, body, { screenTimeHours });
  }

  // Send daily summary
  static async notifyDailySummary(
    userId: string,
    goalsCompleted: number,
    totalPoints: number,
    screenTimeHours: number
  ): Promise<void> {
    const title = '📊 Your Daily Summary';
    const body = `Today: ${goalsCompleted} goals completed, ${totalPoints} points earned, ${screenTimeHours.toFixed(1)}h screen time`;
    
    // Save to Firestore
    await this.saveNotification(
      userId,
      'daily_summary',
      title,
      body,
      { goalsCompleted, totalPoints, screenTimeHours },
      '/progress'
    );

    // Send local notification
    await this.sendLocalNotification(title, body, { goalsCompleted, totalPoints });
  }

  // Schedule daily summary notification
  static async scheduleDailySummary(): Promise<void> {
    try {
      // Cancel existing daily summaries
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.type === 'daily_summary') {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }

      // Schedule new daily summary at 8 PM
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 Daily Digital Wellness Summary',
          body: 'Check your screen time and focus progress from today!',
          sound: 'default',
          data: { type: 'daily_summary' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: 20,
          minute: 0,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Error scheduling daily summary:', error);
    }
  }

  // Get user notifications
  static async getUserNotifications(
    userId: string,
    limitCount: number = 50
  ): Promise<AppNotification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as AppNotification[];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  // Get unread notification count
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const updatePromises = snapshot.docs.map(doc =>
        updateDoc(doc.ref, { read: true })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  // Listen to notifications in real-time
  static setupNotificationListener(
    userId: string,
    callback: (notifications: AppNotification[]) => void
  ): () => void {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as AppNotification[];
      
      callback(notifications);
    });

    return unsubscribe;
  }

  // Cancel all scheduled notifications
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }
}
