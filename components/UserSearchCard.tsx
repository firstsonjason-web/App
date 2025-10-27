import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { UserPlus, Check, Clock, UserCheck } from 'lucide-react-native';
import { useDarkMode } from '@/hooks/useDarkMode';
import { getColors } from '@/constants/Colors';
import { DashboardCard } from '@/components/DashboardCard';

interface UserSearchCardProps {
  user: {
    id: string;
    displayName: string;
    avatar: string;
    level: string;
    streak: number;
    email: string;
  };
  onSendRequest: (userId: string) => void;
  isLoading: boolean;
  currentUserId: string;
}

type FriendRequestStatus = string;

export const UserSearchCard: React.FC<UserSearchCardProps> = ({
  user,
  onSendRequest,
  isLoading,
  currentUserId,
}) => {
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);

  // TODO: Implement proper friend request status checking
  // This should check Firebase for existing friend requests, friendships, etc.
  const requestStatus: FriendRequestStatus = 'none';

  const getButtonConfig = () => {
    switch (requestStatus) {
      case 'sent':
        return {
          icon: Clock,
          text: 'Request Sent',
          backgroundColor: '#F59E0B',
          disabled: true,
        };
      case 'friends':
        return {
          icon: UserCheck,
          text: 'Friends',
          backgroundColor: '#10B981',
          disabled: true,
        };
      case 'loading':
        return {
          icon: null,
          text: '...',
          backgroundColor: '#6B7280',
          disabled: true,
        };
      default:
        return {
          icon: UserPlus,
          text: 'Add Friend',
          backgroundColor: '#4F46E5',
          disabled: false,
        };
    }
  };

  const buttonConfig = getButtonConfig();
  const IconComponent = buttonConfig.icon;

  return (
    <DashboardCard style={styles.card}>
      <View style={styles.userItem}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user.displayName}
          </Text>
          <Text style={[styles.userLevel, { color: colors.textSecondary }]}>
            {user.level} • 🔥 {user.streak}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textTertiary }]}>
            {user.email}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: buttonConfig.backgroundColor,
              opacity: buttonConfig.disabled || isLoading ? 0.6 : 1,
            },
          ]}
          onPress={() => !buttonConfig.disabled && !isLoading && onSendRequest(user.id)}
          disabled={buttonConfig.disabled || isLoading}
        >
          {IconComponent && <IconComponent size={20} color="#FFFFFF" />}
          {!IconComponent && (
            <Text style={styles.buttonText}>{buttonConfig.text}</Text>
          )}
        </TouchableOpacity>
      </View>
    </DashboardCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60, // Ensure minimum touch target
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
    marginRight: 8, // Ensure proper spacing with action button
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    flexShrink: 1, // Allow text to wrap if needed
  },
  userLevel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.8,
  },
  actionButton: {
    width: 44, // Slightly larger for better touch target
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0, // Prevent button from shrinking
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});