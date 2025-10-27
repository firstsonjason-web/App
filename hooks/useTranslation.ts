import { useLanguage } from './LanguageContext';

// Custom hook for translations
export const useTranslation = () => {
  const { t } = useLanguage();

  return { t };
};