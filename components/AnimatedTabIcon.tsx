import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring
} from 'react-native-reanimated';
import { useDarkMode } from '@/hooks/useDarkMode';
import { getColors } from '@/constants/Colors';

interface AnimatedTabIconProps {
  children: React.ReactNode;
  focused: boolean;
}

export function AnimatedTabIcon({ children, focused }: AnimatedTabIconProps) {
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 375;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(focused ? 1.15 : 1, {
            damping: 12,
            stiffness: 200,
          }),
        },
      ],
      opacity: withSpring(focused ? 1 : 0.6, {
        damping: 15,
        stiffness: 150,
      }),
    };
  });

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(focused ? 1 : 0, {
        damping: 15,
        stiffness: 150,
      }),
      transform: [
        {
          scale: withSpring(focused ? 1 : 0.5, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
    };
  });

  const containerSize = isSmallDevice ? 36 : 40;
  const backgroundSize = isSmallDevice ? 32 : 36;
  const borderRadius = isSmallDevice ? 16 : 18;

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }]}>
      <Animated.View
        style={[
          styles.background,
          {
            width: backgroundSize,
            height: backgroundSize,
            borderRadius,
            backgroundColor: isDarkMode 
              ? 'rgba(245, 245, 247, 0.12)' 
              : 'rgba(26, 26, 30, 0.08)',
          },
          backgroundStyle,
        ]}
      />
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  background: {
    position: 'absolute',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});

