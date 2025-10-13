import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Alert,
  Linking,
  ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, MessageCircle, Heart, Share, Plus, Send, Trophy, Target, Clock, ThumbsUp, MessageSquare, X, Filter, Search, Camera, Image as ImageIcon, Video, Upload } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardCard } from '@/components/DashboardCard';
import * as Sharing from 'expo-sharing';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import { useLanguage } from '@/hooks/LanguageContext';
import { getColors } from '@/constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import { CommunityPost, CommunityComment, DatabaseService , formatTime, Reply } from '@/lib/firebase-services';
import { Timestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'expo-router';
// import NetInfo from '@react-native-community/netinfo'; // Uncomment when package is installed

interface Post extends Omit<CommunityPost, 'timestamp'> {
  isLiked: boolean;
  timestamp: string;
  author: {
    name: string;
    avatar: string;
    streak: number;
    level: string;
  };
  likesCount: number;
  repliesCount: number;
}

interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  isLiked: boolean;
  author: {
    name: string;
    avatar: string;
  };
}

const initialPosts: Post[] = [
];

const getCategories = (t: any) => [
  { id: 'all', name: t('allPosts'), color: '#6B7280' },
  { id: 'success', name: t('successStories'), color: '#10B981' },
  { id: 'challenge', name: t('challenges'), color: '#F59E0B' },
  { id: 'tip', name: t('tipsAndTricks'), color: '#4F46E5' },
  { id: 'motivation', name: t('motivation'), color: '#EF4444' },
];

