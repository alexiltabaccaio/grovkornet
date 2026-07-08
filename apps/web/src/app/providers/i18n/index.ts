import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import it from './locales/it.json';

const getInitialLanguage = (): string => {
  const defaultLanguage = 'en';
  const supportedLanguages = ['en', 'it'];
  
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )grovkornet-lang=([^;]+)'));
    if (match && supportedLanguages.includes(match[2])) {
      return match[2];
    }
    const local = localStorage.getItem('grovkornet-lang');
    if (local && supportedLanguages.includes(local)) {
      return local;
    }
    
    // Fallback to browser language
    if (navigator.language) {
      const browserLang = navigator.language.split('-')[0];
      if (supportedLanguages.includes(browserLang)) {
        return browserLang;
      }
    }
  }
  return defaultLanguage;
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      it: { translation: it },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })
  .catch(error => {
    console.error('Failed to initialize i18n', error);
  });

export default i18n;
