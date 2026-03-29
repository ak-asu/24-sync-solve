export const SUPPORTED_LOCALES = ['en', 'es', 'pt', 'fr'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export interface LocaleOption {
  code: Locale
  label: string
  /** Native name displayed in the switcher */
  nativeLabel: string
}

export const LOCALE_OPTIONS: LocaleOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
]

export const LOCALE_COOKIE = 'NEXT_LOCALE'

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}
