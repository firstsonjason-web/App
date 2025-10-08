import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
   Search,
   UserPlus,
   MessageCircle,
   Phone,
   Video,
   Users,
   Heart,
   Send,
   X,
   Plus,
   Share,
   Instagram,
   Facebook,
   Twitter,
   Linkedin,
   Mail,
   ExternalLink,
 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardCard } from '@/components/DashboardCard';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import { getColors } from '@/constants/Colors';
import { UserFriend, DatabaseService } from '@/lib/firebase-services';
import { formatTime } from '@/lib/firebase-services';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: string;
  mutualFriends: number;
  streak: number;
  level: string;
  isOnline: boolean;
  lastMessage?: string;
  unreadCount?: number;
  userId: string;
}

interface ChatMessage {
  id: number;
  senderId: number;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const friends: Friend[] = [
  {
    id: '1',
    name: 'Emma Wilson',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
    status: 'online',
    lastSeen: '2 min ago',
    mutualFriends: 5,
    streak: 15,
    level: 'Wellness Expert',
    isOnline: true,
    lastMessage: 'Just finished my morning meditation! 🧘‍♀️',
    unreadCount: 2,
    userId: 'user1',
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    status: 'online',
    lastSeen: '5 min ago',
    mutualFriends: 8,
    streak: 22,
    level: 'Focus Champion',
    isOnline: true,
    lastMessage: 'Great job on your screen time goals yesterday!',
    userId: 'user2',
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=100',
    status: 'away',
    lastSeen: '1 hour ago',
    mutualFriends: 3,
    streak: 8,
    level: 'Digital Beginner',
    isOnline: false,
    lastMessage: 'Thanks for the mindfulness tip!',
    userId: 'user3',
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=100',
    status: 'offline',
    lastSeen: '3 hours ago',
    mutualFriends: 12,
    streak: 45,
    level: 'Mindfulness Master',
    isOnline: false,
    userId: 'user4',
  },
];

const suggestedFriends = [
  {
    id: 5,
    name: '',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
    mutualFriends: 3,
    level: 'Wellness Expert',
    commonInterests: ['Meditation', 'Digital Detox'],
  },
  {
    id: 6,
    name: '',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    mutualFriends: 7,
    level: 'Focus Champion',
    commonInterests: ['Productivity', 'Mindfulness'],
  },
];

const socialPlatforms = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
  { id: 'email', name: 'Email', icon: Mail, color: '#6B7280' },
];

