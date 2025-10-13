import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Storage interface for cross-platform compatibility
interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// Storage error types
export class StorageError extends Error {
  constructor(message: string, public code: string, public key?: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export class StorageQuotaExceededError extends StorageError {
  constructor(message: string, key?: string) {
    super(message, 'QUOTA_EXCEEDED', key);
    this.name = 'StorageQuotaExceededError';
  }
}

export class StorageUnavailableError extends StorageError {
  constructor(message: string, key?: string) {
    super(message, 'STORAGE_UNAVAILABLE', key);
    this.name = 'StorageUnavailableError';
  }
}

// Web storage implementation using localStorage
class WebStorage implements Storage {
  public isStorageAvailable(): boolean {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return false;
    }

    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined') {
      throw new StorageUnavailableError('localStorage is not available in this environment', key);
    }

    if (!this.isStorageAvailable()) {
      throw new StorageUnavailableError('localStorage is not available or quota exceeded', key);
    }

    try {
      return localStorage.getItem(key);
    } catch (error) {
      if (error instanceof DOMException) {
        if (error.code === 22 || error.code === 1014 || error.name === 'QuotaExceededError') {
          throw new StorageQuotaExceededError(`Storage quota exceeded for key: ${key}`, key);
        }
        if (error.name === 'SecurityError') {
          throw new StorageUnavailableError('localStorage access denied due to security restrictions', key);
        }
      }
      console.warn('WebStorage getItem error:', error);
      throw new StorageError(`Failed to get item for key: ${key}`, 'GET_FAILED', key);
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined') {
      throw new StorageUnavailableError('localStorage is not available in this environment', key);
    }

    if (!this.isStorageAvailable()) {
      throw new StorageUnavailableError('localStorage is not available or quota exceeded', key);
    }

    try {
      localStorage.setItem(key, value);
    } catch (error) {
      if (error instanceof DOMException) {
        if (error.code === 22 || error.code === 1014 || error.name === 'QuotaExceededError') {
          throw new StorageQuotaExceededError(`Storage quota exceeded for key: ${key}`, key);
        }
        if (error.name === 'SecurityError') {
          throw new StorageUnavailableError('localStorage access denied due to security restrictions', key);
        }
      }
      console.warn('WebStorage setItem error:', error);
      throw new StorageError(`Failed to set item for key: ${key}`, 'SET_FAILED', key);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined') {
      throw new StorageUnavailableError('localStorage is not available in this environment', key);
    }

    if (!this.isStorageAvailable()) {
      throw new StorageUnavailableError('localStorage is not available or quota exceeded', key);
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'SecurityError') {
        throw new StorageUnavailableError('localStorage access denied due to security restrictions', key);
      }
      console.warn('WebStorage removeItem error:', error);
      throw new StorageError(`Failed to remove item for key: ${key}`, 'REMOVE_FAILED', key);
    }
  }
}

// Native storage implementation using AsyncStorage
class NativeStorage implements Storage {
  async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    return AsyncStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    return AsyncStorage.removeItem(key);
  }
}

// Detect platform and create appropriate storage instance
const isWeb = Platform.OS === 'web' || (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined');

// Use web storage for web platforms, AsyncStorage for native platforms
export const storage: Storage = isWeb ? new WebStorage() : new NativeStorage();

// Enhanced storage methods with validation and error handling
export const getItem = async (key: string): Promise<string | null> => {
  if (!key || typeof key !== 'string') {
    throw new StorageError('Invalid key provided', 'INVALID_KEY');
  }

  try {
    return await storage.getItem(key);
  } catch (error) {
    console.error(`Storage getItem failed for key "${key}":`, error);
    throw error;
  }
};

export const setItem = async (key: string, value: string): Promise<void> => {
  if (!key || typeof key !== 'string') {
    throw new StorageError('Invalid key provided', 'INVALID_KEY');
  }

  if (value === null || value === undefined) {
    throw new StorageError('Invalid value provided', 'INVALID_VALUE');
  }

  try {
    await storage.setItem(key, String(value));
  } catch (error) {
    console.error(`Storage setItem failed for key "${key}":`, error);
    throw error;
  }
};

export const removeItem = async (key: string): Promise<void> => {
  if (!key || typeof key !== 'string') {
    throw new StorageError('Invalid key provided', 'INVALID_KEY');
  }

  try {
    await storage.removeItem(key);
  } catch (error) {
    console.error(`Storage removeItem failed for key "${key}":`, error);
    throw error;
  }
};

// Data validation and recovery utilities
export const validateStorageData = <T>(data: string | null, validator: (parsed: any) => parsed is T): T | null => {
  if (!data) return null;

  try {
    const parsed = JSON.parse(data);
    return validator(parsed) ? parsed : null;
  } catch {
    console.warn('Invalid JSON data in storage, returning null');
    return null;
  }
};

export const safeSetItem = async (key: string, value: any): Promise<boolean> => {
  try {
    await setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to safely set item for key "${key}":`, error);
    return false;
  }
};

export const safeGetItem = async <T>(key: string, validator: (parsed: any) => parsed is T): Promise<T | null> => {
  try {
    const data = await getItem(key);
    return validateStorageData(data, validator);
  } catch (error) {
    console.error(`Failed to safely get item for key "${key}":`, error);
    return null;
  }
};

// Storage availability check
export const isStorageAvailable = (): boolean => {
  if (isWeb) {
    return (storage as WebStorage).isStorageAvailable();
  }

  // For AsyncStorage, we assume it's available unless proven otherwise
  return true;
};

// Clear all storage (useful for logout/reset)
export const clearStorage = async (): Promise<boolean> => {
  try {
    if (isWeb) {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.clear();
      }
    } else {
      await AsyncStorage.clear();
    }
    return true;
  } catch (error) {
    console.error('Failed to clear storage:', error);
    return false;
  }
};
