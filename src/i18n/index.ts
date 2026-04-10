import { createI18n } from 'vue-i18n';
import de from './locales/de';
import en from './locales/en';

const savedLocale = localStorage.getItem('myspa-soundscape-locale');

const i18n = createI18n({
  legacy: false,
  locale: savedLocale === 'en' ? 'en' : 'de',
  fallbackLocale: 'de',
  messages: {
    de,
    en,
  },
});

export default i18n;
