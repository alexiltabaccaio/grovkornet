import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { logger } from '@shared/lib/logger';

import en from './locales/en.json';
import it from './locales/it.json';

const deviceLanguage = getLocales()[0]?.languageCode || 'en';
const supportedLanguages = ['en', 'it'];
const defaultLanguage = supportedLanguages.includes(deviceLanguage) ? deviceLanguage : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en,
      it,
    },
    lng: defaultLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    compatibilityJSON: 'v4',
  })
  .catch(error => {
    logger.error('i18n', 'Failed to initialize i18n', error);
  });
