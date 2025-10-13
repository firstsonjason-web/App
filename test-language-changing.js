// Test script to debug language changing functionality
const fs = require('fs');
const path = require('path');

// Mock AsyncStorage for testing
const mockAsyncStorage = new Map();

const AsyncStorage = {
  getItem: async (key) => {
    console.log('🔤 LANGUAGE DEBUG: AsyncStorage.getItem called for key:', key);
    const value = mockAsyncStorage.get(key);
    console.log('🔤 LANGUAGE DEBUG: AsyncStorage.getItem result:', value);
    return value;
  },
  setItem: async (key, value) => {
    console.log('🔤 LANGUAGE DEBUG: AsyncStorage.setItem called for key:', key, 'value:', value);
    mockAsyncStorage.set(key, value);
    console.log('🔤 LANGUAGE DEBUG: AsyncStorage.setItem completed');
  },
  multiRemove: async (keys) => {
    console.log('🔤 LANGUAGE DEBUG: AsyncStorage.multiRemove called for keys:', keys);
    keys.forEach(key => mockAsyncStorage.delete(key));
    console.log('🔤 LANGUAGE DEBUG: AsyncStorage.multiRemove completed');
  }
};

// Mock translations data (simplified version)
const mockTranslations = {
  en: {
    profile: 'Profile',
    languageSettings: 'Language Settings',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel'
  },
  es: {
    profile: 'Perfil',
    languageSettings: 'Configuración de Idioma',
    success: 'Éxito',
    save: 'Guardar',
    cancel: 'Cancelar'
  },
  zh: {
    profile: '个人资料',
    languageSettings: '语言设置',
    success: '成功',
    save: '保存',
    cancel: '取消'
  }
};

// Mock getTranslation function
const getTranslation = (language, key) => {
  console.log('🔤 LANGUAGE DEBUG: getTranslation called for language:', language, 'key:', key);

  const translation = mockTranslations[language]?.[key];
  console.log('🔤 LANGUAGE DEBUG: Translation found in target language:', translation);

  if (translation) {
    console.log('🔤 LANGUAGE DEBUG: Using translation from target language');
    return translation;
  }

  console.log('🔤 LANGUAGE DEBUG: Translation not found in target language, trying English fallback...');
  const englishFallback = mockTranslations.en[key];

  if (englishFallback) {
    console.log('🔤 LANGUAGE DEBUG: English fallback found:', englishFallback);
    console.log('🔤 LANGUAGE DEBUG: Using English fallback for key:', key);
    return englishFallback;
  }

  console.warn('🔤 LANGUAGE DEBUG: No translation found in any language, returning key as fallback:', key);
  console.warn('🔤 LANGUAGE DEBUG: Missing translation for key:', key, 'in language:', language);
  return key;
};

// Test the language changing process
async function testLanguageChanging() {
  console.log('🔤 LANGUAGE DEBUG: Starting language changing test...\n');

  try {
    // Step 1: Initialize with default language (English)
    console.log('🔤 LANGUAGE DEBUG: === STEP 1: Initialize with default language ===');
    let currentLanguage = 'en';
    console.log('🔤 LANGUAGE DEBUG: Initial language set to:', currentLanguage);

    // Step 2: Load saved language from AsyncStorage
    console.log('\n🔤 LANGUAGE DEBUG: === STEP 2: Load saved language from AsyncStorage ===');
    const savedLanguage = await AsyncStorage.getItem('language');
    console.log('🔤 LANGUAGE DEBUG: Raw saved language value:', savedLanguage);

    if (savedLanguage && ['en', 'zh', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko'].includes(savedLanguage)) {
      currentLanguage = savedLanguage;
      console.log('🔤 LANGUAGE DEBUG: Valid saved language found:', currentLanguage);
    } else {
      console.log('🔤 LANGUAGE DEBUG: No valid saved language found, using default:', currentLanguage);
    }

    // Step 3: Test translation loading
    console.log('\n🔤 LANGUAGE DEBUG: === STEP 3: Test translation loading ===');
    const testKeys = ['profile', 'languageSettings', 'success'];
    testKeys.forEach(key => {
      console.log(`🔤 LANGUAGE DEBUG: Testing translation for key: ${key}`);
      const translation = getTranslation(currentLanguage, key);
      console.log(`🔤 LANGUAGE DEBUG: Translation result: ${translation}`);
    });

    // Step 4: Change language to Spanish
    console.log('\n🔤 LANGUAGE DEBUG: === STEP 4: Change language to Spanish ===');
    const newLanguage = 'es';
    console.log('🔤 LANGUAGE DEBUG: Starting language change to:', newLanguage);

    // Save to AsyncStorage
    await AsyncStorage.setItem('language', newLanguage);
    console.log('🔤 LANGUAGE DEBUG: Language saved to AsyncStorage successfully');

    // Update current language
    currentLanguage = newLanguage;
    console.log('🔤 LANGUAGE DEBUG: Current language updated to:', currentLanguage);

    // Step 5: Test translation loading with new language
    console.log('\n🔤 LANGUAGE DEBUG: === STEP 5: Test translation loading with new language ===');
    testKeys.forEach(key => {
      console.log(`🔤 LANGUAGE DEBUG: Testing translation for key: ${key} in ${currentLanguage}`);
      const translation = getTranslation(currentLanguage, key);
      console.log(`🔤 LANGUAGE DEBUG: Translation result: ${translation}`);
    });

    // Step 6: Test fallback behavior
    console.log('\n🔤 LANGUAGE DEBUG: === STEP 6: Test fallback behavior ===');
    const fallbackKey = 'nonexistent_key';
    console.log(`🔤 LANGUAGE DEBUG: Testing fallback for non-existent key: ${fallbackKey}`);
    const fallbackResult = getTranslation(currentLanguage, fallbackKey);
    console.log(`🔤 LANGUAGE DEBUG: Fallback result: ${fallbackResult}`);

    // Step 7: Verify AsyncStorage persistence
    console.log('\n🔤 LANGUAGE DEBUG: === STEP 7: Verify AsyncStorage persistence ===');
    const persistedLanguage = await AsyncStorage.getItem('language');
    console.log('🔤 LANGUAGE DEBUG: Persisted language in AsyncStorage:', persistedLanguage);

    if (persistedLanguage === newLanguage) {
      console.log('✅ SUCCESS: Language change persisted correctly');
    } else {
      console.log('❌ ERROR: Language change not persisted correctly');
    }

    console.log('\n🔤 LANGUAGE DEBUG: === LANGUAGE CHANGING TEST COMPLETED ===');

  } catch (error) {
    console.error('🔤 LANGUAGE DEBUG: Error during language changing test:', error);
  }
}

// Run the test
testLanguageChanging().then(() => {
  console.log('\n🔤 LANGUAGE DEBUG: Test execution completed');
});