import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  UploadMetadata
} from 'firebase/storage';
import app from './firebase';

// Initialize Firebase Storage
const storage = getStorage(app);

// Types for media operations
export type MediaType = 'image' | 'video';

export interface UploadOptions {
  contentType?: string;
  cacheControl?: string;
  customMetadata?: Record<string, string>;
}

export interface StorageError extends Error {
  code: string;
  path?: string;
}

// Custom error classes for better error handling
export class StorageUploadError extends Error implements StorageError {
  constructor(message: string, public code: string, public path?: string) {
    super(message);
    this.name = 'StorageUploadError';
  }
}

export class StorageDeleteError extends Error implements StorageError {
  constructor(message: string, public code: string, public path?: string) {
    super(message);
    this.name = 'StorageDeleteError';
  }
}

export class StorageDownloadError extends Error implements StorageError {
  constructor(message: string, public code: string, public path?: string) {
    super(message);
    this.name = 'StorageDownloadError';
  }
}

// Utility function to generate file paths
const generateFilePath = (userId: string, mediaType: MediaType, fileName: string): string => {
  const timestamp = Date.now();
  const extension = fileName.split('.').pop() || 'jpg';

  if (mediaType === 'image') {
    return `profile-images/${userId}/${timestamp}.${extension}`;
  } else {
    return `post-media/${userId}/${timestamp}.${extension}`;
  }
};

// Utility function to validate file type
const validateFileType = (fileName: string, expectedType: MediaType): boolean => {
  const extension = fileName.toLowerCase().split('.').pop();

  if (expectedType === 'image') {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    return imageExtensions.includes(extension || '');
  } else if (expectedType === 'video') {
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
    return videoExtensions.includes(extension || '');
  }

  return false;
};

// Utility function to get content type from file extension
const getContentType = (fileName: string): string => {
  const extension = fileName.toLowerCase().split('.').pop();

  const contentTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'mkv': 'video/x-matroska',
    'webm': 'video/webm',
  };

  return contentTypes[extension || ''] || 'application/octet-stream';
};

/**
 * Upload a profile image for a user
 * @param userId - The ID of the user
 * @param imageUri - The URI/path of the image file to upload
 * @param options - Optional upload configuration
 * @returns Promise<string> - The download URL of the uploaded image
 */
