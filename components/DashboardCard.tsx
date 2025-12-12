import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDarkMode } from '@/hooks/useDarkMode';
import { getColors } from '@/constants/Colors';

interface DashboardCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  /**
   * Override gradient colors if desired.
   */
  gradientColors?: [string, string];
}

export function DashboardCard({
  children,
  style,
  elevated = true,
  gradientColors,
}: DashboardCardProps) {
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);
  const bg = gradientColors || [colors.gradientStart, colors.gradientEnd];
  
  return (
    <View 
      style={[
        styles.card,
        { 
          borderColor: colors.border,
          shadowOpacity: elevated ? (isDarkMode ? 0.4 : 0.06) : 0,
        }, 
        style
      ]}
    >
      <LinearGradient
        colors={bg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  gradient: {
    flex: 1,
    borderRadius: 20,
  },
});