export const SUPPORTED_LOCALES = ['es', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';
export const FALLBACK_LOCALE: Locale = 'en';
export const LOCALE_STORAGE_KEY = 'appLang';

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  if (!value) return false;
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function mapSystemLocale(systemLocale: string): Locale {
  return systemLocale.toLowerCase().includes('en') ? 'en' : DEFAULT_LOCALE;
}
