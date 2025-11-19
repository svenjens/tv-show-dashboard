/**
 * Server API route to fetch cast for a show
 * Uses Vercel KV for global caching (7 days TTL)
 */

import { getCachedCast } from '~/server/utils/tvmaze-cache'
import { validateShowId } from '~/server/utils/validation'
import { logger } from '~/utils/logger'

export default defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, 'id')

  if (!rawId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Show ID is required',
    })
  }

  // Validate show ID (rejects invalid values like "abc", negative numbers, etc.)
  const showId = validateShowId(rawId)

  try {
    // Vercel KV handles caching globally (7 days TTL)
    const response = await getCachedCast(showId)
    return response
  } catch (error) {
    logger.error(
      `Error fetching cast for show ${showId}`,
      {
        module: 'cast',
        showId,
      },
      error
    )
    throw createError({
      statusCode: 404,
      statusMessage: 'Cast not found',
    })
  }
})
