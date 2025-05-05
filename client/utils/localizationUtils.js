// src/utils/localizationUtils.js
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

// Import language translation files
import en from '../locales/en.json';
import tr from '../locales/tr.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';
import ja from '../locales/ja.json';

// Create i18n instance
const i18n = new I18n({
  en,
  tr,
  es,
  fr,
  de,
  ja
});

// Set the locale from AsyncStorage or device
export const initializeLocalization = async () => {
  try {
    // Try to get saved language preference
    const savedLanguage = await AsyncStorage.getItem('@language');

    if (savedLanguage) {
      i18n.locale = savedLanguage;
    } else {
      // Fall back to device locale
      const deviceLocale = Localization.locale.split('-')[0];

      // Check if we support the device locale
      if (Object.keys(i18n.translations).includes(deviceLocale)) {
        i18n.locale = deviceLocale;
      } else {
        // Default to English
        i18n.locale = 'en';
      }

      // Save the selected locale
      await AsyncStorage.setItem('@language', i18n.locale);
    }

    // Set fallback language
    i18n.defaultLocale = 'en';
    i18n.enableFallback = true;

    return i18n.locale;
  } catch (error) {
    console.error('Error initializing localization:', error);
    i18n.locale = 'en';
    i18n.defaultLocale = 'en';
    i18n.enableFallback = true;
    return 'en';
  }
};

// Change language
export const changeLanguage = async (languageCode) => {
  try {
    i18n.locale = languageCode;
    await AsyncStorage.setItem('@language', languageCode);
    return true;
  } catch (error) {
    console.error('Error changing language:', error);
    return false;
  }
};

// Get current locale
export const getCurrentLocale = () => {
  return i18n.locale;
};

// Get supported languages
export const getSupportedLanguages = () => {
  return [
    { code: 'en', name: 'English' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' }
  ];
};

// Custom hook for localization
export const useLocalization = () => {
  const [initialized, setInitialized] = useState(false);
  const [locale, setLocale] = useState(i18n.locale || 'en');

  useEffect(() => {
    const init = async () => {
      const initialLocale = await initializeLocalization();
      setLocale(initialLocale);
      setInitialized(true);
    };

    init();
  }, []);

  const changeAppLanguage = async (languageCode) => {
    const success = await changeLanguage(languageCode);
    if (success) {
      setLocale(languageCode);
    }
    return success;
  };

  const translate = (key, options = {}) => {
    return i18n.t(key, options);
  };

  return {
    initialized,
    locale,
    translate,
    changeLanguage: changeAppLanguage,
    supportedLanguages: getSupportedLanguages()
  };
};

// Export the translate function
export const t = (key, options = {}) => {
  return i18n.t(key, options);
};