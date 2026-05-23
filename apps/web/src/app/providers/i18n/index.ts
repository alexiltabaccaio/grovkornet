import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import it from './locales/it.json';

const getInitialLanguage = (): string => {
  const defaultLanguage = 'en';
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )grovkornet-lang=([^;]+)'));
    if (match && ['en', 'it'].includes(match[2])) {
      return match[2];
    }
    const local = localStorage.getItem('grovkornet-lang');
    if (local && ['en', 'it'].includes(local)) {
      return local;
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
