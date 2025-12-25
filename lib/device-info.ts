import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'device_unique_id';

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  platform: 'ios' | 'android' | 'web';
}

/**
 * Gets or creates a unique device ID and returns device information
 */
export async function getDeviceInfo(): Promise<DeviceInfo> {
  try {
    // Try to get existing device ID
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      // Generate a unique device ID
      // Use device ID if available, otherwise generate UUID-like string
      const deviceModel = Device.modelName || 'Unknown';
      const deviceYear = Device.deviceYearClass || new Date().getFullYear();
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      deviceId = `${Platform.OS}_${deviceModel}_${deviceYear}_${timestamp}_${random}`;
      
      // Store it for future use
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    // Get device name
    let deviceName = Device.deviceName || Device.modelName || 'Unknown Device';
    if (Platform.OS === 'ios') {
      deviceName = Device.deviceName || Device.modelName || 'iPhone';
    } else if (Platform.OS === 'android') {
      deviceName = Device.deviceName || Device.modelName || 'Android Device';
    } else {
      deviceName = 'Web Browser';
    }

    return {
      deviceId,
      deviceName,
      platform: Platform.OS as 'ios' | 'android' | 'web',
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    // Fallback device info
    return {
      deviceId: `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      deviceName: Platform.OS === 'ios' ? 'iPhone' : Platform.OS === 'android' ? 'Android Device' : 'Web Browser',
      platform: Platform.OS as 'ios' | 'android' | 'web',
    };
  }
}

