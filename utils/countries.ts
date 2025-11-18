/**
 * Country name translations for supported locales
 * Maps ISO 3166-1 alpha-2 country codes to localized country names
 */

export type CountryCode = keyof typeof COUNTRY_NAMES
export type LocaleCode = 'en' | 'nl' | 'es'

export const COUNTRY_NAMES = {
  US: {
    en: 'the United States',
    nl: 'de Verenigde Staten',
    es: 'los Estados Unidos',
  },
  NL: {
    en: 'the Netherlands',
    nl: 'Nederland',
    es: 'los Países Bajos',
  },
  GB: {
    en: 'the United Kingdom',
    nl: 'het Verenigd Koninkrijk',
    es: 'el Reino Unido',
  },
  DE: {
    en: 'Germany',
    nl: 'Duitsland',
    es: 'Alemania',
  },
  FR: {
    en: 'France',
    nl: 'Frankrijk',
    es: 'Francia',
  },
  ES: {
    en: 'Spain',
    nl: 'Spanje',
    es: 'España',
  },
  IT: {
    en: 'Italy',
    nl: 'Italië',
    es: 'Italia',
  },
  CA: {
    en: 'Canada',
    nl: 'Canada',
    es: 'Canadá',
  },
  AU: {
    en: 'Australia',
    nl: 'Australië',
    es: 'Australia',
  },
  JP: {
    en: 'Japan',
    nl: 'Japan',
    es: 'Japón',
  },
  BR: {
    en: 'Brazil',
    nl: 'Brazilië',
    es: 'Brasil',
  },
  MX: {
    en: 'Mexico',
    nl: 'Mexico',
    es: 'México',
  },
  IN: {
    en: 'India',
    nl: 'India',
    es: 'India',
  },
} as const

/**
 * Get localized country name from country code
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "US", "NL")
 * @param locale - Locale code (e.g., "en", "nl", "es")
 * @returns Localized country name or the country code if not found
 *
 * @example
 * getCountryName('US', 'en') // "the United States"
 * getCountryName('NL', 'nl') // "Nederland"
 * getCountryName('GB', 'es') // "el Reino Unido"
 * getCountryName('XX', 'en') // "XX" (fallback)
 */
export function getCountryName(countryCode: string, locale: string = 'en'): string {
  const normalizedLocale = (locale as LocaleCode) || 'en'
  const country = COUNTRY_NAMES[countryCode as CountryCode]

  if (!country) {
    return countryCode // Fallback to country code if not found
  }

  return country[normalizedLocale] || country.en || countryCode
}
