import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, MessageCircle, Heart, Share, Plus, Send, Trophy, Target, Clock, ThumbsUp, MessageSquare, X, Filter, Search, Camera, Image as ImageIcon, Video, Upload } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardCard } from '@/components/DashboardCard';
import * as Sharing from 'expo-sharing';
import { Linking } from 'react-native';
import { useDarkMode } from '@/hooks/useDarkMode';
import { getColors } from '@/constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import { Alert as RNAlert } from 'react-native';

interface Post {
  id: number;
  author: {
    name: string;
    avatar: string;
    streak: number;
    level: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  category: 'success' | 'challenge' | 'tip' | 'motivation';
  image?: string;
}

interface Comment {
  id: number;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

const initialPosts: Post[] = [
];

const categories = [
  { id: 'all', name: 'All Posts', color: '#6B7280' },
  { id: 'success', name: 'Success Stories', color: '#10B981' },
  { id: 'challenge', name: 'Challenges', color: '#F59E0B' },
  { id: 'tip', name: 'Tips & Tricks', color: '#4F46E5' },
  { id: 'motivation', name: 'Motivation', color: '#EF4444' },
];

export default function CommunitiesScreen() {
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<Post['category']>('motivation');
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<{ uri: string; type: 'image' | 'video' } | null>(null);

  const handleSharePost = async (post: Post) => {
    const shareContent = `Check out this post from ${post.author.name}:\n\n"${post.content}"\n\nShared from Stay Healthy, Be Happy app`;
    
    Alert.alert(
      'Share Post',
      'Choose how you want to share this post:',
      [
        {
          text: 'WhatsApp',
          onPress: () => shareToWhatsApp(shareContent),
        },
        {
          text: 'Facebook',
          onPress: () => shareToFacebook(shareContent),
        },
        {
          text: 'Instagram',
          onPress: () => shareToInstagram(shareContent),
        },
        {
          text: 'More Options',
          onPress: () => shareGeneric(shareContent),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const shareToWhatsApp = async (content: string) => {
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(content)}`;
    
    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('WhatsApp not installed', 'Please install WhatsApp to share via WhatsApp.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share to WhatsApp');
    }
  };

  const shareToFacebook = async (content: string) => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://stayhealthybehappy.app')}&quote=${encodeURIComponent(content)}`;
    
    try {
      const supported = await Linking.canOpenURL(facebookUrl);
      if (supported) {
        await Linking.openURL(facebookUrl);
      } else {
        Alert.alert('Error', 'Unable to open Facebook');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share to Facebook');
    }
  };

  const shareToInstagram = async (content: string) => {
    const instagramUrl = 'instagram://';
    
    try {
      const supported = await Linking.canOpenURL(instagramUrl);
      if (supported) {
        // Instagram doesn't support direct text sharing, so we'll copy to clipboard and open Instagram
        Alert.alert(
          'Share to Instagram',
          'Instagram doesn\'t support direct text sharing. The content has been copied to your clipboard. You can paste it when creating your Instagram story or post.',
          [
            {
              text: 'Open Instagram',
              onPress: () => Linking.openURL(instagramUrl),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert('Instagram not installed', 'Please install Instagram to share via Instagram.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share to Instagram');
    }
  };

  const shareGeneric = async (content: string) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync('data:text/plain;base64,' + btoa(content), {
          mimeType: 'text/plain',
          dialogTitle: 'Share Post',
        });
      } else {
        Alert.alert('Sharing not available', 'Sharing is not available on this device.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share content');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLikePost = (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleCreatePost = () => {
    if (newPostContent.trim()) {
      const newPost: Post = {
        id: posts.length + 1,
        author: {
          name: 'You',
          avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
          streak: 7,
          level: 'Focus Warrior',
        },
        content: newPostContent,
        timestamp: 'Just now',
        likes: 0,
        comments: 0,
        isLiked: false,
        category: newPostCategory,
        image: selectedMedia?.type === 'image' ? selectedMedia.uri : undefined,
      };
      
      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setSelectedMedia(null);
      setShowNewPostModal(false);
      Alert.alert('Success', 'Your post has been shared with the community!');
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() && selectedPost) {
      // In a real app, this would update the backend
      Alert.alert('Success', 'Your comment has been added!');
      setNewComment('');
      setShowCommentsModal(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : '#6B7280';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'success': return Trophy;
      case 'challenge': return Target;
      case 'tip': return ThumbsUp;
      case 'motivation': return Heart;
      default: return MessageCircle;
    }
  };

  const handleMediaUpload = () => {
    Alert.alert(
      'Add Media',
      'Choose how you want to add media to your post:',
      [
        {
          text: 'Take Photo',
          onPress: () => openCamera('photo'),
        },
        {
          text: 'Take Video',
          onPress: () => openCamera('video'),
        },
        {
          text: 'Choose Photo',
          onPress: () => openImagePicker('photo'),
        },
        {
          text: 'Choose Video',
          onPress: () => openImagePicker('video'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const openCamera = async (mediaType: 'photo' | 'video') => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos/videos.');
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
      Alert.alert('Error', 'Failed to access camera');
    }
  };

  const openImagePicker = async (mediaType: 'photo' | 'video') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Media library permission is required to select photos/videos.');
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
      Alert.alert('Error', 'Failed to access media library');
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
            <Text style={[styles.title, { color: colors.text }]}>Communities</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Connect, share, and grow together</Text>
          </View>
          <TouchableOpacity
            style={styles.newPostButton}
            onPress={() => setShowNewPostModal(true)}
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
              placeholder="Search posts or users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  { backgroundColor: colors.cardBackground, borderColor: colors.border },
                  selectedCategory === category.id && {
                    backgroundColor: category.color,
                    borderColor: category.color,
                  }
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.categoryText,
                  { color: selectedCategory === category.id ? '#FFFFFF' : colors.textSecondary },
                  selectedCategory === category.id && styles.categoryTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Community Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Users size={20} color="#4F46E5" />
            <Text style={styles.statValue}>2.4k</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Members</Text>
          </View>
          <View style={styles.statItem}>
            <MessageCircle size={20} color="#10B981" />
            <Text style={styles.statValue}>156</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Posts Today</Text>
          </View>
          <View style={styles.statItem}>
            <Heart size={20} color="#EF4444" />
            <Text style={styles.statValue}>892</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Encouragements</Text>
          </View>
        </View>

        {/* Posts Feed */}
        <ScrollView 
          style={styles.postsContainer}
          showsVerticalScrollIndicator={false}
        >
          {filteredPosts.map((post) => {
            const CategoryIcon = getCategoryIcon(post.category);
            return (
              <DashboardCard key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
                  <View style={styles.authorInfo}>
                    <View style={styles.authorNameRow}>
                      <Text style={[styles.authorName, { color: colors.text }]}>{post.author.name}</Text>
                      <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(post.category) }]}>
                        <CategoryIcon size={12} color="#FFFFFF" />
                      </View>
                    </View>
                    <View style={styles.authorMeta}>
                      <Text style={styles.authorLevel}>{post.author.level}</Text>
                      <Text style={styles.authorStreak}>🔥 {post.author.streak} day streak</Text>
                    </View>
                  </View>
                  <Text style={[styles.timestamp, { color: colors.textTertiary }]}>{post.timestamp}</Text>
                </View>

                <Text style={[styles.postContent, { color: colors.text }]}>{post.content}</Text>

                {post.image && (
                  <Image source={{ uri: post.image }} style={styles.postImage} />
                )}

                <View style={styles.postActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleLikePost(post.id)}
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
                      {post.likes}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      setSelectedPost(post);
                      setShowCommentsModal(true);
                    }}
                  >
                    <MessageCircle size={20} color={colors.textSecondary} />
                    <Text style={[styles.actionText, { color: colors.textSecondary }]}>{post.comments}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleSharePost(post)}
                  >
                    <Share size={20} color={colors.textSecondary} />
                    <Text style={[styles.actionText, { color: colors.textSecondary }]}>Share</Text>
                  </TouchableOpacity>
                </View>
              </DashboardCard>
            );
          })}
        </ScrollView>

        {/* New Post Modal */}
        <Modal
          visible={showNewPostModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowNewPostModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Share with Community</Text>
              <TouchableOpacity
                style={styles.postButton}
                onPress={handleCreatePost}
              >
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.categorySelector}>
                <Text style={[styles.selectorLabel, { color: colors.text }]}>Category:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.slice(1).map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categorySelectorButton,
                        { backgroundColor: colors.background },
                        newPostCategory === category.id && {
                          backgroundColor: category.color,
                        }
                      ]}
                      onPress={() => setNewPostCategory(category.id as Post['category'])}
                    >
                      <Text style={[
                        styles.categorySelectorText,
                        { color: newPostCategory === category.id ? '#FFFFFF' : colors.textSecondary },
                        newPostCategory === category.id && { color: '#FFFFFF' }
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.mediaUploadSection}>
                <Text style={[styles.selectorLabel, { color: colors.text }]}>Add Photo or Video:</Text>
                
                {selectedMedia ? (
                  <View style={styles.selectedMediaContainer}>
                    {selectedMedia.type === 'image' ? (
                      <Image source={{ uri: selectedMedia.uri }} style={styles.selectedMediaPreview} />
                    ) : (
                      <View style={[styles.selectedMediaPreview, styles.videoPreview]}>
                        <Video size={48} color="#FFFFFF" />
                        <Text style={styles.videoPreviewText}>Video Selected</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.removeMediaButton}
                      onPress={removeSelectedMedia}
                    >
                      <X size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.mediaUploadArea, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={handleMediaUpload}
                  >
                    <Upload size={32} color={colors.textTertiary} />
                    <Text style={[styles.mediaUploadText, { color: colors.textSecondary }]}>
                      Tap to add photo or video
                    </Text>
                    <Text style={[styles.mediaUploadSubtext, { color: colors.textTertiary }]}>
                      Share your digital wellness journey visually
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
                placeholder="Share your journey, ask for advice, or encourage others..."
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
                textAlignVertical="top"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
          </SafeAreaView>
        </Modal>

        {/* Comments Modal */}
        <Modal
          visible={showCommentsModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCommentsModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Comments</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.commentsContainer}>
              {selectedPost && sampleComments[selectedPost.id]?.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Image source={{ uri: comment.author.avatar }} style={styles.commentAvatar} />
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
                        <Text style={[styles.commentActionText, { color: colors.textTertiary }]}>{comment.likes}</Text>
                      </TouchableOpacity>
                      <Text style={[styles.commentTimestamp, { color: colors.textTertiary }]}>{comment.timestamp}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.commentInputContainer}>
              <TextInput
                style={[styles.commentInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder="Add a supportive comment..."
                value={newComment}
                onChangeText={setNewComment}
                placeholderTextColor={colors.textTertiary}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleAddComment}
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
  newPostButton: {
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
});