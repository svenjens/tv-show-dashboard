/**
 * Tests for external link utility
 */

import { describe, it, expect } from 'vitest'
import {
  addAffiliateParams,
  addUTMParams,
  getRelAttribute,
  prepareExternalLink,
  hasAffiliateProgram,
} from '@/utils/external-links'

describe('External Links Utility', () => {
  describe('addAffiliateParams', () => {
    it('should add Amazon associate tag for prime service', () => {
      const url = 'https://www.primevideo.com/detail/12345'
      const result = addAffiliateParams(url, 'prime', 'testsite-20')

      expect(result).toContain('tag=testsite-20')
      expect(result).toContain('primevideo.com')
    })

    it('should not add affiliate params if tag is not provided', () => {
      const url = 'https://www.primevideo.com/detail/12345'
      const result = addAffiliateParams(url, 'prime')

      expect(result).toBe(url)
    })

    it('should not modify URL for services without affiliate program', () => {
      const url = 'https://www.netflix.com/title/12345'
      const result = addAffiliateParams(url, 'netflix')

      expect(result).toBe(url)
    })

    it('should handle invalid URLs gracefully', () => {
      const invalidUrl = 'not a valid url'
      const result = addAffiliateParams(invalidUrl, 'prime')

      expect(result).toBe(invalidUrl)
    })
  })

  describe('addUTMParams', () => {
    it('should add UTM parameters', () => {
      const url = 'https://www.netflix.com/title/12345'
      const result = addUTMParams(url, 'Breaking Bad')

      expect(result).toContain('utm_source=bingelist')
      expect(result).toContain('utm_medium=referral')
      expect(result).toContain('utm_content=Breaking+Bad')
    })

    it('should add UTM parameters without show name', () => {
      const url = 'https://www.netflix.com/title/12345'
      const result = addUTMParams(url)

      expect(result).toContain('utm_source=bingelist')
      expect(result).toContain('utm_medium=referral')
      expect(result).not.toContain('utm_content')
    })

    it('should preserve existing query parameters', () => {
      const url = 'https://www.netflix.com/title/12345?existing=param'
      const result = addUTMParams(url)

      expect(result).toContain('existing=param')
      expect(result).toContain('utm_source=bingelist')
    })

    it('should handle invalid URLs gracefully', () => {
      const invalidUrl = 'not a valid url'
      const result = addUTMParams(invalidUrl)

      expect(result).toBe(invalidUrl)
    })
  })

  describe('getRelAttribute', () => {
    it('should return noopener for non-affiliate links', () => {
      const result = getRelAttribute(false)

      expect(result).toBe('noopener')
    })

    it('should return noopener sponsored for affiliate links', () => {
      const result = getRelAttribute(true)

      expect(result).toBe('noopener sponsored')
    })
  })

  describe('prepareExternalLink', () => {
    it('should prepare link with all attributes', () => {
      const result = prepareExternalLink({
        url: 'https://www.primevideo.com/detail/12345',
        serviceId: 'prime',
        showName: 'The Wire',
        isAffiliate: true,
        affiliateTag: 'testsite-20',
      })

      expect(result.href).toContain('primevideo.com')
      expect(result.href).toContain('tag=testsite-20') // Affiliate
      expect(result.href).toContain('utm_source=bingelist') // UTM
      expect(result.rel).toBe('noopener sponsored') // SEO
      expect(result.target).toBe('_blank')
    })

    it('should not add affiliate params if not affiliate', () => {
      const result = prepareExternalLink({
        url: 'https://www.netflix.com/title/12345',
        serviceId: 'netflix',
        showName: 'Stranger Things',
        isAffiliate: false,
      })

      expect(result.href).not.toContain('tag=')
      expect(result.href).toContain('utm_source=bingelist')
      expect(result.rel).toBe('noopener')
    })

    it('should handle links without service ID', () => {
      const result = prepareExternalLink({
        url: 'https://www.example.com',
      })

      expect(result.href).toContain('utm_source=bingelist')
      expect(result.rel).toBe('noopener')
      expect(result.target).toBe('_blank')
    })
  })

  describe('hasAffiliateProgram', () => {
    it('should return true for prime', () => {
      expect(hasAffiliateProgram('prime')).toBe(true)
    })

    it('should return false for netflix', () => {
      expect(hasAffiliateProgram('netflix')).toBe(false)
    })

    it('should return false for unknown service', () => {
      expect(hasAffiliateProgram('unknown-service')).toBe(false)
    })

    it('should return false for undefined service', () => {
      expect(hasAffiliateProgram()).toBe(false)
    })
  })
})
