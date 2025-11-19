/**
 * Server API route to fetch episodes for a show
 * Uses Vercel KV for global caching (7 days TTL)
 * Sanitizes HTML summaries server-side
 * Translates episode names and summaries for non-English locales
 */

import { sanitizeEpisodeSummary } from '~/server/utils/sanitize'
import { translateText } from '~/server/utils/translate'
import { getLocaleFromRequest, needsTranslation } from '~/server/utils/language'
import { getCachedEpisodes } from '~/server/utils/tvmaze-cache'
import { logger } from '~/utils/logger'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Show ID is required',
    })
  }

  // Get locale from request for translation
  const locale = getLocaleFromRequest(event)

  // Allow skipping translation for faster initial load (progressive enhancement)
  const skipTranslation = query.skipTranslation === 'true'

  try {
    // Vercel KV handles caching globally (7 days TTL)
    const episodes = await getCachedEpisodes(parseInt(id))

    // Validate response is an array
    if (!Array.isArray(episodes)) {
      logger.error(`Invalid episodes response for show ${id}`, {
        module: 'episodes',
        showId: id,
        response: episodes,
      })
      return []
    }

    // Sanitize episode summaries server-side
    episodes.forEach((episode: any) => {
      if (episode.summary) {
        episode.summary = sanitizeEpisodeSummary(episode.summary)
      }
    })

    // Skip translation if requested (for progressive loading)
    if (skipTranslation) {
      return episodes
    }

    // Translate episodes if locale is not English
    // Replace the original fields directly with translated versions
    if (needsTranslation(locale)) {
      // Translate all episodes in parallel for better performance
      const translationPromises = (episodes as any[]).map(async (episode) => {
        const [translatedName, translatedSummary] = await Promise.all([
          episode.name ? translateText(episode.name, locale) : Promise.resolve(null),
          episode.summary ? translateText(episode.summary, locale) : Promise.resolve(null),
        ])

        if (translatedName) {
          episode.name = translatedName
        }
        if (translatedSummary) {
          episode.summary = sanitizeEpisodeSummary(translatedSummary)
        }
      })

      await Promise.allSettled(translationPromises)
    }

    return episodes
  } catch (error) {
    logger.error(
      `Error fetching episodes for show ${id}`,
      {
        module: 'episodes',
        showId: id,
      },
      error
    )
    throw createError({
      statusCode: 404,
      statusMessage: 'Episodes not found',
    })
  }
})
