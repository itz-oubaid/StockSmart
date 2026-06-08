import { useLanguage } from '../hooks/useLanguage';

/**
 * @param {'inline' | 'auth'} variant
 */
export const LanguageSwitcher = ({ variant = 'inline', className = '' }) => {
  const { language, setLanguage, languageOptions, t } = useLanguage();

  const handleChange = (e) => {
    setLanguage(e.target.value);
  };

  const baseSelectClass =
    'rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all';

  if (variant === 'auth') {
    return (
      <div className={`auth-language-wrap ${className}`}>
        <label htmlFor="auth-language" className="auth-language-label">
          {t('settings.language')}
        </label>
        <select
          id="auth-language"
          value={language}
          onChange={handleChange}
          className="auth-language-select"
          aria-label={t('settings.language')}
        >
          {languageOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <select
      value={language}
      onChange={handleChange}
      className={`w-full p-2 text-sm ${baseSelectClass} ${className}`}
      aria-label={t('settings.language')}
    >
      {languageOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