// Debounce hook for search input
const useDebounce = function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Memoized Post Item Component
const PostItem = memo(function PostItem({ post, colors, t, handleLikePost, toggleReplies, handleSharePost, startReply, cancelReply, submitReply, replyingTo, replyContent, setReplyContent, expandedReplies }: {
  post: Post;
  colors: any;
  t: any;
  handleLikePost: (postId: string) => void;
  toggleReplies: (postId: string) => void;
  handleSharePost: (post: Post) => void;
  startReply: (postId: string) => void;
  cancelReply: () => void;
  submitReply: (postId: string) => void;
  replyingTo: string | null;
  replyContent: string;
  setReplyContent: (content: string) => void;
  expandedReplies: Set<string>;
}) {
  // State to store reply authors
  const [replyAuthors, setReplyAuthors] = useState<{ [replyId: string]: { name: string; avatar: string } }>({});

  // Fetch reply authors when replies are expanded
  useEffect(() => {
    const fetchReplyAuthors = async () => {
      if (expandedReplies.has(post.id) && post.replies && post.replies.length > 0) {
        const authors: { [replyId: string]: { name: string; avatar: string } } = {};

        // Fetch user profiles for all replies
        await Promise.all(
          post.replies.map(async (reply) => {
            try {
              const authorProfile = await DatabaseService.getUserProfile(reply.userId);
              authors[reply.id] = {
                name: authorProfile?.displayName || authorProfile?.email?.split('@')[0] || t('user'),
                avatar: authorProfile?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
              };
            } catch (error) {
              console.error('Error fetching reply author:', error);
              authors[reply.id] = {
                name: t('user'),
                avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
              };
            }
          })
        );

        setReplyAuthors(authors);
      }
    };

    fetchReplyAuthors();
  }, [expandedReplies.has(post.id), post.replies, post.id, t]);
  const handleLike = useCallback(() => handleLikePost(post.id), [handleLikePost, post.id]);
  const handleToggleReplies = useCallback(() => toggleReplies(post.id), [toggleReplies, post.id]);
  const handleShare = useCallback(() => handleSharePost(post), [handleSharePost, post]);
  const handleStartReply = useCallback(() => startReply(post.id), [startReply, post.id]);
  const handleSubmitReply = useCallback(() => submitReply(post.id), [submitReply, post.id]);

  return (
    <DashboardCard key={post.id} style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: post.author.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100' }} style={styles.avatar} />
        <View style={styles.authorInfo}>
          <View style={styles.authorNameRow}>
            <Text style={[styles.authorName, { color: colors.text }]}>{post.author.name}</Text>
          </View>
          <View style={styles.authorMeta}>
            <Text style={styles.authorLevel}>{post.author.level}</Text>
            <Text style={styles.authorStreak}>🔥 {post.author.streak} {t('dayStreak')}</Text>
          </View>
        </View>
        <Text style={[styles.timestamp, { color: colors.textTertiary }]}>{post.timestamp}</Text>
      </View>

      <Text style={[styles.postContent, { color: colors.text }]}>{post.content}</Text>

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLike}
          accessible={true}
          accessibilityLabel={`${post.isLiked ? t('unlike') : t('like')} ${t('postBy')} ${post.author.name}, ${post.likesCount} ${post.likesCount === 1 ? t('likeSingular') : t('likesPlural')}`}
          accessibilityHint="Double tap to like or unlike this post"
          accessibilityRole="button"
        >
          <Heart
            size={20}
            color={post.isLiked ? "#EF4444" : "#6B7280"}
            fill={post.isLiked ? "#EF4444" : "none"}
          />
          <Text style={[
            styles.actionText,
            { color: post.isLiked ? '#EF4444' : colors.textSecondary },
            post.isLiked && { color: '#EF4444' }
          ]}>
            {post.likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleToggleReplies}
          accessible={true}
          accessibilityLabel={`${t('viewRepliesToPostBy')} ${post.author.name}, ${post.repliesCount} ${post.repliesCount === 1 ? t('replySingular') : t('repliesPlural')}`}
          accessibilityHint="Double tap to show or hide replies"
          accessibilityRole="button"
        >
          <MessageCircle size={20} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>{post.repliesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
          accessible={true}
          accessibilityLabel={`${t('sharePostBy')} ${post.author.name}`}
          accessibilityHint="Double tap to share this post"
          accessibilityRole="button"
        >
          <Share size={20} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>{t('share')}</Text>
        </TouchableOpacity>
      </View>

      {/* Replies Section */}
      {expandedReplies.has(post.id) && (
        <View style={styles.repliesContainer}>
          {post.replies && post.replies.map((reply) => {
            const author = replyAuthors[reply.id];
            return (
              <View key={reply.id} style={styles.replyItem}>
                <Image source={{ uri: author?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100' }} style={styles.replyAvatar} />
                <View style={styles.replyContent}>
                  <Text style={[styles.replyAuthor, { color: colors.text }]}>{author?.name || t('user')}</Text>
                  <Text style={[styles.replyText, { color: colors.text }]}>{reply.content}</Text>
                  <Text style={[styles.replyTimestamp, { color: colors.textTertiary }]}>{formatTime(reply.timestamp)}</Text>
                </View>
              </View>
            );
          })}

          {/* Reply Input */}
          {replyingTo === post.id ? (
            <View style={styles.replyInputContainer}>
              <TextInput
                style={[styles.replyInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder={t('addASupportiveComment')}
                value={replyContent}
                onChangeText={setReplyContent}
                placeholderTextColor={colors.textTertiary}
                accessible={true}
                accessibilityLabel={t('replyInputField')}
                accessibilityHint="Enter your reply to this post"
              />
              <View style={styles.replyActions}>
                <TouchableOpacity
                  style={styles.cancelReplyButton}
                  onPress={cancelReply}
                  accessible={true}
                  accessibilityLabel={t('cancelReply')}
                  accessibilityHint="Cancel and close reply input"
                  accessibilityRole="button"
                >
                  <Text style={[styles.cancelReplyText, { color: colors.textSecondary }]}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitReplyButton, { backgroundColor: colors.primary }]}
                  onPress={handleSubmitReply}
                  disabled={!replyContent.trim()}
                  accessible={true}
                  accessibilityLabel={t('submitReply')}
                  accessibilityHint="Post your reply to this post"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !replyContent.trim() }}
                >
                  <Text style={styles.submitReplyText}>{t('post')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addReplyButton}
              onPress={handleStartReply}
              accessible={true}
              accessibilityLabel={t('addReply')}
              accessibilityHint="Start writing a reply to this post"
              accessibilityRole="button"
            >
              <Text style={[styles.addReplyText, { color: colors.primary }]}>{t('addReply')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </DashboardCard>
  );
});


export default function CommunitiesScreen() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { userProfile, getTotalPoints } = useFirebaseData();
  const { t } = useLanguage();
  const colors = getColors(isDarkMode);
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<{ uri: string; type: 'image' | 'video' } | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [communityStats, setCommunityStats] = useState({
    members: 0,
    postsToday: 0,
    encouragements: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const categories = getCategories(t);

  // Load community stats
  const loadCommunityStats = async () => {
    try {
      setStatsLoading(true);

      // Get total user count
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const members = usersSnapshot.size;

      // Get posts from last 24 hours
      const yesterday = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
      const postsQuery = query(
        collection(db, 'posts'),
        where('timestamp', '>=', yesterday)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const postsToday = postsSnapshot.size;

      // Calculate total likes on posts from last 24 hours
      let encouragements = 0;
      postsSnapshot.forEach(doc => {
        const post = doc.data() as CommunityPost;
        encouragements += post.likes.length;
      });

      setCommunityStats({
        members,
        postsToday,
        encouragements,
      });
    } catch (error) {
      console.error('Error loading community stats:', error);
      // Set fallback values
      setCommunityStats({
        members: 0,
        postsToday: 0,
        encouragements: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Load posts from Firebase with real-time listener
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupListener = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsOffline(false);

        // Load community stats
        await loadCommunityStats();

        unsubscribe = DatabaseService.listenToPosts(async (firebasePosts) => {
          try {
            // Transform Firebase posts to include additional data needed by UI
            const transformedPosts: Post[] = await Promise.all(
              firebasePosts.map(async (post) => {
                // Get user profile for streak and level
                const authorProfile = await DatabaseService.getUserProfile(post.userId);

                return {
                  ...post,
                  isLiked: user ? post.likes.includes(user.uid) : false,
                  likesCount: post.likes.length,
                  repliesCount: post.replies.length,
                  author: {
                    name: authorProfile?.displayName || authorProfile?.email?.split('@')[0] || t('user'),
                    avatar: authorProfile?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
                    streak: Math.floor((authorProfile?.totalPoints || 0) / 50),
                    level: `Level ${Math.floor((authorProfile?.totalPoints || 0) / 100) + 1}`,
                  },
                  timestamp: formatTime(post.timestamp),
                };
              })
            );

            setPosts(transformedPosts);
            setHasMore(firebasePosts.length >= 20);
            setLoading(false);
            setIsOffline(false);

            // Refresh stats when posts change
            await loadCommunityStats();
          } catch (error) {
            console.error('Error transforming posts:', error);
            const firebaseError = error as any;
            if (firebaseError?.code === 'unavailable') {
              setIsOffline(true);
              setError('You are currently offline. Posts will load when connection is restored.');
            } else {
              setError('Failed to load posts');
            }
            setLoading(false);
          }
        }, 20);
      } catch (error) {
        console.error('Error setting up listener:', error);
        const firebaseError = error as any;
        if (firebaseError?.code === 'unavailable') {
          setIsOffline(true);
          setError('You are currently offline. Posts will load when connection is restored.');
        } else {
          setError('Failed to load posts');
        }
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const firebasePosts = await DatabaseService.getPosts(20, lastDoc);

      if (firebasePosts.length === 0) {
        setHasMore(false);
        return;
      }

      // Transform new posts
      const transformedPosts: Post[] = await Promise.all(
        firebasePosts.map(async (post) => {
          const authorProfile = await DatabaseService.getUserProfile(post.userId);

          return {
            ...post,
            isLiked: user ? post.likes.includes(user.uid) : false,
            likesCount: post.likes.length,
            repliesCount: post.replies.length,
            author: {
              name: authorProfile?.displayName || authorProfile?.email?.split('@')[0] || t('user'),
              avatar: authorProfile?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
              streak: Math.floor((authorProfile?.totalPoints || 0) / 50),
              level: `Level ${Math.floor((authorProfile?.totalPoints || 0) / 100) + 1}`,
            },
            timestamp: formatTime(post.timestamp),
          };
        })
      );

      setPosts(prev => [...prev, ...transformedPosts]);
      setLastDoc(firebasePosts[firebasePosts.length - 1]);
      setHasMore(firebasePosts.length >= 20);
    } catch (error) {
      console.error('Error loading more posts:', error);
      setError('Failed to load more posts');
    } finally {
      setLoadingMore(false);
    }
  };

  const retryLoadPosts = async () => {
    setError(null);
    setLoading(true);

    try {
      const firebasePosts = await DatabaseService.getPosts(20);

      // Transform posts
      const transformedPosts: Post[] = await Promise.all(
        firebasePosts.map(async (post) => {
          const authorProfile = await DatabaseService.getUserProfile(post.userId);

          return {
            ...post,
            isLiked: user ? post.likes.includes(user.uid) : false,
            likesCount: post.likes.length,
            repliesCount: post.replies.length,
            author: {
              name: authorProfile?.displayName || authorProfile?.email?.split('@')[0] || t('user'),
              avatar: authorProfile?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
              streak: Math.floor((authorProfile?.totalPoints || 0) / 50),
              level: `Level ${Math.floor((authorProfile?.totalPoints || 0) / 100) + 1}`,
            },
            timestamp: formatTime(post.timestamp),
          };
        })
      );

      setPosts(transformedPosts);
      setHasMore(firebasePosts.length >= 20);
      setLastDoc(firebasePosts.length > 0 ? firebasePosts[firebasePosts.length - 1] : null);
    } catch (error) {
      console.error('Error retrying posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSharePost = useCallback(async (post: Post) => {
    const shareContent = t('sharePostContent', {
      authorName: post.author.name,
      postContent: post.content,
    });

    Alert.alert(
      t('share'),
      t('shareYourJourneyAskForAdviceOrEncourageOthers'),
      [
        {
          text: t('whatsapp'),
          onPress: () => shareToWhatsApp(shareContent),
        },
        {
          text: t('facebook'),
          onPress: () => shareToFacebook(shareContent),
        },
        {
          text: t('instagram'),
          onPress: () => shareToInstagram(shareContent),
        },
        {
          text: t('moreOptions'),
          onPress: () => shareGeneric(shareContent),
        },
        {
          text: t('cancel'),
          style: 'cancel',
        },
      ]
    );
  }, [t]);

  const shareToWhatsApp = async (content: string) => {
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(content)}`;
    
    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert(t('error'), t('failedToUpdateProfile'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('failedToUpdateProfile'));
    }
  };

  const shareToFacebook = async (content: string) => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://stayhealthybehappy.app')}&quote=${encodeURIComponent(content)}`;
    
    try {
      const supported = await Linking.canOpenURL(facebookUrl);
      if (supported) {
        await Linking.openURL(facebookUrl);
      } else {
        Alert.alert(t('error'), t('failedToUpdateProfile'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('failedToUpdateProfile'));
    }
  };

  const shareToInstagram = async (content: string) => {
    const instagramUrl = 'instagram://';
    
    try {
      const supported = await Linking.canOpenURL(instagramUrl);
      if (supported) {
        // Instagram doesn't support direct text sharing, so we'll copy to clipboard and open Instagram
        Alert.alert(
          t('share'),
          t('instagramSharingMessage'),
          [
            {
              text: t('openInstagram'),
              onPress: () => Linking.openURL(instagramUrl),
            },
            {
              text: t('cancel'),
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert(t('error'), t('failedToUpdateProfile'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('failedToUpdateProfile'));
    }
  };

  const shareGeneric = async (content: string) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync('data:text/plain;base64,' + btoa(content), {
          mimeType: 'text/plain',
          dialogTitle: t('sharePost'),
        });
      } else {
        Alert.alert(t('error'), t('failedToUpdateProfile'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('failedToUpdateProfile'));
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.content.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                            post.author.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [posts, debouncedSearchQuery]);

  const toggleReplies = useCallback((postId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  }, []);

  const startReply = useCallback((postId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (isOffline) {
      Alert.alert(t('error'), t('cannotReplyOffline'));
      return;
    }
    setReplyingTo(postId);
    setReplyContent('');
  }, [user, router, isOffline, t]);

  const cancelReply = useCallback(() => {
    setReplyingTo(null);
    setReplyContent('');
  }, []);

  const submitReply = useCallback(async (postId: string) => {
    const trimmedContent = replyContent.trim();
    if (!trimmedContent || !user) {
      return;
    }
    if (trimmedContent.length > 200) {
      Alert.alert(t('error'), t('replyContentTooLong'));
      return;
    }
    // Additional validation for replies
    const hasInvalidChars = /[<>\"'&]/.test(trimmedContent);
    if (hasInvalidChars) {
      Alert.alert(t('error'), t('replyContentContainsInvalidCharacters'));
      return;
    }
    if (isOffline) {
      Alert.alert(t('error'), t('cannotReplyOffline'));
      return;
    }

    // Find the current post
    const currentPost = posts.find(post => post.id === postId);
    if (!currentPost) return;

    // Create optimistic reply
    const tempReplyId = `temp_${Date.now()}`;
    const optimisticReply: Reply = {
      id: tempReplyId,
      userId: user.uid,
      content: trimmedContent,
      timestamp: Timestamp.now(),
    };

    // Optimistic UI update
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              replies: [...post.replies, optimisticReply],
              repliesCount: post.repliesCount + 1,
            }
          : post
      )
    );

    // Clear input and close reply UI
    setReplyingTo(null);
    setReplyContent('');

    try {
      // Sync with backend
      await DatabaseService.addReply(postId, {
        userId: user.uid,
        content: trimmedContent,
      });
    } catch (error) {
      console.error('Error adding reply:', error);

      // Revert optimistic changes on error
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                replies: post.replies.filter(reply => reply.id !== tempReplyId),
                repliesCount: post.repliesCount - 1,
              }
            : post
        )
      );

      // Enhanced error handling
      const firebaseError = error as any;
      if (firebaseError?.code === 'unavailable') {
        Alert.alert(t('error'), t('noInternetConnection'));
      } else {
        Alert.alert(t('error'), t('failedToAddReply'));
      }
    }
  }, [replyContent, user, posts, t]);

  const handleLikePost = useCallback(async (postId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Check for offline mode
    if (isOffline) {
      Alert.alert(t('error'), t('cannotLikePostOffline'));
      return;
    }

    // Find the current post to store original state for potential rollback
    const currentPost = posts.find(post => post.id === postId);
    if (!currentPost) return;

    const originalIsLiked = currentPost.isLiked;
    const originalLikesCount = currentPost.likesCount;

    // Optimistic update: Update UI immediately
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
            }
          : post
      )
    );

    try {
      // Sync with backend
      await DatabaseService.likePost(postId, user.uid);
    } catch (error) {
      console.error('Error liking post:', error);

      // Revert optimistic changes on error
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                isLiked: originalIsLiked,
                likesCount: originalLikesCount,
              }
            : post
        )
      );

      // Enhanced error handling
      const firebaseError = error as any;
      if (firebaseError?.code === 'unavailable') {
        Alert.alert(t('error'), t('noInternetConnection'));
      } else {
        Alert.alert(t('error'), t('failedToLikePost'));
      }
    }
  }, [user, router, posts, t]);

  const handleCreatePost = async () => {
    const trimmedContent = newPostContent.trim();
    if (!trimmedContent) {
      Alert.alert(t('error'), t('postContentCannotBeEmpty'));
      return;
    }
    if (trimmedContent.length > 500) {
      Alert.alert(t('error'), t('postContentTooLong'));
      return;
    }
    // Additional validation for special characters or potentially harmful content
    const hasInvalidChars = /[<>\"'&]/.test(trimmedContent);
    if (hasInvalidChars) {
      Alert.alert(t('error'), t('postContentContainsInvalidCharacters'));
      return;
    }
    if (!user) {
      router.push('/login');
      return;
    }

    // Check for offline mode
    if (isOffline) {
      Alert.alert(t('error'), t('cannotCreatePostOffline'));
      return;
    }

    // Optimistic UI update: Add post immediately to local state
    const tempId = `temp_${Date.now()}`;
    const optimisticPost: Post = {
      id: tempId,
      userId: user.uid,
      content: trimmedContent,
      timestamp: new Date().toISOString(), // Temporary timestamp
      likes: [],
      replies: [],
      isLiked: false,
      likesCount: 0,
      repliesCount: 0,
      author: {
        name: userProfile?.displayName || user.email?.split('@')[0] || t('user'),
        avatar: userProfile?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
        streak: Math.floor((userProfile?.totalPoints || 0) / 50),
        level: `Level ${Math.floor((userProfile?.totalPoints || 0) / 100) + 1}`,
      },
    };

    setPosts(prev => [optimisticPost, ...prev]);

    try {
      const postId = await DatabaseService.createPost({
        userId: user.uid,
        content: trimmedContent,
      });

      // Clear form and close modal
      setNewPostContent('');
      setSelectedMedia(null);
      setShowNewPostModal(false);
      Alert.alert(t('success'), t('postCreatedSuccessfully'));
    } catch (error) {
      console.error('Error creating post:', error);
      // Remove optimistic post on error
      setPosts(prev => prev.filter(post => post.id !== tempId));

      // Enhanced error handling for different scenarios
      const firebaseError = error as any;
      if (firebaseError?.code === 'unavailable') {
        Alert.alert(t('error'), t('noInternetConnection'));
      } else if (firebaseError?.code === 'permission-denied') {
        Alert.alert(t('error'), t('permissionDenied'));
      } else {
        Alert.alert(t('error'), t('failedToCreatePost'));
      }
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const postDoc = await DatabaseService.getPost(postId);
      if (postDoc) {
        const transformedComments: Comment[] = await Promise.all(postDoc.replies.map(async (reply) => {
          let authorName = t('user');
          let authorAvatar = 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100';

          try {
            const authorProfile = await DatabaseService.getUserProfile(reply.userId);
            authorName = authorProfile?.displayName || authorProfile?.email?.split('@')[0] || t('user');
            authorAvatar = authorProfile?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100';
          } catch (error) {
            console.error('Error fetching comment author:', error);
          }

          return {
            id: reply.id,
            userId: reply.userId,
            content: reply.content,
            timestamp: formatTime(reply.timestamp),
            isLiked: false,
            author: {
              name: authorName,
              avatar: authorAvatar,
            },
          };
        }));

        setComments(prev => ({
          ...prev,
          [postId]: transformedComments
        }));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = useCallback(async () => {
    const trimmedComment = newComment.trim();
    if (!trimmedComment || !selectedPost || !user) {
      return;
    }
    if (trimmedComment.length > 200) {
      Alert.alert(t('error'), t('commentContentTooLong'));
      return;
    }
    // Additional validation for comments
    const hasInvalidChars = /[<>\"'&]/.test(trimmedComment);
    if (hasInvalidChars) {
      Alert.alert(t('error'), t('commentContentContainsInvalidCharacters'));
      return;
    }
    if (isOffline) {
      Alert.alert(t('error'), t('cannotCommentOffline'));
      return;
    }

    try {
      await DatabaseService.addReply(selectedPost.id, {
        userId: user.uid,
        content: trimmedComment,
      });

      // Reload comments for this post
      const updatedPost = await DatabaseService.getPost(selectedPost.id);
      if (updatedPost) {
        // Fetch author profiles for all replies
        const commentsWithAuthors = await Promise.all(updatedPost.replies.map(async (reply) => {
          let authorName = t('user');
          let authorAvatar = 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100';

          try {
            const authorProfile = await DatabaseService.getUserProfile(reply.userId);
            authorName = authorProfile?.displayName || authorProfile?.email?.split('@')[0] || t('user');
            authorAvatar = authorProfile?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100';
          } catch (error) {
            console.error('Error fetching comment author:', error);
          }

          return {
            id: reply.id,
            userId: reply.userId,
            content: reply.content,
            timestamp: formatTime(reply.timestamp),
            isLiked: false,
            author: {
              name: authorName,
              avatar: authorAvatar,
            },
          };
        }));

        setComments(prev => ({
          ...prev,
          [selectedPost.id]: commentsWithAuthors
        }));
      }

      setNewComment('');
      setShowCommentsModal(false);
      Alert.alert(t('success'), t('activityCompleted'));
    } catch (error) {
      console.error('Error adding comment:', error);
      const firebaseError = error as any;
      if (firebaseError?.code === 'unavailable') {
        Alert.alert(t('error'), t('noInternetConnection'));
      } else {
        Alert.alert(t('error'), t('failedToUpdateProfile'));
      }
    }
  }, [newComment, selectedPost, user, t]);



  const handleMediaUpload = () => {
    Alert.alert(
      t('addPhotoOrVideo'),
      t('chooseMediaType'),
      [
        {
          text: t('takePhoto'),
          onPress: () => openCamera('photo'),
        },
        {
          text: t('recordVideo'),
          onPress: () => openCamera('video'),
        },
        {
          text: t('chooseFromGallery'),
          onPress: () => openImagePicker('photo'),
        },
        {
          text: t('chooseVideoFromGallery'),
          onPress: () => openImagePicker('video'),
        },
        {
          text: t('cancel'),
          style: 'cancel',
        },
      ]
    );
  };

  const openCamera = async (mediaType: 'photo' | 'video') => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permissionNeeded'), t('cameraPermissionRequired'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: mediaType === 'photo' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: mediaType === 'photo' ? [16, 9] : undefined,
        quality: 0.8,
        videoMaxDuration: 60, // 60 seconds max for videos
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedMedia({
          uri: result.assets[0].uri,
          type: mediaType === 'photo' ? 'image' : 'video',
        });
      }
    } catch (error) {
      Alert.alert(t('error'), t('failedToUpdateProfile'));
    }
  };

  const openImagePicker = async (mediaType: 'photo' | 'video') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permissionNeeded'), t('galleryPermissionRequired'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType === 'photo' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: mediaType === 'photo' ? [16, 9] : undefined,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedMedia({
          uri: result.assets[0].uri,
          type: mediaType === 'photo' ? 'image' : 'video',
        });
      }
    } catch (error) {
      Alert.alert(t('error'), t('failedToUpdateProfile'));
    }
  };

  const removeSelectedMedia = () => {
    setSelectedMedia(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.text }]}>{t('communities')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('connectShareGrowTogether')}</Text>
          </View>
          <TouchableOpacity
            style={styles.headerNewPostButton}
            onPress={() => {
              if (user) {
                setShowNewPostModal(true);
              } else {
                router.push('/login');
              }
            }}
            accessible={true}
            accessibilityLabel={t('createNewPost')}
            accessibilityHint={t('openModalToCreateNewCommunityPost')}
            accessibilityRole="button"
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Search size={20} color={colors.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t('searchPostsOrUsers')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textTertiary}
              accessible={true}
              accessibilityLabel="Search posts and users"
              accessibilityHint="Enter text to search for posts or users"
            />
          </View>
        </View>


        {/* Community Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Users size={20} color="#4F46E5" />
            <Text style={styles.statValue}>
              {statsLoading ? '...' : communityStats.members > 0 ? communityStats.members.toString() : '0'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('members')}</Text>
          </View>
          <View style={styles.statItem}>
            <MessageCircle size={20} color="#10B981" />
            <Text style={styles.statValue}>
              {statsLoading ? '...' : communityStats.postsToday.toString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('postsToday')}</Text>
          </View>
          <View style={styles.statItem}>
            <Heart size={20} color="#EF4444" />
            <Text style={styles.statValue}>
              {statsLoading ? '...' : communityStats.encouragements.toString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('encouragements')}</Text>
          </View>
        </View>

        {/* New Post Input or Login Prompt */}
        {user ? (
          <View style={styles.newPostContainer}>
            <View style={[styles.newPostInputContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <TextInput
                style={[styles.newPostInput, { color: colors.text }]}
                placeholder={t('shareYourJourneyAskForAdviceOrEncourageOthers')}
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
                placeholderTextColor={colors.textTertiary}
                accessible={true}
                accessibilityLabel="New post content"
                accessibilityHint="Enter your post content here"
              />
              <TouchableOpacity
                style={[styles.newPostButton, { backgroundColor: colors.primary }]}
                onPress={handleCreatePost}
                disabled={!newPostContent.trim()}
                accessible={true}
                accessibilityLabel="Send post"
                accessibilityHint={t('createAndPublishYourNewPost')}
                accessibilityRole="button"
                accessibilityState={{ disabled: !newPostContent.trim() }}
              >
                <Send size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.loginPromptContainer}>
            <View style={[styles.loginPromptCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Text style={[styles.loginPromptTitle, { color: colors.text }]}>{t('joinTheCommunity')}</Text>
              <Text style={[styles.loginPromptText, { color: colors.textSecondary }]}>{t('loginToShareYourJourney')}</Text>
              <TouchableOpacity
                style={[styles.loginPromptButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/login')}
                accessible={true}
                accessibilityLabel="Login to join community"
                accessibilityHint="Navigate to login screen to access community features"
                accessibilityRole="button"
              >
                <Text style={styles.loginPromptButtonText}>{t('login')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Posts Feed */}
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          style={styles.postsContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            loading && posts.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('loading')}</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
                {isOffline ? (
                  <Text style={[styles.errorText, { color: colors.textTertiary, fontSize: 14 }]}>
                    {t('workingOffline')}
                  </Text>
                ) : (
                  <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: colors.primary }]}
                    onPress={retryLoadPosts}
                    accessible={true}
                    accessibilityLabel="Retry loading posts"
                    accessibilityHint="Try to load posts again"
                    accessibilityRole="button"
                  >
                    <Text style={styles.retryButtonText}>{t('retry')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading && !error && filteredPosts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('noPostsYet')}</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('beTheFirstToShare')}
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('loading')}</Text>
              </View>
            ) : hasMore ? (
              <View style={styles.loadMoreContainer}>
                <TouchableOpacity
                  style={[styles.loadMoreButton, { backgroundColor: colors.primary }]}
                  onPress={loadMorePosts}
                  disabled={loadingMore}
                  accessible={true}
                  accessibilityLabel="Load more posts"
                  accessibilityHint="Load additional posts from the community"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: loadingMore }}
                >
                  <Text style={styles.loadMoreButtonText}>
                    {t('loadMore')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
          renderItem={useMemo(() => ({ item: post }) => (
            <PostItem
              post={post}
              colors={colors}
              t={t}
              handleLikePost={handleLikePost}
              toggleReplies={toggleReplies}
              handleSharePost={handleSharePost}
              startReply={startReply}
              cancelReply={cancelReply}
              submitReply={submitReply}
              replyingTo={replyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              expandedReplies={expandedReplies}
            />
          ), [colors, t, handleLikePost, toggleReplies, handleSharePost, startReply, cancelReply, submitReply, replyingTo, replyContent, setReplyContent, expandedReplies])}
        />

        {/* New Post Modal */}
        <Modal
          visible={showNewPostModal}
          animationType="slide"
          presentationStyle="pageSheet"
          accessible={true}
          accessibilityViewIsModal={true}
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowNewPostModal(false)}
                accessible={true}
                accessibilityLabel={t('closeNewPostModal')}
                accessibilityHint={t('closeTheModalWithoutCreatingAPost')}
                accessibilityRole="button"
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('shareWithCommunity')}</Text>
              <TouchableOpacity
                style={styles.postButton}
                onPress={handleCreatePost}
                accessible={true}
                accessibilityLabel={t('postToCommunity')}
                accessibilityHint="Create and publish your new post"
                accessibilityRole="button"
              >
                <Text style={styles.postButtonText}>{t('post')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>

              <View style={styles.mediaUploadSection}>
                <Text style={[styles.selectorLabel, { color: colors.text }]}>{t('addPhotoOrVideo')}</Text>
                
                {selectedMedia ? (
                  <View style={styles.selectedMediaContainer}>
                    {selectedMedia.type === 'image' ? (
                      <Image source={{ uri: selectedMedia.uri }} style={styles.selectedMediaPreview} />
                    ) : (
                      <View style={[styles.selectedMediaPreview, styles.videoPreview]}>
                        <Video size={48} color="#FFFFFF" />
                        <Text style={styles.videoPreviewText}>{t('videoSelected')}</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.removeMediaButton}
                      onPress={removeSelectedMedia}
                      accessible={true}
                      accessibilityLabel={t('removeSelectedMedia')}
                      accessibilityHint={t('removeTheAttachedPhotoOrVideoFromThisPost')}
                      accessibilityRole="button"
                    >
                      <X size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.mediaUploadArea, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={handleMediaUpload}
                    accessible={true}
                    accessibilityLabel={t('addPhotoOrVideoToPost')}
                    accessibilityHint={t('openOptionsToTakePhotoRecordVideoOrChooseFromGallery')}
                    accessibilityRole="button"
                  >
                    <Upload size={32} color={colors.textTertiary} />
                    <Text style={[styles.mediaUploadText, { color: colors.textSecondary }]}>
                      {t('tapToAddPhotoOrVideo')}
                    </Text>
                    <Text style={[styles.mediaUploadSubtext, { color: colors.textTertiary }]}>
                      {t('shareYourDigitalWellnessJourneyVisually')}
                    </Text>
                    <View style={styles.mediaUploadIcons}>
                      <View style={styles.mediaUploadIcon}>
                        <Camera size={20} color={colors.textTertiary} />
                      </View>
                      <View style={styles.mediaUploadIcon}>
                        <ImageIcon size={20} color={colors.textTertiary} />
                      </View>
                      <View style={styles.mediaUploadIcon}>
                        <Video size={20} color={colors.textTertiary} />
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={[styles.postInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder={t('shareYourJourneyAskForAdviceOrEncourageOthers')}
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
                textAlignVertical="top"
                placeholderTextColor={colors.textTertiary}
                accessible={true}
                accessibilityLabel={t('postContentInput')}
                accessibilityHint={t('enterTheTextForYourCommunityPost')}
              />
            </View>
          </SafeAreaView>
        </Modal>

        {/* Comments Modal */}
        <Modal
          visible={showCommentsModal}
          animationType="slide"
          presentationStyle="pageSheet"
          accessible={true}
          accessibilityViewIsModal={true}
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowCommentsModal(false)}
                accessible={true}
                accessibilityLabel={t('closeCommentsModal')}
                accessibilityHint={t('closeTheCommentsView')}
                accessibilityRole="button"
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('comments')}</Text>
              <View style={{ width: 24 }} />
            </View>

            <FlatList
              style={styles.commentsContainer}
              data={selectedPost ? comments[selectedPost.id] || [] : []}
              keyExtractor={(item) => item.id}
              renderItem={({ item: comment }) => (
                <View style={styles.commentItem}>
                  <Image source={{ uri: comment.author.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100' }} style={styles.commentAvatar} />
                  <View style={styles.commentContent}>
                    <Text style={[styles.commentAuthor, { color: colors.text }]}>{comment.author.name}</Text>
                    <Text style={[styles.commentText, { color: colors.text }]}>{comment.content}</Text>
                    <View style={styles.commentActions}>
                      <TouchableOpacity style={styles.commentAction}>
                        <Heart
                          size={14}
                          color={comment.isLiked ? "#EF4444" : colors.textTertiary}
                          fill={comment.isLiked ? "#EF4444" : "none"}
                        />
                        <Text style={[styles.commentActionText, { color: colors.textTertiary }]}>0</Text>
                      </TouchableOpacity>
                      <Text style={[styles.commentTimestamp, { color: colors.textTertiary }]}>{comment.timestamp}</Text>
                    </View>
                  </View>
                </View>
              )}
            />

            <View style={styles.commentInputContainer}>
              <TextInput
                style={[styles.commentInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder={t('addASupportiveComment')}
                value={newComment}
                onChangeText={setNewComment}
                placeholderTextColor={colors.textTertiary}
                accessible={true}
                accessibilityLabel={t('commentInputField')}
                accessibilityHint={t('enterYourCommentOnThisPost')}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleAddComment}
                accessible={true}
                accessibilityLabel={t('sendComment')}
                accessibilityHint={t('postYourComment')}
                accessibilityRole="button"
              >
                <Send size={20} color="#4F46E5" />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flex: 1,
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
  headerNewPostButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
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
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 24,
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  postsContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  postCard: {
    marginBottom: 16,
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  authorLevel: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  authorStreak: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
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
  postButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  categorySelector: {
    marginBottom: 24,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categorySelectorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  categorySelectorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  postInput: {
    flex: 1,
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  commentsContainer: {
    flex: 1,
    padding: 24,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  commentTimestamp: {
    fontSize: 12,
    fontWeight: '500',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaUploadSection: {
    marginBottom: 24,
  },
  mediaUploadArea: {
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  mediaUploadText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  mediaUploadSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  mediaUploadIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaUploadIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedMediaContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedMediaPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  videoPreview: {
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreviewText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadMoreContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  loadMoreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  loadMoreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  newPostContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  newPostInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  newPostInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 40,
    maxHeight: 100,
  },
  newPostButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: '#4F46E5',
  },
  repliesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  replyItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  replyContent: {
    flex: 1,
  },
  replyAuthor: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  replyText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  replyTimestamp: {
    fontSize: 12,
    fontWeight: '500',
  },
  replyInputContainer: {
    marginTop: 12,
  },
  replyInput: {
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelReplyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelReplyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitReplyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  submitReplyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addReplyButton: {
    paddingVertical: 8,
  },
  addReplyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginPromptContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  loginPromptCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  loginPromptTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginPromptText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  loginPromptButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  loginPromptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
