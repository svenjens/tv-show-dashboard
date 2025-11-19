/**
 * Utility for handling external links with proper SEO, tracking, and affiliate support
 */

import { STREAMING_PLATFORMS } from '@/types'

export interface ExternalLinkConfig {
  url: string
  serviceId?: string
  showName?: string
  isAffiliate?: boolean
  affiliateTag?: string // Amazon Associate tag, Apple affiliate token, etc.
}

export interface ExternalLinkAttributes {
  href: string
  rel: string
  target: string
}

/**
 * Add affiliate parameters to a URL
 * Currently supports: Amazon Prime Video
 */
export function addAffiliateParams(url: string, serviceId?: string, affiliateTag?: string): string {
  if (!serviceId || !affiliateTag) return url

  try {
    const urlObj = new URL(url)

    switch (serviceId) {
      case 'prime':
        // Amazon Prime Video affiliate link
        urlObj.searchParams.set('tag', affiliateTag)
        break

      // Add more affiliate programs here as needed
      // case 'apple':
      //   urlObj.searchParams.set('at', affiliateTag)
      //   break

      default:
        // No affiliate program for this service
        break
    }

    return urlObj.toString()
  } catch (error) {
    // If URL parsing fails, return original
    console.warn('[External Links] Failed to parse URL:', url)
    return url
  }
}

/**
 * Add UTM tracking parameters to a URL
 */
export function addUTMParams(url: string, showName?: string): string {
  try {
    const urlObj = new URL(url)

    // Add UTM parameters for tracking
    urlObj.searchParams.set('utm_source', 'bingelist')
    urlObj.searchParams.set('utm_medium', 'referral')
    if (showName) {
      urlObj.searchParams.set('utm_content', showName)
    }

    return urlObj.toString()
  } catch (error) {
    console.warn('[External Links] Failed to add UTM params:', url)
    return url
  }
}

/**
 * Get proper rel attribute for external links
 * According to Google's guidelines:
 * - Use 'sponsored' for paid/affiliate links
 * - Always use 'noopener' for security (target="_blank")
 * - Use 'nofollow' for untrusted content (optional for streaming services)
 *
 * @see https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links
 */
export function getRelAttribute(isAffiliate: boolean): string {
  const attrs = ['noopener']

  if (isAffiliate) {
    // For affiliate/commercial links, use 'sponsored'
    attrs.push('sponsored')
  }

  return attrs.join(' ')
}

/**
 * Prepare an external link with all necessary attributes
 * Adds affiliate params, UTM tracking, and proper SEO attributes
 */
export function prepareExternalLink(config: ExternalLinkConfig): ExternalLinkAttributes {
  const { url, serviceId, showName, isAffiliate = false, affiliateTag } = config

  let finalUrl = url

  // Add affiliate parameters if applicable
  if (isAffiliate && serviceId && affiliateTag) {
    const platform = serviceId ? STREAMING_PLATFORMS[serviceId] : undefined
    if (platform?.hasAffiliateProgram) {
      finalUrl = addAffiliateParams(finalUrl, serviceId, affiliateTag)
    }
  }

  // Add UTM tracking parameters
  finalUrl = addUTMParams(finalUrl, showName)

  // Get proper rel attribute
  const rel = getRelAttribute(isAffiliate)

  return {
    href: finalUrl,
    rel,
    target: '_blank',
  }
}

/**
 * Check if a service has an active affiliate program
 */
export function hasAffiliateProgram(serviceId?: string): boolean {
  if (!serviceId) return false

  const platform = STREAMING_PLATFORMS[serviceId]
  return platform?.hasAffiliateProgram || false
}
