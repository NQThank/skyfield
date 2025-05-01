import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import SIDEBAR_EN from '@/utils/locales/en/sidebar.json';
import COMMON_EN from '@/utils/locales/en/common.json';
import BUTTON_EN from '@/utils/locales/en/button.json';
import MESSAGE_EN from '@/utils/locales/en/message.json';
import ERROR_EN from '@/utils/locales/en/validation.json';

import SIDEBAR_VI from '@/utils/locales/vi/sidebar.json';
import COMMON_VI from '@/utils/locales/vi/common.json';
import BUTTON_VI from '@/utils/locales/vi/button.json';
import MESSAGE_VI from '@/utils/locales/vi/message.json';
import ERROR_VI from '@/utils/locales/vi/validation.json';

export const resources = {
  en: {
    sidebar: SIDEBAR_EN,
    common: COMMON_EN,
    button: BUTTON_EN,
    message: MESSAGE_EN,
    validation: ERROR_EN
  },
  vi: {
    sidebar: SIDEBAR_VI,
    common: COMMON_VI,
    button: BUTTON_VI,
    message: MESSAGE_VI,
    validation: ERROR_VI
  }
} as const;

export const defaultNS = 'sidebar';

i18n
  // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // learn more: https://github.com/i18next/i18next-http-backend
  // want your translations to be loaded from a professional CDN? => https://github.com/locize/react-tutorial#step-2---use-the-locize-cdn
  .use(Backend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    lng: 'en',
    resources,
    ns: [],
    fallbackLng: 'en',
    defaultNS,
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    }
  });

export default i18n;
