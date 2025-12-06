import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, 
    },
    backend: {
      // This path loads the translation files from public/locales
      loadPath: '/locales/{{lng}}/translation.json',
    },
    react: {
      useSuspense: false // Fixes hydration issues with loading translations
    }
  });

export default i18n;