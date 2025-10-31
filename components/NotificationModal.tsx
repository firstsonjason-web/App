import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { X, Bell, MessageCircle, Target, Users, Trophy, AlertCircle, BarChart3, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardCard } from './DashboardCard';
import { NotificationService, AppNotification } from '@/lib/notification-service';
import { formatTime } from '@/lib/firebase-services';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { useDarkMode } from '@/hooks/useDarkMode';
import { getColors } from '@/constants/Colors';
import { useLanguage } from '@/hooks/LanguageContext';
import { router } from 'expo-router';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationModal({ visible, onClose }: NotificationModalProps) {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && user) {
      loadNotifications();
      
      // Set up real-time listener
      const unsubscribe = NotificationService.setupNotificationListener(
        user.uid,
        (updatedNotifications) => {
          setNotifications(updatedNotifications);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }
  }, [visible, user]);

  const loadNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userNotifications = await NotificationService.getUserNotifications(user.uid);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = async (notification: AppNotification) => {
    // Mark as read
    await NotificationService.markAsRead(notification.id);

    // Navigate if there's an action URL
    if (notification.actionUrl) {
      onClose();
      // Parse the action URL and navigate
      if (notification.actionUrl.startsWith('/')) {
        const path = notification.actionUrl.substring(1);
        router.push(path as any);
      }
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;

    try {
      await NotificationService.markAllAsRead(user.uid);
      Alert.alert('✅', 'All notifications marked as read');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await NotificationService.deleteNotification(notificationId);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    const iconProps = { size: 20, color: '#4F46E5' };
    
    switch (type) {
      case 'message':
        return <MessageCircle {...iconProps} />;
      case 'task_completed':
        return <Target {...iconProps} color="#10B981" />;
      case 'friend_request':
        return <Users {...iconProps} color="#F59E0B" />;
      case 'achievement':
        return <Trophy {...iconProps} color="#EF4444" />;
      case 'screen_time_warning':
        return <AlertCircle {...iconProps} color="#EF4444" />;
      case 'daily_summary':
        return <BarChart3 {...iconProps} color="#8B5CF6" />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <Bell size={24} color={colors.text} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Notifications
            </Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={handleMarkAllRead}
                style={styles.markAllButton}
              >
                <Text style={styles.markAllText}>Mark all read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications List */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Loading notifications...
              </Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Bell size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No notifications yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                We'll notify you about messages, completed tasks, and more
              </Text>
            </View>
          ) : (
            <View style={styles.notificationsList}>
              {notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  onPress={() => handleNotificationPress(notification)}
                  activeOpacity={0.7}
                >
                  <DashboardCard style={styles.notificationCard}>
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationIcon}>
                        {getNotificationIcon(notification.type)}
                      </View>
                      <View style={styles.notificationText}>
                        <Text style={[
                          styles.notificationTitle,
                          { color: colors.text },
                          !notification.read && styles.unreadTitle
                        ]}>
                          {notification.title}
                        </Text>
                        <Text style={[
                          styles.notificationBody,
                          { color: colors.textSecondary }
                        ]}>
                          {notification.body}
                        </Text>
                        <Text style={[styles.notificationTime, { color: colors.textTertiary }]}>
                          {formatTime(notification.createdAt)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteNotification(notification.id)}
                        style={styles.deleteButton}
                      >
                        <Trash2 size={16} color={colors.textTertiary} />
                      </TouchableOpacity>
                    </View>
                    {!notification.read && <View style={styles.unreadDot} />}
                  </DashboardCard>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
  },
  markAllText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  notificationsList: {
    padding: 16,
    gap: 12,
  },
  notificationCard: {
    padding: 16,
    position: 'relative',
  },
  notificationContent: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  notificationBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
  unreadDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4F46E5',
  },
});
