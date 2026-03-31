import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import hi from './locales/hi';
import en from './locales/en';

export const LANGUAGES = [
  { code: 'hi', label: 'हिंदी', englishLabel: 'Hindi' },
  { code: 'en', label: 'English', englishLabel: 'English' },
];

function detectLocale(): string {
  const deviceLang = Localization.getLocales()?.[0]?.languageCode ?? 'hi';
  return ['hi', 'en'].includes(deviceLang) ? deviceLang : 'hi';
}

i18n.use(initReactI18next).init({
  resources: {
    hi: { translation: hi },
    en: { translation: en },
  },
  lng: detectLocale(),
  fallbackLng: 'hi',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export default i18n;
