import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export const SUPPORTED_LANGUAGES = ['en', 'fr', 'es'];

const normalizeLang = (lng) => {
  const code = (lng || '').split('-')[0];
  return SUPPORTED_LANGUAGES.includes(code) ? code : null;
};

export const useLanguage = () => {
  const { i18n, t } = useTranslation();
  const { updateTenantSettings } = useAuth();

  const language = normalizeLang(i18n.language) || normalizeLang(localStorage.getItem('stocksmart_language')) || 'fr';

  const setLanguage = useCallback(
    (lng, { persist = true } = {}) => {
      const code = normalizeLang(lng);
      if (!code) return;

      i18n.changeLanguage(code);
      document.documentElement.lang = code;

      if (persist) {
        localStorage.setItem('stocksmart_language', code);
        updateTenantSettings({ locale: code });
      }
    },
    [i18n, updateTenantSettings]
  );

  const languageOptions = [
    { value: 'en', label: t('settings.lang_en') },
    { value: 'fr', label: t('settings.lang_fr') },
    { value: 'es', label: t('settings.lang_es') },
  ];

  return { language, setLanguage, languageOptions, t };
};
