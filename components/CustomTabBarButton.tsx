import React from 'react';
import { TouchableOpacity, View, StyleSheet, Platform } from 'react-native';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';
import { useDarkMode } from '@/hooks/useDarkMode';
import { getColors } from '@/constants/Colors';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function CustomTabBarButton(props: BottomTabBarButtonProps) {
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);
  const { children, onPress, accessibilityState } = props;
  const focused = accessibilityState?.selected ?? false;

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(focused ? 1 : 0, {
        damping: 15,
        stiffness: 150,
      }),
      transform: [
        {
          scale: withSpring(focused ? 1 : 0.8, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(focused ? 1.1 : 1, {
            damping: 12,
            stiffness: 200,
          }),
        },
      ],
    };
  });

  return (
    <AnimatedTouchable
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.button, animatedIconStyle]}
    >
      <Animated.View
        style={[
          styles.backgroundIndicator,
          {
            backgroundColor: isDarkMode 
              ? 'rgba(245, 245, 247, 0.12)' 
              : 'rgba(26, 26, 30, 0.08)',
          },
          animatedBackgroundStyle,
        ]}
      />
      <View style={styles.content}>
        {children}
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backgroundIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});

