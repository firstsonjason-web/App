// Simple test script to verify debug logging functionality
console.log('🔤 LANGUAGE DEBUG: Testing debug logging implementation...');

// Test the translation function directly
const fs = require('fs');
const path = require('path');

// Read the translations file
const translationsPath = path.join(__dirname, 'lib', 'translations.ts');
const translationsContent = fs.readFileSync(translationsPath, 'utf8');

console.log('🔤 LANGUAGE DEBUG: Translations file loaded successfully');
console.log('🔤 LANGUAGE DEBUG: File size:', translationsContent.length, 'characters');

// Check if our debug logs are present in the file
if (translationsContent.includes('🔤 LANGUAGE DEBUG:')) {
  console.log('✅ SUCCESS: Debug logging statements found in translations.ts');
} else {
  console.log('❌ ERROR: Debug logging statements not found in translations.ts');
}

// Check if our debug logs are present in the useTranslation hook
const useTranslationPath = path.join(__dirname, 'hooks', 'useTranslation.ts');
let useTranslationContent = '';
let useTranslationExists = false;

try {
  useTranslationContent = fs.readFileSync(useTranslationPath, 'utf8');
  useTranslationExists = true;
} catch (error) {
  console.log('⚠️  WARNING: useTranslation.ts file does not exist');
  useTranslationExists = false;
}

if (useTranslationExists) {
  if (useTranslationContent.includes('🔤 LANGUAGE DEBUG:')) {
    console.log('✅ SUCCESS: Debug logging statements found in useTranslation.ts');
  } else {
    console.log('❌ ERROR: Debug logging statements not found in useTranslation.ts');
  }
} else {
  console.log('ℹ️  INFO: Skipping useTranslation.ts check - file does not exist');
}

// Check if our debug logs are present in the profile component
const profilePath = path.join(__dirname, 'app', '(tabs)', 'profile.tsx');
const profileContent = fs.readFileSync(profilePath, 'utf8');

if (profileContent.includes('🔤 LANGUAGE DEBUG:')) {
  console.log('✅ SUCCESS: Debug logging statements found in profile.tsx');
} else {
  console.log('❌ ERROR: Debug logging statements not found in profile.tsx');
}

console.log('🔤 LANGUAGE DEBUG: Debug logging implementation test completed');