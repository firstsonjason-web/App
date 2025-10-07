export const Colors = {
  light: {
    background: '#F8FAFC',
    cardBackground: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
    primary: '#4F46E5',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    gradientStart: '#F8FAFC',
    gradientEnd: '#F1F5F9',
  },
  dark: {
    background: '#0F172A',
    cardBackground: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#64748B',
    border: '#334155',
    primary: '#6366F1',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    gradientStart: '#0F172A',
    gradientEnd: '#1E293B',
  },
};

export const getColors = (isDarkMode: boolean) => {
  return isDarkMode ? Colors.dark : Colors.light;
};