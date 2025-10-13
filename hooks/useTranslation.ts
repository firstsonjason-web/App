import { useLanguage } from './LanguageContext';

// Custom hook for translations
export const useTranslation = () => {
  console.log('🔤 LANGUAGE DEBUG: useTranslation hook called');
  const { t } = useLanguage();
  console.log('🔤 LANGUAGE DEBUG: useTranslation hook returning translation function');

  return { t };
};

console.log('🔤 LANGUAGE DEBUG: useTranslation.ts loaded');