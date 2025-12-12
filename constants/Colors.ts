export const Colors = {
  light: {
    background: '#F8F8FA',
    cardBackground: '#FFFFFF',
    text: '#1A1A1E',
    textSecondary: '#5C5C66',
    textTertiary: '#9898A3',
    border: '#E8E8ED',
    primary: '#3B3B44',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    gradientStart: '#F8F8FA',
    gradientEnd: '#EEEEEF',
    accent: '#4A4A54',
  },
  dark: {
    background: '#0E0E10',
    cardBackground: '#1A1A1E',
    text: '#F5F5F7',
    textSecondary: '#A5A5AE',
    textTertiary: '#6E6E78',
    border: '#2A2A32',
    primary: '#F5F5F7',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    gradientStart: '#0E0E10',
    gradientEnd: '#1A1A1E',
    accent: '#A5A5AE',
  },
};

export const getColors = (isDarkMode: boolean) => {
  return isDarkMode ? Colors.dark : Colors.light;
};