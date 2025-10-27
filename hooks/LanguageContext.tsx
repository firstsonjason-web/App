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
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await getItem('language');

      if (savedLanguage && savedLanguage in ['en', 'zh_CN', 'zh_TW', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh-Hant']) {
        const validLanguage = savedLanguage as Language;
        setCurrentLanguage(validLanguage);
      } else {
      }
    } catch (error) {
    }
  };

  const changeLanguage = async (language: Language) => {
    try {
      await setItem('language', language);

      setCurrentLanguage(language);
    } catch (error) {
    }
  };

  const t = (key: string, params?: Record<string, any>): string => {
    // Map language codes to available translation keys
    let translationLanguage = currentLanguage;
    // Both zh_CN and zh_TW are valid translation keys, so no mapping needed

    const translation = getTranslation(translationLanguage, key, params);

    if (translation === key) {
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