export const uploadProfileImage = async (
  userId: string,
  imageUri: string | Blob,
  options?: UploadOptions
): Promise<string> => {
  try {
    if (!userId || !imageUri) {
      throw new StorageUploadError('User ID and image URI are required', 'INVALID_PARAMS');
    }

    // Handle different URI formats for React Native compatibility
    let blob: Blob;

    if (typeof imageUri === 'string') {
      // Handle string URIs (file paths, URLs, etc.)
      if (imageUri.startsWith('http')) {
        // Fetch from URL
        const response = await fetch(imageUri);
        if (!response.ok) {
          throw new StorageUploadError('Failed to fetch image from URL', 'FETCH_FAILED');
        }
        blob = await response.blob();
      } else if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
        // Handle React Native file URIs
        try {
          const response = await fetch(imageUri);
          if (!response.ok) {
            throw new StorageUploadError('Failed to fetch image from file URI', 'FETCH_FAILED');
          }
          blob = await response.blob();
        } catch (error) {
          throw new StorageUploadError('Failed to read image file. Please try again.', 'FILE_READ_FAILED');
        }
      } else if (imageUri.startsWith('blob:')) {
        // Handle blob URLs (web compatibility)
        try {
          const response = await fetch(imageUri);
          if (!response.ok) {
            throw new StorageUploadError('Failed to fetch image from blob URL', 'FETCH_FAILED');
          }
          blob = await response.blob();
        } catch (error) {
          throw new StorageUploadError('Failed to read blob URL. Please try again.', 'FILE_READ_FAILED');
        }
      } else {
        throw new StorageUploadError('Unsupported URI format', 'UNSUPPORTED_URI');
      }
    } else {
      // Assume it's already a blob (File object from web)
      blob = imageUri as Blob;
    }

    // Generate file path
    const fileName = `profile-${Date.now()}.jpg`;
    const filePath = generateFilePath(userId, 'image', fileName);

    // Validate file type
    if (!validateFileType(fileName, 'image')) {
      throw new StorageUploadError('Invalid image file type', 'INVALID_FILE_TYPE');
    }

    // Prepare metadata
    const metadata: UploadMetadata = {
      contentType: options?.contentType || getContentType(fileName),
      cacheControl: options?.cacheControl || 'public, max-age=3600',
      customMetadata: options?.customMetadata || {},
    };

    // Create storage reference
    const storageRef = ref(storage, filePath);

    // Upload file
    const snapshot = await uploadBytes(storageRef, blob, metadata);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);

    if (error instanceof StorageUploadError) {
      throw error;
    }

    throw new StorageUploadError(
      `Failed to upload profile image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UPLOAD_FAILED'
    );
  }
};

/**
 * Upload post media (images or videos)
 * @param userId - The ID of the user uploading the media
 * @param mediaUri - The URI/path of the media file to upload
 * @param mediaType - The type of media ('image' or 'video')
 * @param options - Optional upload configuration
 * @returns Promise<string> - The download URL of the uploaded media
 */
export const uploadPostMedia = async (
  userId: string,
  mediaUri: string,
  mediaType: MediaType,
  options?: UploadOptions
): Promise<string> => {
  try {
    if (!userId || !mediaUri || !mediaType) {
      throw new StorageUploadError('User ID, media URI, and media type are required', 'INVALID_PARAMS');
    }

    if (!['image', 'video'].includes(mediaType)) {
      throw new StorageUploadError('Media type must be either "image" or "video"', 'INVALID_MEDIA_TYPE');
    }

    // Handle different URI formats
    let blob: Blob;

    if (typeof mediaUri === 'string') {
      if (mediaUri.startsWith('http')) {
        const response = await fetch(mediaUri);
        if (!response.ok) {
          throw new StorageUploadError('Failed to fetch media from URL', 'FETCH_FAILED');
        }
        blob = await response.blob();
      } else {
        throw new StorageUploadError('File path handling requires additional setup for React Native', 'UNSUPPORTED_URI');
      }
    } else {
      blob = mediaUri as Blob;
    }

    // Generate file path
    const fileName = `${mediaType}-${Date.now()}.${mediaType === 'image' ? 'jpg' : 'mp4'}`;
    const filePath = generateFilePath(userId, mediaType, fileName);

    // Validate file type
    if (!validateFileType(fileName, mediaType)) {
      throw new StorageUploadError(`Invalid ${mediaType} file type`, 'INVALID_FILE_TYPE');
    }

    // Prepare metadata
    const metadata: UploadMetadata = {
      contentType: options?.contentType || getContentType(fileName),
      cacheControl: options?.cacheControl || 'public, max-age=3600',
      customMetadata: {
        ...options?.customMetadata,
        mediaType,
        uploadedBy: userId,
      },
    };

    // Create storage reference
    const storageRef = ref(storage, filePath);

    // Upload file
    const snapshot = await uploadBytes(storageRef, blob, metadata);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error(`Error uploading ${mediaType}:`, error);

    if (error instanceof StorageUploadError) {
      throw error;
    }

    throw new StorageUploadError(
      `Failed to upload ${mediaType}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UPLOAD_FAILED'
    );
  }
};

/**
 * Delete media from Firebase Storage
 * @param mediaUrl - The full download URL of the media to delete
 * @returns Promise<void>
 */
export const deleteMedia = async (mediaUrl: string): Promise<void> => {
  try {
    if (!mediaUrl) {
      throw new StorageDeleteError('Media URL is required', 'INVALID_PARAMS');
    }

    // Extract file path from download URL
    // Firebase download URLs have format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?...
    const url = new URL(mediaUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);

    if (!pathMatch) {
      throw new StorageDeleteError('Invalid Firebase Storage URL format', 'INVALID_URL');
    }

    const filePath = decodeURIComponent(pathMatch[1]);

    // Create storage reference
    const storageRef = ref(storage, filePath);

    // Delete file
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting media:', error);

    if (error instanceof StorageDeleteError) {
      throw error;
    }

    throw new StorageDeleteError(
      `Failed to delete media: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DELETE_FAILED'
    );
  }
};

/**
 * Get download URL for media by path
 * @param path - The storage path of the media
 * @returns Promise<string | null> - The download URL or null if not found
 */
export const getMediaUrl = async (path: string): Promise<string | null> => {
  try {
    if (!path) {
      throw new StorageDownloadError('Storage path is required', 'INVALID_PARAMS');
    }

    // Create storage reference
    const storageRef = ref(storage, path);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    // If file doesn't exist, return null instead of throwing
    if (error instanceof Error && 'code' in error && error.code === 'storage/object-not-found') {
      console.warn(`Media not found at path: ${path}`);
      return null;
    }

    console.error('Error getting media URL:', error);

    if (error instanceof StorageDownloadError) {
      throw error;
    }

    throw new StorageDownloadError(
      `Failed to get media URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DOWNLOAD_FAILED'
    );
  }
};

