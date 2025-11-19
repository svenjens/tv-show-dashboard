/**
 * Server API route for detecting user location via Vercel headers
 * This runs server-side and has access to Vercel's geo-location headers
 *
 * Testing with VPN:
 * - In production: Uses Vercel's x-vercel-ip-country header (based on IP)
 * - For testing: Add ?country=US to override (only in dev/preview)
 */
export default defineEventHandler((event) => {
  const headers = getHeaders(event)
  const query = getQuery(event)

  // Get country from Vercel header
  let country = headers['x-vercel-ip-country']

  // Fallback logic: Try to detect from Accept-Language header if Vercel header is missing
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

  // Final fallback to US (more neutral than NL for international users)
  if (!country) {
    country = 'US'
  }

  // Override for testing (not in production)
  if (import.meta.dev && query.country && typeof query.country === 'string') {
    country = query.country.toUpperCase()
    console.log(`[Location API] Test override: country=${country}`)
  }

  const city = headers['x-vercel-ip-city']
  const region = headers['x-vercel-ip-country-region']
  const latitude = headers['x-vercel-ip-latitude']
  const longitude = headers['x-vercel-ip-longitude']
  const timezone = headers['x-vercel-ip-timezone']

  return {
    country,
    city,
    region,
    latitude,
    longitude,
    timezone,
    detected: !!headers['x-vercel-ip-country'], // True if Vercel header was present
    // Add debug info to help troubleshoot location detection
    debug: {
      vercelCountry: headers['x-vercel-ip-country'] || null,
      acceptLanguage: headers['accept-language'] || null,
      detectionMethod: headers['x-vercel-ip-country']
        ? 'vercel-header'
        : headers['accept-language']
          ? 'accept-language'
          : 'fallback',
      overridden: !!query.country,
    },
  }
})
