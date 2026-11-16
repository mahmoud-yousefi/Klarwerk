import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import deCommon from './locales/de/common.json';
import deStore from './locales/de/store.json';
import deCheckout from './locales/de/checkout.json';
import deAssistant from './locales/de/assistant.json';
import deEditorial from './locales/de/editorial.json';

import enCommon from './locales/en/common.json';
import enStore from './locales/en/store.json';
import enCheckout from './locales/en/checkout.json';
import enAssistant from './locales/en/assistant.json';
import enEditorial from './locales/en/editorial.json';

export const LOCALE_STORAGE_KEY = 'klarwerk.locale';

const storedLocale = typeof window !== 'undefined' ? window.localStorage.getItem(LOCALE_STORAGE_KEY) : null;
const initialLocale = storedLocale === 'en' ? 'en' : 'de';

void i18n.use(initReactI18next).init({
  resources: {
    de: {
      common: deCommon,
      store: deStore,
      checkout: deCheckout,
      assistant: deAssistant,
      editorial: deEditorial,
    },
    en: {
      common: enCommon,
      store: enStore,
      checkout: enCheckout,
      assistant: enAssistant,
      editorial: enEditorial,
    },
  },
  lng: initialLocale,
  fallbackLng: 'de',
  supportedLngs: ['de', 'en'],
  defaultNS: 'common',
  ns: ['common', 'store', 'checkout', 'assistant', 'editorial'],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

const applyDocumentLanguage = (lng: string) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
};

applyDocumentLanguage(initialLocale);

i18n.on('languageChanged', (lng) => {
  const locale = lng.startsWith('en') ? 'en' : 'de';
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  applyDocumentLanguage(locale);
});

export default i18n;
