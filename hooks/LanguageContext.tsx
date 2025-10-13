import React, { createContext, useContext, useEffect, useState } from 'react';
import { getItem, setItem } from '@/lib/storage';
import { Language, TranslationKey, getTranslation } from '../lib/translations';

// Language Context Interface
interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (language: Language) => Promise<void>;
  t: (key: TranslationKey, params?: Record<string, any>) => string;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language Provider Props
interface LanguageProviderProps {
  children: React.ReactNode;
}

// Language Provider Component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  useEffect(() => {
    console.log('🔤 LANGUAGE DEBUG: LanguageProvider mounted, starting language load...');
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      console.log('🔤 LANGUAGE DEBUG: Loading saved language from AsyncStorage...');
      const savedLanguage = await getItem('language');
      console.log('🔤 LANGUAGE DEBUG: Raw saved language value:', savedLanguage);

      if (savedLanguage && savedLanguage in ['en', 'zh_CN', 'zh_TW', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh-Hant']) {
        const validLanguage = savedLanguage as Language;
        console.log('🔤 LANGUAGE DEBUG: Valid saved language found:', validLanguage);
        setCurrentLanguage(validLanguage);
        console.log('🔤 LANGUAGE DEBUG: Language state updated to:', validLanguage);
      } else {
        console.log('🔤 LANGUAGE DEBUG: No valid saved language found, using default:', currentLanguage);
      }
    } catch (error) {
      console.error('🔤 LANGUAGE DEBUG: Error loading saved language:', error);
    }
  };

  const changeLanguage = async (language: Language) => {
    try {
      console.log('🔤 LANGUAGE DEBUG: Starting language change to:', language);
      console.log('🔤 LANGUAGE DEBUG: Saving language to AsyncStorage...');

      await setItem('language', language);

      console.log('🔤 LANGUAGE DEBUG: Language saved to AsyncStorage successfully');
      console.log('🔤 LANGUAGE DEBUG: Updating currentLanguage state from', currentLanguage, 'to', language);

      setCurrentLanguage(language);

      console.log('🔤 LANGUAGE DEBUG: Language change completed successfully');
    } catch (error) {
      console.error('🔤 LANGUAGE DEBUG: Error saving language:', error);
      console.error('🔤 LANGUAGE DEBUG: Language change failed for:', language);
    }
  };

  const t = (key: string, params?: Record<string, any>): string => {
    console.log('🔤 LANGUAGE DEBUG: Translation requested for key:', key, 'in language:', currentLanguage, 'params:', params);

    // Map language codes to available translation keys
    let translationLanguage = currentLanguage;
    // Both zh_CN and zh_TW are valid translation keys, so no mapping needed

    const translation = getTranslation(translationLanguage, key, params);
    console.log('🔤 LANGUAGE DEBUG: Translation result for', key, ':', translation);

    if (translation === key) {
      console.warn('🔤 LANGUAGE DEBUG: Translation key not found, using key as fallback:', key);
    }

    return translation;
  };

  const contextValue: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Export the context for advanced use cases
export { LanguageContext };