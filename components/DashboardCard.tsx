import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useDarkMode } from '@/hooks/useDarkMode';
import { getColors } from '@/constants/Colors';

interface DashboardCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function DashboardCard({ children, style }: DashboardCardProps) {
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);
  
  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
  },
});