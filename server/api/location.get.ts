import { geolocation } from '@vercel/functions'

/**
 * Server API route for detecting user location via Vercel's geolocation API
 * This runs server-side and has access to Vercel's geo-location headers
 *
 * Using @vercel/functions package for better geolocation detection
 * Docs: https://vercel.com/guides/geo-ip-headers-geolocation-vercel-functions
 *
 * Testing with VPN:
 * - In production: Uses Vercel's geolocation API (based on IP)
 * - For testing: Add ?country=US to override (only in dev/preview)
 */
export default defineEventHandler((event) => {
  const headers = getHeaders(event)
  const query = getQuery(event)

  // Create a Request-like object for the geolocation helper
  // The geolocation function only reads headers, so we can create a minimal Request object
  const request = new Request('http://localhost', {
    headers: new Headers(headers as Record<string, string>),
  })

  // Use Vercel's geolocation helper (reads x-vercel-ip-* headers)
  const geo = geolocation(request)

  // Extract country from geolocation or fall back to direct headers
  let country = geo.country || headers['x-vercel-ip-country']

  // Fallback logic: Try to detect from Accept-Language header if Vercel geolocation is missing
  if (!country) {
    const acceptLanguage = headers['accept-language']
    if (acceptLanguage) {
      // Extract country from Accept-Language (e.g., "en-US,en;q=0.9" -> "US")
      const match = acceptLanguage.match(/[-_]([A-Z]{2})/i)
      if (match?.[1]) {
        country = match[1].toUpperCase()
      }
    }
  }

  // Final fallback to NL (default country)
  if (!country) {
    country = 'NL'
  }

  // Override for testing (not in production)
  if (import.meta.dev && query.country && typeof query.country === 'string') {
    country = query.country.toUpperCase()
    console.log(`[Location API] Test override: country=${country}`)
  }

  return {
    country,
    city: geo.city || headers['x-vercel-ip-city'],
    region: geo.region || headers['x-vercel-ip-country-region'],
    latitude: geo.latitude || headers['x-vercel-ip-latitude'],
    longitude: geo.longitude || headers['x-vercel-ip-longitude'],
    timezone: headers['x-vercel-ip-timezone'],
    detected: !!(geo.country || headers['x-vercel-ip-country']), // True if Vercel geolocation was present
    // Add debug info to help troubleshoot location detection
    debug: {
      vercelCountry: geo.country || headers['x-vercel-ip-country'] || null,
      vercelCity: geo.city || null,
      acceptLanguage: headers['accept-language'] || null,
      detectionMethod: geo.country
        ? 'vercel-geolocation'
        : headers['x-vercel-ip-country']
          ? 'vercel-header'
          : headers['accept-language']
            ? 'accept-language'
            : 'fallback',
      overridden: !!query.country,
    },
  }
})