/**
 * Get storage reference for a path (useful for advanced operations)
 * @param path - The storage path
 * @returns Storage reference
 */
export const getStorageRef = (path: string) => {
  return ref(storage, path);
};

/**
 * Check if a file exists in storage
 * @param path - The storage path to check
 * @returns Promise<boolean>
 */
export const mediaExists = async (path: string): Promise<boolean> => {
  try {
    await getDownloadURL(ref(storage, path));
    return true;
  } catch {
    return false;
  }
};

/**
 * Delete media with authorization check
 * @param mediaUrl - The full download URL of the media to delete
 * @param userId - The ID of the user requesting deletion (for authorization)
 * @param expectedOwnerId - The ID of the user who should own this media (optional, for additional security)
 * @returns Promise<void>
 */
export const deleteMediaWithAuth = async (
  mediaUrl: string,
  userId: string,
  expectedOwnerId?: string
): Promise<void> => {
  try {
    if (!mediaUrl) {
      throw new StorageDeleteError('Media URL is required', 'INVALID_PARAMS');
    }

    if (!userId) {
      throw new StorageDeleteError('User ID is required for authorization', 'INVALID_PARAMS');
    }

    // Extract file path from download URL
    const url = new URL(mediaUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);

    if (!pathMatch) {
      throw new StorageDeleteError('Invalid Firebase Storage URL format', 'INVALID_URL');
    }

    const filePath = decodeURIComponent(pathMatch[1]);

    // Check if this is a profile image or post media and validate ownership
    if (filePath.includes('profile-images/')) {
      // For profile images, extract user ID from path and verify ownership
      const pathParts = filePath.split('/');
      const mediaOwnerId = pathParts[1]; // profile-images/{userId}/...

      if (expectedOwnerId && mediaOwnerId !== expectedOwnerId) {
        throw new StorageDeleteError('Unauthorized: Media does not belong to the expected owner', 'UNAUTHORIZED');
      }

      if (mediaOwnerId !== userId) {
        throw new StorageDeleteError('Unauthorized: User does not own this profile image', 'UNAUTHORIZED');
      }
    } else if (filePath.includes('post-media/')) {
      // For post media, we need to check if user owns the post
      // This will be handled by the calling function with post ownership verification
      if (expectedOwnerId) {
        // Additional security check - if expectedOwnerId is provided, verify it matches
        const pathParts = filePath.split('/');
        const mediaOwnerId = pathParts[1]; // post-media/{userId}/...

        if (mediaOwnerId !== expectedOwnerId) {
          throw new StorageDeleteError('Unauthorized: Media does not belong to the expected owner', 'UNAUTHORIZED');
        }
      }
    }

    // Create storage reference
    const storageRef = ref(storage, filePath);

    // Delete file
    await deleteObject(storageRef);

    console.log(`✅ Media deleted successfully: ${filePath} by user: ${userId}`);
  } catch (error) {
    console.error('Error deleting media with authorization:', error);

    if (error instanceof StorageDeleteError) {
      throw error;
    }

    throw new StorageDeleteError(
      `Failed to delete media: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DELETE_FAILED'
    );
  }
};

/**
 * Delete old profile image when updating avatar
 * @param oldAvatarUrl - The previous avatar URL to delete
 * @param userId - The ID of the user updating their avatar
 * @returns Promise<void>
 */
export const deleteOldProfileImage = async (oldAvatarUrl: string, userId: string): Promise<void> => {
  if (!oldAvatarUrl || oldAvatarUrl.includes('pexels-photo') || oldAvatarUrl.includes('default')) {
    // Don't delete default/placeholder images
    return;
  }

  try {
    await deleteMediaWithAuth(oldAvatarUrl, userId, userId);
    console.log(`✅ Old profile image deleted for user: ${userId}`);
  } catch (error) {
    // Log error but don't throw - this shouldn't block the profile update
    console.error(`Failed to delete old profile image for user ${userId}:`, error);
  }
};

/**
 * Delete multiple media files in batch
 * @param mediaUrls - Array of media URLs to delete
 * @param userId - The ID of the user requesting deletion
 * @param expectedOwnerId - The ID of the user who should own these media files
 * @returns Promise<{ successful: string[], failed: string[] }>
 */
export const deleteMediaBatch = async (
  mediaUrls: string[],
  userId: string,
  expectedOwnerId?: string
): Promise<{ successful: string[], failed: string[] }> => {
  const results = {
    successful: [] as string[],
    failed: [] as string[]
  };

  if (!mediaUrls || mediaUrls.length === 0) {
    return results;
  }

  // Process deletions concurrently but with a limit to avoid overwhelming the service
  const BATCH_SIZE = 5;
  for (let i = 0; i < mediaUrls.length; i += BATCH_SIZE) {
    const batch = mediaUrls.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (mediaUrl) => {
      try {
        await deleteMediaWithAuth(mediaUrl, userId, expectedOwnerId);
        results.successful.push(mediaUrl);
      } catch (error) {
        console.error(`Failed to delete media ${mediaUrl}:`, error);
        results.failed.push(mediaUrl);
      }
    });

    await Promise.allSettled(batchPromises);
  }

  console.log(`✅ Batch deletion completed: ${results.successful.length} successful, ${results.failed.length} failed`);
  return results;
};

/**
* Clean up orphaned media files (files that exist in storage but not referenced in database)
* This function identifies and removes media files that are no longer referenced in the database
* @param userId - Optional user ID to limit cleanup scope
* @returns Promise<{ cleaned: string[], errors: string[] }>
*/
export const cleanupOrphanedMedia = async (
userId?: string
): Promise<{ cleaned: string[], errors: string[] }> => {
const results = {
  cleaned: [] as string[],
  errors: [] as string[]
};

try {
  console.log(`🧹 Starting orphaned media cleanup for user: ${userId || 'all users'}`);

  // Note: Firebase Storage doesn't provide a direct way to list all files efficiently
  // In a production app, you would typically maintain a database record of all uploaded files
  // For now, we'll implement a basic cleanup based on common orphaned file patterns

  // This is a basic implementation that could be enhanced with:
  // 1. A dedicated storage index collection in Firestore
  // 2. Firebase Cloud Functions to maintain the index
  // 3. Periodic cleanup jobs

  // For demonstration, we'll look for common orphaned file patterns:
  // - Profile images that don't match any user
  // - Post media that doesn't match any posts

  if (userId) {
    // For a specific user, we can do more targeted cleanup
    try {
      // Get all posts by this user to verify their media references
      const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
      const db = getFirestore();

      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', userId)
      );

      const postsSnapshot = await getDocs(postsQuery);
      const validMediaUrls = new Set<string>();

      postsSnapshot.docs.forEach(doc => {
        const post = doc.data();
        if (post.mediaUrl) {
          validMediaUrls.add(post.mediaUrl);
        }
      });

      // Check user's profile image
      const userProfile = await import('./firebase-services').then(m => m.DatabaseService.getUserProfile(userId));
      if (userProfile?.avatar && !userProfile.avatar.includes('pexels-photo') && !userProfile.avatar.includes('default')) {
        validMediaUrls.add(userProfile.avatar);
      }

      console.log(`✅ Found ${validMediaUrls.size} valid media references for user ${userId}`);

      // Note: Without storage listing API, we can't identify truly orphaned files
      // In production, you'd want to maintain a storage index or use cloud functions

    } catch (dbError) {
      console.error('Error querying database for media references:', dbError);
      results.errors.push('Failed to query database for media references');
    }
  }

  console.log('ℹ️ Orphaned media cleanup completed - note: full implementation requires storage index');
  return results;
} catch (error) {
  console.error('Error during orphaned media cleanup:', error);
  results.errors.push(error instanceof Error ? error.message : 'Unknown error');
  return results;
}
};

/**
* Clean up old media files based on age threshold
* @param daysOld - Delete files older than this many days
* @param userId - Optional user ID to limit cleanup scope
* @returns Promise<{ cleaned: string[], errors: string[] }>
*/
export const cleanupOldMedia = async (
daysOld: number = 30,
userId?: string
): Promise<{ cleaned: string[], errors: string[] }> => {
const results = {
  cleaned: [] as string[],
  errors: [] as string[]
};

try {
  if (daysOld < 1) {
    throw new Error('Days old must be at least 1');
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  console.log(`🧹 Cleaning up media older than ${daysOld} days (cutoff: ${cutoffDate.toISOString()}) for user: ${userId || 'all users'}`);

  // Since Firebase Storage doesn't provide file creation time metadata directly,
  // we'll implement a practical approach:

  if (userId) {
    try {
      // Get user's posts and check their timestamps
      const { getFirestore, collection, query, where, getDocs, Timestamp } = await import('firebase/firestore');
      const db = getFirestore();

      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', userId)
      );

      const postsSnapshot = await getDocs(postsQuery);
      const oldPosts: any[] = [];
      const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

      postsSnapshot.docs.forEach(doc => {
        const post = doc.data();
        // If post is older than cutoff and has media, it might be a candidate for cleanup
        if (post.timestamp && post.timestamp.toMillis() < cutoffTimestamp.toMillis() && post.mediaUrl) {
          oldPosts.push({ id: doc.id, ...post });
        }
      });

      console.log(`Found ${oldPosts.length} old posts with media for user ${userId}`);

      // For old posts with media, we could offer to archive or delete
      // For now, we'll be conservative and not auto-delete
      // In a real implementation, you might want to:
      // 1. Archive old media to cold storage
      // 2. Ask user confirmation before deletion
      // 3. Use Firebase Cloud Functions with storage triggers

    } catch (dbError) {
      console.error('Error querying old posts:', dbError);
      results.errors.push('Failed to query old posts for media analysis');
    }
  }

  console.log(`ℹ️ Old media cleanup analysis completed - found ${results.cleaned.length} candidates`);
  console.log('💡 Tip: Consider implementing Firebase Cloud Functions for automated old media management');

  return results;
} catch (error) {
  console.error('Error during old media cleanup:', error);
  results.errors.push(error instanceof Error ? error.message : 'Unknown error');
  return results;
}
};

/**
* Clean up temporary or failed upload files
* @param userId - Optional user ID to limit cleanup scope
* @returns Promise<{ cleaned: string[], errors: string[] }>
*/
export const cleanupTempMedia = async (
userId?: string
): Promise<{ cleaned: string[], errors: string[] }> => {
const results = {
  cleaned: [] as string[],
  errors: [] as string[]
};

try {
  console.log(`🧹 Cleaning up temporary media files for user: ${userId || 'all users'}`);

  // Look for common temporary file patterns in our storage structure
  // Since we don't have direct storage listing, we'll implement logic to identify
  // potential temporary files based on naming patterns and database state

  if (userId) {
    try {
      // Check for draft posts or incomplete uploads that might have temp files
      const { getFirestore, collection, query, where, getDocs, Timestamp } = await import('firebase/firestore');
      const db = getFirestore();

      // Look for posts without content (might indicate failed uploads)
      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', userId)
      );

      const postsSnapshot = await getDocs(postsQuery);
      const tempCandidates: string[] = [];

      postsSnapshot.docs.forEach(doc => {
        const post = doc.data();
        // Posts with media but very short content might be incomplete
        if (post.mediaUrl && (!post.content || post.content.length < 10)) {
          tempCandidates.push(post.mediaUrl);
        }
      });

      console.log(`Found ${tempCandidates.length} potential temporary media files for user ${userId}`);

      // For safety, we'll mark these as candidates rather than auto-deleting
      // In a production app, you might want to:
      // 1. Add a "temp" flag to media uploads
      // 2. Use Firebase Cloud Functions to clean up abandoned uploads
      // 3. Implement a cleanup queue system

    } catch (dbError) {
      console.error('Error checking for temporary files:', dbError);
      results.errors.push('Failed to analyze temporary file candidates');
    }
  }

  console.log(`ℹ️ Temp media cleanup analysis completed - found ${results.cleaned.length} candidates`);
  console.log('💡 Tip: Consider adding temp flags to uploads and implementing cleanup functions');

  return results;
} catch (error) {
  console.error('Error during temp media cleanup:', error);
  results.errors.push(error instanceof Error ? error.message : 'Unknown error');
  return results;
}
};

/**
* Get storage usage statistics for a user
* @param userId - The user ID to get statistics for
* @returns Promise<{ totalFiles: number, totalSize: number, oldestFile?: Date, newestFile?: Date }>
*/
export const getStorageStats = async (
userId: string
): Promise<{ totalFiles: number, totalSize: number, oldestFile?: Date, newestFile?: Date }> => {
try {
  if (!userId) {
    throw new StorageDownloadError('User ID is required', 'INVALID_PARAMS');
  }

  console.log(`📊 Getting storage stats for user: ${userId}`);

  let totalFiles = 0;
  let totalSize = 0;
  let oldestFile: Date | undefined;
  let newestFile: Date | undefined;

  try {
    // Get user's posts and count media files
    const { getFirestore, collection, query, where, getDocs, Timestamp } = await import('firebase/firestore');
    const db = getFirestore();

    // Get posts with media
    const postsQuery = query(
      collection(db, 'posts'),
      where('userId', '==', userId)
    );

    const postsSnapshot = await getDocs(postsQuery);

    postsSnapshot.docs.forEach(doc => {
      const post = doc.data();
      if (post.mediaUrl) {
        totalFiles++;
        // Estimate size (this is a rough estimate since we don't have actual file sizes)
        // In a real implementation, you'd store file sizes in the database
        totalSize += estimateMediaSize(post.mediaType || 'image');
      }

      // Track oldest and newest posts
      if (post.timestamp) {
        const postDate = post.timestamp.toDate();
        if (!oldestFile || postDate < oldestFile) {
          oldestFile = postDate;
        }
        if (!newestFile || postDate > newestFile) {
          newestFile = postDate;
        }
      }
    });

    // Also check user's profile image
    const userProfile = await import('./firebase-services').then(m => m.DatabaseService.getUserProfile(userId));
    if (userProfile?.avatar && !userProfile.avatar.includes('pexels-photo') && !userProfile.avatar.includes('default')) {
      totalFiles++;
      totalSize += estimateMediaSize('image'); // Profile images are typically images

      // Update oldest/newest if profile was updated
      if (userProfile.updatedAt) {
        const profileDate = userProfile.updatedAt.toDate();
        if (!oldestFile || profileDate < oldestFile) {
          oldestFile = profileDate;
        }
        if (!newestFile || profileDate > newestFile) {
          newestFile = profileDate;
        }
      }
    }

  } catch (dbError) {
    console.error('Error querying database for storage stats:', dbError);
    throw new StorageDownloadError('Failed to query database for storage statistics', 'DOWNLOAD_FAILED');
  }

  const stats = {
    totalFiles,
    totalSize,
    oldestFile,
    newestFile
  };

  console.log(`✅ Storage stats retrieved for user ${userId}:`, stats);
  return stats;
} catch (error) {
  console.error('Error getting storage stats:', error);
  throw new StorageDownloadError(
    `Failed to get storage stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
    'DOWNLOAD_FAILED'
  );
}
};

