import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, TranslationKey, getTranslation } from '@/lib/translations';

export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage && savedLanguage in ['en', 'zh', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko']) {
        setCurrentLanguage(savedLanguage as Language);
      }
    } catch (error) {
      console.log('Error loading saved language:', error);
    }
  };

  const changeLanguage = async (language: Language) => {
    try {
      await AsyncStorage.setItem('language', language);
      setCurrentLanguage(language);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  };

  const t = (key: TranslationKey): string => {
    return getTranslation(currentLanguage, key);
  };

  return {
    currentLanguage,
    changeLanguage,
    t,
  };
};