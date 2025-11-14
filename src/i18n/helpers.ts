/**
 * Helper functions for i18n
 */

import i18n from './index'

/**
 * Get current locale value
 */
export function getCurrentLocale(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locale = i18n.global.locale as any
  // Handle both ref and direct string
  return typeof locale === 'object' && 'value' in locale
    ? String(locale.value)
    : String(locale)
}

/**
 * Set current locale
 */
export function setCurrentLocale(newLocale: 'en' | 'nl'): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locale = i18n.global.locale as any
  if (typeof locale === 'object' && 'value' in locale) {
    locale.value = newLocale
  }
}