export default function FriendsScreen() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { userProfile, getTotalPoints } = useFirebaseData();
  const colors = getColors(isDarkMode);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [suggestedFriends, setSuggestedFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<UserFriend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'friends' | 'suggestions' | 'requests'>('friends');
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isProcessingRequest, setIsProcessingRequest] = useState(false);
  const [profileShareUrl, setProfileShareUrl] = useState('');

  useEffect(() => {
    if (user) {
      // Generate a shareable profile URL (in a real app, this would be a unique link)
      setProfileShareUrl(`https://myapp.com/profile/${user.uid}`);
    }
  }, [user]);

  // Load friends and suggestions from Firebase
  useEffect(() => {
    if (user) {
      loadFriendsData();
    }
  }, [user]);

  const loadFriendsData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load user's friends
      const userFriends = await DatabaseService.getUserFriends(user.uid);

      // Transform friends data
      const transformedFriends: Friend[] = await Promise.all(
        userFriends.map(async (friend) => {
          const friendProfile = await DatabaseService.getUserProfile(friend.friendId);

          return {
            id: friend.id,
            name: friendProfile?.displayName || friendProfile?.email?.split('@')[0] || 'User',
            avatar: friendProfile?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
            status: 'online', // Would need real-time status tracking
            lastSeen: formatTime(friend.createdAt),
            mutualFriends: 0, // Would need to calculate
            streak: Math.floor((friendProfile?.totalPoints || 0) / 50),
            level: `Level ${Math.floor((friendProfile?.totalPoints || 0) / 100) + 1}`,
            isOnline: true, // Would need real-time status tracking
            lastMessage: 'Connected as friends',
            userId: friend.friendId,
          };
        })
      );

      setFriends(transformedFriends);

      // Load suggested friends
      const suggestions = await DatabaseService.getSuggestedFriends(user.uid, 10);
      setSuggestedFriends(suggestions);

      // Load friend requests
      const requests = await DatabaseService.getFriendRequests(user.uid);
      setFriendRequests(requests);

    } catch (error) {
      console.error('Error loading friends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendFriendRequest = async (friendId: string) => {
    if (!user || isProcessingRequest) return;

    setIsProcessingRequest(true);
    try {
      await DatabaseService.sendFriendRequest(friendId);
      Alert.alert('✅ Friend Request Sent', 'Your friend request has been sent successfully!');
      // Reload data to update suggestions
      loadFriendsData();
    } catch (error: any) {
      console.error('Error sending friend request:', error);

      let errorMessage = 'Failed to send friend request. Please try again.';
      if (error.message === 'Friend request already sent') {
        errorMessage = 'You have already sent a friend request to this user.';
      } else if (error.message === 'Already friends with this user') {
        errorMessage = 'You are already friends with this user.';
      }

      Alert.alert('❌ Error', errorMessage);
    } finally {
      setIsProcessingRequest(false);
    }
  };

  const handleRespondToRequest = async (requestId: string, accept: boolean) => {
    if (isProcessingRequest) return;

    setIsProcessingRequest(true);
    try {
      await DatabaseService.respondToFriendRequest(requestId, accept);
      Alert.alert(
        accept ? '✅ Friend Added!' : '❌ Request Declined',
        accept ? 'Friend request accepted! You can now chat with your new friend.' : 'Friend request declined.'
      );
      // Reload data to update friends list and requests
      loadFriendsData();
    } catch (error: any) {
      console.error('Error responding to friend request:', error);

      let errorMessage = 'Failed to respond to friend request. Please try again.';
      if (error.message === 'Friend request not found') {
        errorMessage = 'Friend request not found. It may have already been processed.';
      }

      Alert.alert('❌ Error', errorMessage);
    } finally {
      setIsProcessingRequest(false);
    }
  };

  const openChat = (friend: Friend) => {
    setSelectedFriend(friend);
    setShowChatModal(true);
  };

  const sendMessage = () => {
    if (chatMessage.trim() && selectedFriend) {
      const newMessage: ChatMessage = {
        id: chatMessages.length + 1,
        senderId: 0, // Current user
        message: chatMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage('');
    }
  };

  const shareProfile = async () => {
    if (!profileShareUrl) {
      Alert.alert('❌ Error', 'Unable to generate profile link. Please try again.');
      return;
    }

    try {
      const shareMessage = `🌟 Check out my profile on this amazing app!\n\n${profileShareUrl}\n\nJoin me in tracking goals and building positive habits! 🎯`;

      // Show the shareable link in an alert for easy copying
      Alert.alert(
        '📋 Share Your Profile',
        `Copy and share this link with your friends:\n\n${profileShareUrl}\n\nMessage suggestion:\n${shareMessage}`,
        [
          {
            text: 'Copy Link',
            onPress: async () => {
              try {
                if (navigator.clipboard) {
                  await navigator.clipboard.writeText(profileShareUrl);
                  Alert.alert('✅ Success!', 'Profile link copied to clipboard!');
                } else {
                  Alert.alert('✅', 'Link is ready to share!');
                }
              } catch (error) {
                Alert.alert('❌ Error', 'Unable to copy to clipboard');
              }
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Error sharing profile:', error);
      Alert.alert('❌ Error', 'Unable to share profile. Please try again.');
    }
  };

  const addFriendViaSocial = async (platform: string) => {
    const platformConfig = {
      instagram: {
        name: 'Instagram',
        appUrl: 'instagram://',
        webUrl: 'https://www.instagram.com',
        message: 'Opening Instagram to find friends...',
        searchQuery: 'goal tracking app friends'
      },
      facebook: {
        name: 'Facebook',
        appUrl: 'fb://',
        webUrl: 'https://www.facebook.com',
        message: 'Opening Facebook to find friends...',
        searchQuery: 'goal tracking motivation'
      },
      twitter: {
        name: 'Twitter',
        appUrl: 'twitter://',
        webUrl: 'https://www.twitter.com',
        message: 'Opening Twitter to find friends...',
        searchQuery: 'productivity app community'
      },
      linkedin: {
        name: 'LinkedIn',
        appUrl: 'linkedin://',
        webUrl: 'https://www.linkedin.com',
        message: 'Opening LinkedIn to find friends...',
        searchQuery: 'productivity tools'
      },
      email: {
        name: 'Email',
        appUrl: 'mailto:',
        webUrl: 'https://www.youtube.com/watch?v=JWWgegLiCGk',
        message: 'Opening tutorial video...',
        searchQuery: ''
      },
    };

    const config = platformConfig[platform as keyof typeof platformConfig];

    if (!config) {
      Alert.alert('❌ Error', 'Unknown platform selected');
      return;
    }

    try {
      // Try to open the app first, but wrap in try-catch since canOpenURL can be misleading
      try {
        await Linking.openURL(config.appUrl);
        Alert.alert('✅ Success', config.message);
      } catch (appError) {
        // App URL failed, try web version for social platforms
        if (platform !== 'email') {
          try {
            const webUrl = config.webUrl;
            await Linking.openURL(webUrl);
            Alert.alert('✅ Browser Opened', `Opening ${config.name} in your browser. Search for "${config.searchQuery}" to find friends using goal tracking apps!`);
          } catch (webError) {
            Alert.alert(
              '❌ Platform Not Available',
              `${config.name} app is not installed or not accessible. Please visit ${config.name}.com and search for "${config.searchQuery}" to find friends.`
            );
          }
        } else {
          // For email, open the tutorial
          try {
            await Linking.openURL(config.webUrl);
            Alert.alert('✅ Tutorial Opened', 'Learn how to share your profile with friends!');
          } catch (emailError) {
            Alert.alert('❌ Error', 'Unable to open tutorial. Please search for "how to share app profile" online.');
          }
        }
      }
    } catch (error) {
      console.error(`Error opening ${platform}:`, error);
      Alert.alert('❌ Error', `Unable to open ${config.name}. Please try again or check if the app is installed.`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10B981';
      case 'away': return '#F59E0B';
      case 'offline': return '#6B7280';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Friends</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Connect and grow together</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Search size={20} color={colors.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search friends..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddFriendModal(true)}
          >
            <UserPlus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'friends' && styles.activeTab]}
            onPress={() => setSelectedTab('friends')}
          >
            <Text style={[styles.tabText, { color: selectedTab === 'friends' ? '#4F46E5' : colors.textSecondary }, selectedTab === 'friends' && styles.activeTabText]}>
              My Friends ({friends.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'requests' && styles.activeTab]}
            onPress={() => setSelectedTab('requests')}
          >
            <Text style={[styles.tabText, { color: selectedTab === 'requests' ? '#4F46E5' : colors.textSecondary }, selectedTab === 'requests' && styles.activeTabText]}>
              Requests ({friendRequests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'suggestions' && styles.activeTab]}
            onPress={() => setSelectedTab('suggestions')}
          >
            <Text style={[styles.tabText, { color: selectedTab === 'suggestions' ? '#4F46E5' : colors.textSecondary }, selectedTab === 'suggestions' && styles.activeTabText]}>
              Suggestions
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {selectedTab === 'friends' && (
            <View style={styles.friendsContainer}>
              {/* Online Friends */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Online ({friends.filter(f => f.isOnline).length})
                </Text>
                {filteredFriends
                  .filter(friend => friend.isOnline)
                  .map((friend) => (
                    <DashboardCard key={friend.id} style={styles.friendCard}>
                      <TouchableOpacity
                        style={styles.friendItem}
                        onPress={() => openChat(friend)}
                      >
                        <View style={styles.friendLeft}>
                          <View style={styles.avatarContainer}>
                            <Image source={{ uri: friend.avatar }} style={styles.avatar} />
                            <View style={[
                              styles.statusDot,
                              { backgroundColor: getStatusColor(friend.status) }
                            ]} />
                          </View>
                          <View style={styles.friendInfo}>
                            <Text style={[styles.friendName, { color: colors.text }]}>{friend.name}</Text>
                            <Text style={styles.friendLevel}>{friend.level}</Text>
                            <Text style={[styles.lastMessage, { color: colors.textSecondary }]}>{friend.lastMessage}</Text>
                          </View>
                        </View>
                        <View style={styles.friendRight}>
                          <Text style={[styles.lastSeen, { color: colors.textTertiary }]}>{friend.lastSeen}</Text>
                          {friend.unreadCount && friend.unreadCount > 0 && (
                            <View style={styles.unreadBadge}>
                              <Text style={styles.unreadText}>{friend.unreadCount}</Text>
                            </View>
                          )}
                          <View style={styles.friendActions}>
                            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.background }]}>
                              <MessageCircle size={18} color="#4F46E5" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.background }]}>
                              <Phone size={18} color="#10B981" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </DashboardCard>
                  ))}
              </View>

              {/* Offline Friends */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Offline ({friends.filter(f => !f.isOnline).length})
                </Text>
                {filteredFriends
                  .filter(friend => !friend.isOnline)
                  .map((friend) => (
                    <DashboardCard key={friend.id} style={styles.friendCard}>
                      <TouchableOpacity
                        style={styles.friendItem}
                        onPress={() => openChat(friend)}
                      >
                        <View style={styles.friendLeft}>
                          <View style={styles.avatarContainer}>
                            <Image source={{ uri: friend.avatar }} style={[styles.avatar, styles.offlineAvatar]} />
                            <View style={[
                              styles.statusDot,
                              { backgroundColor: getStatusColor(friend.status) }
                            ]} />
                          </View>
                          <View style={styles.friendInfo}>
                            <Text style={[styles.friendName, { color: colors.text }]}>{friend.name}</Text>
                            <Text style={styles.friendLevel}>{friend.level}</Text>
                            <Text style={[styles.lastSeen, { color: colors.textSecondary }]}>Last seen {friend.lastSeen}</Text>
                          </View>
                        </View>
                        <View style={styles.friendRight}>
                          <View style={styles.friendActions}>
                            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.background }]}>
                              <MessageCircle size={18} color={colors.textSecondary} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </DashboardCard>
                  ))}
              </View>
            </View>
          )}

          {selectedTab === 'requests' && (
            <View style={styles.requestsContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Friend Requests ({friendRequests.length})
              </Text>
              {friendRequests.map((request) => (
                <DashboardCard key={request.id} style={styles.requestCard}>
                  <View style={styles.requestItem}>
                    <View style={styles.requestInfo}>
                      <Text style={[styles.requestText, { color: colors.text }]}>
                        {request.friendProfile?.name || 'Someone'} wants to be your friend
                      </Text>
                      <Text style={[styles.requestTime, { color: colors.textSecondary }]}>
                        {formatTime(request.createdAt)}
                      </Text>
                    </View>
                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        style={[
                          styles.requestButton,
                          styles.acceptButton,
                          isProcessingRequest && styles.disabledButton
                        ]}
                        onPress={() => handleRespondToRequest(request.id, true)}
                        disabled={isProcessingRequest}
                      >
                        <Text style={styles.requestButtonText}>
                          {isProcessingRequest ? '...' : 'Accept'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.requestButton,
                          styles.declineButton,
                          isProcessingRequest && styles.disabledButton
                        ]}
                        onPress={() => handleRespondToRequest(request.id, false)}
                        disabled={isProcessingRequest}
                      >
                        <Text style={[styles.requestButtonText, styles.declineButtonText]}>
                          {isProcessingRequest ? '...' : 'Decline'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </DashboardCard>
              ))}
            </View>
          )}

          {selectedTab === 'suggestions' && (
            <View style={styles.suggestionsContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>People You May Know</Text>
              {suggestedFriends.map((person) => (
                <DashboardCard key={person.id} style={styles.suggestionCard}>
                  <View style={styles.suggestionItem}>
                    <Image source={{ uri: person.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100' }} style={styles.avatar} />
                    <View style={styles.suggestionInfo}>
                      <Text style={[styles.suggestionName, { color: colors.text }]}>{person.displayName || person.email?.split('@')[0] || 'User'}</Text>
                      <Text style={styles.suggestionLevel}>Level {Math.floor((person.totalPoints || 0) / 100) + 1}</Text>
                      <Text style={[styles.mutualFriends, { color: colors.textSecondary }]}>
                        {Math.floor(Math.random() * 5) + 1} mutual friends
                      </Text>
                      <View style={styles.commonInterests}>
                        <View style={[styles.interestTag, { backgroundColor: isDarkMode ? '#1E293B' : '#EEF2FF' }]}>
                          <Text style={styles.interestText}>Digital Wellness</Text>
                        </View>
                        <View style={[styles.interestTag, { backgroundColor: isDarkMode ? '#1E293B' : '#EEF2FF' }]}>
                          <Text style={styles.interestText}>Mindfulness</Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.addFriendButton, isProcessingRequest && styles.disabledButton]}
                      onPress={() => handleSendFriendRequest(person.id)}
                      disabled={isProcessingRequest}
                    >
                      {isProcessingRequest ? (
                        <Text style={styles.loadingText}>...</Text>
                      ) : (
                        <UserPlus size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                </DashboardCard>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Add Friend Modal */}
        <Modal
          visible={showAddFriendModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddFriendModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Friends</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.modalContent}>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Connect with friends from your social media accounts
              </Text>

              <View style={styles.socialPlatforms}>
                {socialPlatforms.map((platform) => {
                  const IconComponent = platform.icon;
                  return (
                    <TouchableOpacity
                      key={platform.id}
                      style={[
                        styles.platformButton,
                        { borderColor: platform.color, backgroundColor: colors.background },
                        isProcessingRequest && styles.disabledButton
                      ]}
                      onPress={() => addFriendViaSocial(platform.id)}
                      disabled={isProcessingRequest}
                    >
                      <IconComponent size={24} color={platform.color} />
                      <Text style={[styles.platformText, { color: platform.color }]}>
                        {platform.name}
                      </Text>
                      <ExternalLink size={16} color={platform.color} />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.inviteSection}>
                <Text style={[styles.inviteTitle, { color: colors.textSecondary }]}>Or invite by sharing your profile</Text>
                <TouchableOpacity
                  style={[styles.shareButton, isProcessingRequest && styles.disabledButton]}
                  onPress={shareProfile}
                  disabled={isProcessingRequest}
                >
                  <Share size={20} color="#FFFFFF" />
                  <Text style={styles.shareButtonText}>Share Profile Link</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Chat Modal */}
        <Modal
          visible={showChatModal}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <SafeAreaView style={[styles.chatContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.chatHeader}>
              <TouchableOpacity onPress={() => setShowChatModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <View style={styles.chatHeaderInfo}>
                <Image source={{ uri: selectedFriend?.avatar }} style={styles.chatAvatar} />
                <View>
                  <Text style={[styles.chatName, { color: colors.text }]}>{selectedFriend?.name}</Text>
                  <Text style={styles.chatStatus}>
                    {selectedFriend?.isOnline ? 'Active now' : selectedFriend?.lastSeen}
                  </Text>
                </View>
              </View>
              <View style={styles.chatActions}>
                <TouchableOpacity style={[styles.chatActionButton, { backgroundColor: colors.background }]}>
                  <Phone size={20} color="#4F46E5" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.chatActionButton, { backgroundColor: colors.background }]}>
                  <Video size={20} color="#4F46E5" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.messagesContainer}>
              {chatMessages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageItem,
                    message.senderId === 0 ? styles.sentMessage : styles.receivedMessage
                  ]}
                >
                  <Text style={[
                    styles.messageText,
                    message.senderId === 0 ? styles.sentMessageText : [styles.receivedMessageText, { backgroundColor: colors.background, color: colors.text }]
                  ]}>
                    {message.message}
                  </Text>
                  <Text style={[styles.messageTime, { color: colors.textTertiary }]}>{message.timestamp}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.messageInputContainer}>
              <TextInput
                style={[styles.messageInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder="Type a message..."
                value={chatMessage}
                onChangeText={setChatMessage}
                placeholderTextColor={colors.textTertiary}
                multiline
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={sendMessage}
              >
                <Send size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4F46E5',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#4F46E5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  friendsContainer: {
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  friendCard: {
    marginBottom: 12,
    padding: 16,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  offlineAvatar: {
    opacity: 0.7,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  friendLevel: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
  },
  friendRight: {
    alignItems: 'flex-end',
  },
  lastSeen: {
    fontSize: 12,
    marginBottom: 8,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  friendActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    paddingBottom: 24,
  },
  suggestionCard: {
    marginBottom: 12,
    padding: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionLevel: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
    marginBottom: 4,
  },
  mutualFriends: {
    fontSize: 12,
    marginBottom: 8,
  },
  commonInterests: {
    flexDirection: 'row',
    gap: 6,
  },
  interestTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestText: {
    fontSize: 10,
    color: '#4F46E5',
    fontWeight: '500',
  },
  addFriendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  socialPlatforms: {
    gap: 16,
    marginBottom: 32,
  },
  platformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  platformText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  inviteSection: {
    alignItems: 'center',
  },
  inviteTitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 16,
    paddingTop: 24,
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
  },
  chatStatus: {
    fontSize: 12,
    color: '#10B981',
  },
  chatActions: {
    flexDirection: 'row',
    gap: 8,
  },
  chatActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageItem: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  sentMessageText: {
    backgroundColor: '#4F46E5',
    color: '#FFFFFF',
  },
  receivedMessageText: {
  },
  messageTime: {
    fontSize: 12,
    textAlign: 'center',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestsContainer: {
    paddingBottom: 24,
  },
  requestCard: {
    marginBottom: 12,
    padding: 16,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
  },
  requestText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  requestTime: {
    fontSize: 12,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  requestButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  declineButton: {
    backgroundColor: '#EF4444',
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  declineButtonText: {
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
 });