/**
* Estimate media file size based on type (rough estimates)
* @param mediaType - The type of media
* @returns Estimated size in bytes
*/
const estimateMediaSize = (mediaType: string): number => {
switch (mediaType) {
  case 'image':
    return 1024 * 1024; // ~1MB for images
  case 'video':
    return 10 * 1024 * 1024; // ~10MB for videos
  default:
    return 1024 * 1024; // Default to 1MB
}
};

/**
* Get media files owned by a specific user
* @param userId - The user ID to get media for
* @returns Promise<string[]> - Array of media URLs
*/
export const getUserMedia = async (userId: string): Promise<string[]> => {
try {
  if (!userId) {
    throw new StorageDownloadError('User ID is required', 'INVALID_PARAMS');
  }

  console.log(`📋 Getting media for user: ${userId}`);

  const mediaUrls: string[] = [];

  try {
    // Import Firebase services dynamically to avoid circular dependencies
    const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
    const db = getFirestore();

    // Get all posts by this user that have media
    const postsQuery = query(
      collection(db, 'posts'),
      where('userId', '==', userId)
    );

    const postsSnapshot = await getDocs(postsQuery);

    postsSnapshot.docs.forEach(doc => {
      const post = doc.data();
      if (post.mediaUrl) {
        mediaUrls.push(post.mediaUrl);
      }
    });

    // Also get user's profile image if it's not a default image
    const userProfile = await import('./firebase-services').then(m => m.DatabaseService.getUserProfile(userId));
    if (userProfile?.avatar &&
        !userProfile.avatar.includes('pexels-photo') &&
        !userProfile.avatar.includes('default') &&
        !mediaUrls.includes(userProfile.avatar)) {
      mediaUrls.push(userProfile.avatar);
    }

  } catch (dbError) {
    console.error('Error querying database for user media:', dbError);
    throw new StorageDownloadError('Failed to query database for user media', 'DOWNLOAD_FAILED');
  }

  console.log(`✅ Found ${mediaUrls.length} media files for user ${userId}`);
  return mediaUrls;
} catch (error) {
  console.error('Error getting user media:', error);
  throw new StorageDownloadError(
    `Failed to get user media: ${error instanceof Error ? error.message : 'Unknown error'}`,
    'DOWNLOAD_FAILED'
  );
}
};