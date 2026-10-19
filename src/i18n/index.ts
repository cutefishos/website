import en from './en.json';

export const defaultLocale = 'en';

export const locales = {
  en: { name: 'English', strings: en },
} as const;

export type Locale = keyof typeof locales;
export type StringKey = keyof typeof en;

export function t(locale: Locale, key: StringKey): string {
  const strings: Partial<Record<StringKey, string>> = locales[locale].strings;
  return strings[key] ?? en[key];
}

// The default locale lives at the site root, every other one under its code.
export function localePath(locale: Locale, path = '/'): string {
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  return `${prefix}${path}` === '' ? '/' : `${prefix}${path}`;
}

export function localeParam(locale: Locale): string | undefined {
  return locale === defaultLocale ? undefined : locale;
}

export function localeStaticPaths() {
  return (Object.keys(locales) as Locale[]).map((locale) => ({
    params: { lang: localeParam(locale) },
    props: { locale },
  }));
}
