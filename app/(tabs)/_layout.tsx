import { Tabs } from 'expo-router';
import { Chrome as Home, TrendingUp, Users, User, MessageCircle, Trophy } from 'lucide-react-native';
import { useLanguage } from '@/hooks/LanguageContext';
import { useDarkMode } from '@/hooks/useDarkMode';
import { getColors } from '@/constants/Colors';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useCallback, useMemo } from 'react';
import { AnimatedTabIcon } from '@/components/AnimatedTabIcon';

export default function TabLayout() {
  const { t } = useLanguage();
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  
  // Adjust sizes for smaller devices
  // With 7 tabs, we need ~50-55px per tab for labels, so hide on devices < 400px
  const isSmallDevice = width < 400;
  const showLabels = !isSmallDevice;
  const iconSize = isSmallDevice ? 22 : 22;
  const fontSize = isSmallDevice ? 9 : 10;
  const letterSpacing = isSmallDevice ? 0.2 : 0.3;
  // Reduce height when labels are hidden
  const tabBarHeight = showLabels ? 65 : 55;
  const paddingTop = isSmallDevice ? 8 : 8;
  const paddingBottom = isSmallDevice ? 8 : 8;

  const handleTabPress = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const tabBarStyle = useMemo(() => ({
    backgroundColor: colors.cardBackground,
    borderTopWidth: 0,
    paddingTop,
    paddingBottom: Math.max(insets.bottom, paddingBottom),
    height: tabBarHeight + Math.max(insets.bottom, paddingBottom),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: isDarkMode ? 0.5 : 0.12,
    shadowRadius: 20,
    elevation: 25,
    position: 'absolute' as const,
  }), [colors.cardBackground, paddingTop, paddingBottom, insets.bottom, tabBarHeight, isDarkMode]);

  const tabBarLabelStyle = useMemo(() => ({
    fontSize,
    fontWeight: '600' as const,
    marginTop: 2,
    marginBottom: 0,
    letterSpacing,
  }), [fontSize, letterSpacing]);

  const tabBarItemStyle = useMemo(() => ({
    paddingVertical: isSmallDevice ? 4 : 6,
    borderRadius: 14,
    marginHorizontal: isSmallDevice ? 1 : 3,
  }), [isSmallDevice]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle,
        tabBarLabelStyle,
        tabBarItemStyle,
        tabBarIconStyle: {
          marginTop: showLabels ? 2 : 0,
        },
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: showLabels,
      }}
      screenListeners={{
        tabPress: handleTabPress,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ size, color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Home 
                size={iconSize} 
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="rankings"
        options={{
          title: t('rankings'),
          tabBarIcon: ({ size, color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Trophy 
                size={iconSize} 
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: t('activities'),
          tabBarIcon: ({ size, color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Users 
                size={iconSize} 
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: t('friends'),
          tabBarIcon: ({ size, color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <MessageCircle 
                size={iconSize} 
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t('progress'),
          tabBarIcon: ({ size, color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <TrendingUp 
                size={iconSize} 
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: t('communities'),
          tabBarIcon: ({ size, color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Users 
                size={iconSize} 
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ size, color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <User 
                size={iconSize} 
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </AnimatedTabIcon>
          ),
        }}
      />
    </Tabs>
  );
}