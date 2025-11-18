import { describe, it, expect } from 'vitest'
import { getCountryName, COUNTRY_NAMES } from '@/utils/countries'

describe('getCountryName', () => {
  describe('English locale', () => {
    it('should return correct country names for supported countries', () => {
      expect(getCountryName('US', 'en')).toBe('the United States')
      expect(getCountryName('NL', 'en')).toBe('the Netherlands')
      expect(getCountryName('GB', 'en')).toBe('the United Kingdom')
      expect(getCountryName('DE', 'en')).toBe('Germany')
      expect(getCountryName('FR', 'en')).toBe('France')
    })
  })

  describe('Dutch locale', () => {
    it('should return correct country names for supported countries', () => {
      expect(getCountryName('US', 'nl')).toBe('de Verenigde Staten')
      expect(getCountryName('NL', 'nl')).toBe('Nederland')
      expect(getCountryName('GB', 'nl')).toBe('het Verenigd Koninkrijk')
      expect(getCountryName('DE', 'nl')).toBe('Duitsland')
      expect(getCountryName('FR', 'nl')).toBe('Frankrijk')
    })
  })

  describe('Spanish locale', () => {
    it('should return correct country names for supported countries', () => {
      expect(getCountryName('US', 'es')).toBe('los Estados Unidos')
      expect(getCountryName('NL', 'es')).toBe('los Países Bajos')
      expect(getCountryName('GB', 'es')).toBe('el Reino Unido')
      expect(getCountryName('DE', 'es')).toBe('Alemania')
      expect(getCountryName('FR', 'es')).toBe('Francia')
    })
  })

  describe('Default behavior', () => {
    it('should default to English when no locale is provided', () => {
      expect(getCountryName('US')).toBe('the United States')
      expect(getCountryName('NL')).toBe('the Netherlands')
    })

    it('should fallback to English for unsupported locales', () => {
      expect(getCountryName('US', 'fr')).toBe('the United States')
      expect(getCountryName('NL', 'de')).toBe('the Netherlands')
    })

    it('should return country code for unsupported countries', () => {
      expect(getCountryName('XX', 'en')).toBe('XX')
      expect(getCountryName('ZZ', 'nl')).toBe('ZZ')
      expect(getCountryName('YY', 'es')).toBe('YY')
    })
  })

  describe('All supported countries', () => {
    it('should have translations for all countries in all locales', () => {
      const countryCodes = Object.keys(COUNTRY_NAMES)
      const locales = ['en', 'nl', 'es']

      countryCodes.forEach((countryCode) => {
        locales.forEach((locale) => {
          const name = getCountryName(countryCode, locale)
          expect(name).toBeTruthy()
          expect(typeof name).toBe('string')
          expect(name.length).toBeGreaterThan(0)
        })
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle empty string country code', () => {
      expect(getCountryName('', 'en')).toBe('')
    })

    it('should handle lowercase country codes', () => {
      expect(getCountryName('us', 'en')).toBe('us') // Fallback to input
      expect(getCountryName('nl', 'en')).toBe('nl') // Fallback to input
    })

    it('should handle empty string locale', () => {
      expect(getCountryName('US', '')).toBe('the United States') // Falls back to 'en'
    })
  })

  describe('Specific country names', () => {
    it('should have correct article usage in names', () => {
      // English
      expect(getCountryName('US', 'en')).toContain('the')
      expect(getCountryName('NL', 'en')).toContain('the')
      expect(getCountryName('GB', 'en')).toContain('the')
      expect(getCountryName('DE', 'en')).not.toContain('the')

      // Dutch - check for article at start
      expect(getCountryName('US', 'nl')).toMatch(/^de /)
      expect(getCountryName('NL', 'nl')).toBe('Nederland') // No article
      expect(getCountryName('GB', 'nl')).toMatch(/^het /)

      // Spanish
      expect(getCountryName('US', 'es')).toMatch(/^los /)
      expect(getCountryName('NL', 'es')).toMatch(/^los /)
      expect(getCountryName('GB', 'es')).toMatch(/^el /)
    })

    it('should have all expected countries', () => {
      const expectedCountries = [
        'US',
        'NL',
        'GB',
        'DE',
        'FR',
        'ES',
        'IT',
        'CA',
        'AU',
        'JP',
        'BR',
        'MX',
        'IN',
      ]

      expectedCountries.forEach((code) => {
        expect(COUNTRY_NAMES[code as keyof typeof COUNTRY_NAMES]).toBeDefined()
      })
    })
  })
})
