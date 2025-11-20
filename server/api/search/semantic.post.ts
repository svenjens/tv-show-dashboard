/**
 * AI-powered semantic search using GPT-3.5 to transform natural language queries
 * into optimized TVMaze search terms
 */

import OpenAI from 'openai'
import type { Show, SemanticIntent } from '@/types'

/**
 * Validate search query
 */
function validateQuery(query: unknown): string {
  if (!query || typeof query !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Query parameter is required',
    })
  }

  // Require at least 2 characters (consistent with regular search)
  if (query.trim().length < 2) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Search query must be at least 2 characters',
    })
  }

  return query
}

/**
 * Get OpenAI system prompt for TV show search
 */
function getSystemPrompt(): string {
  return `You are a TV show search expert. Transform natural language queries into optimized search terms for TVMaze API.

Your task:
1. Extract show names, genres, moods, and themes from the query
2. Generate 3-5 optimized search terms that will find matching shows
3. For each search term, provide a clear reason why it matches the query
4. Return as JSON with these fields:
   - searches: array of objects with {term: string, reason: string}
   - intent: object describing what user is looking for

Examples:

Query: "dark sci-fi shows like Black Mirror"
Response: {
  "searches": [
    {"term": "Black Mirror", "reason": "similar show"},
    {"term": "Westworld", "reason": "dark sci-fi"},
    {"term": "Twilight Zone", "reason": "anthology format"},
    {"term": "sci-fi anthology", "reason": "genre match"},
    {"term": "dystopian", "reason": "dark themes"}
  ],
  "intent": {
    "genres": ["science-fiction", "thriller"],
    "mood": ["dark", "dystopian"],
    "similar": "Black Mirror"
  }
}

Query: "funny workplace comedies"
Response: {
  "searches": [
    {"term": "The Office", "reason": "classic workplace comedy"},
    {"term": "Parks and Recreation", "reason": "mockumentary style"},
    {"term": "workplace comedy", "reason": "theme match"},
    {"term": "sitcom office", "reason": "genre + setting"}
  ],
  "intent": {
    "genres": ["comedy"],
    "mood": ["funny", "light-hearted"],
    "theme": "workplace"
  }
}

Query: "mystery series with strong female leads"
Response: {
  "searches": [
    {"term": "Killing Eve", "reason": "female-led thriller"},
    {"term": "Mare of Easttown", "reason": "detective mystery"},
    {"term": "mystery female lead", "reason": "genre + character type"},
    {"term": "thriller woman", "reason": "strong female protagonist"}
  ],
  "intent": {
    "genres": ["mystery", "thriller"],
    "theme": "strong female lead"
  }
}

Always return valid JSON. Be creative with search terms to maximize results.
IMPORTANT: The "reason" should explain WHY the search term matches the query, NOT just repeat the show title.`
}

/**
 * Use GPT to generate search terms from natural language query
 */
async function generateSearchTermsWithGPT(
  openai: OpenAI,
  query: string
): Promise<{ searches: Array<{ term: string; reason: string }>; intent: SemanticIntent }> {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: getSystemPrompt(),
      },
      {
        role: 'user',
        content: query,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 300,
  })

  const content = response.choices?.[0]?.message?.content || '{}'
  return JSON.parse(content)
}

/**
 * Normalize search terms from GPT response
 * Supports both new format (searches) and old format (searchTerms) for backward compatibility
 */
interface GPTResponse {
  searches?: Array<{ term: string; reason: string }>
  searchTerms?: string[]
}

function normalizeSearchTerms(
  gptResult: GPTResponse,
  fallbackQuery: string
): Array<{ term: string; reason: string }> {
  if (Array.isArray(gptResult.searches)) {
    return gptResult.searches
  }

  if (Array.isArray(gptResult.searchTerms)) {
    return gptResult.searchTerms.map((term: string) => ({
      term,
      reason: 'relevant match',
    }))
  }

  return [{ term: fallbackQuery, reason: 'search query' }]
}

/**
 * Search TVMaze for a single term
 */
async function searchTVMazeForTerm(
  term: string,
  reason: string
): Promise<Array<{ show: Show; score: number; matchedTerm: string }>> {
  try {
    const shows = await $fetch<Array<{ show: Show; score: number }>>(
      `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(term)}`
    )

    // Validate response is an array
    if (!Array.isArray(shows)) {
      console.error(`Invalid shows response for term: ${term}`, shows)
      return []
    }

    // Top 10 per search term
    return shows.slice(0, 10).map((result) => ({
      show: result.show,
      score: result.score,
      matchedTerm: reason, // Use the reason instead of the term
    }))
  } catch (error) {
    console.error(`Failed to search for term: ${term}`, error)
    return []
  }
}

/**
 * Search TVMaze with multiple terms and deduplicate results
 */
async function searchWithMultipleTerms(
  searches: Array<{ term: string; reason: string }>
): Promise<Array<{ show: Show; score: number; matchedTerm: string }>> {
  const allResults = new Map() // Deduplicate by show ID

  // Limit to 5 terms to avoid too many API calls
  for (const search of searches.slice(0, 5)) {
    const term = typeof search === 'string' ? search : search.term
    const reason = typeof search === 'string' ? 'relevant match' : search.reason

    const results = await searchTVMazeForTerm(term, reason)

    // Add to results, avoiding duplicates
    for (const result of results) {
      if (!allResults.has(result.show.id)) {
        allResults.set(result.show.id, result)
      }
    }
  }

  // Convert to array and sort by relevance
  return Array.from(allResults.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 20) // Top 20 results
}

/**
 * Fallback to regular TVMaze search
 */
async function fallbackSearch(query: string) {
  const fallbackResults = await $fetch<Array<{ show: Show; score: number }>>(
    `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`
  )

  // Validate response is an array
  if (!Array.isArray(fallbackResults)) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Invalid search results',
    })
  }

  return {
    query,
    intent: { fallback: true },
    searchTerms: [query],
    results: fallbackResults.slice(0, 20).map((r) => ({
      show: r.show,
      score: r.score,
      matchedTerm: query,
    })),
    total: fallbackResults.length,
  }
}

export default defineEventHandler(async (event) => {
  const { query } = await readBody(event)

  // Validate query
  const validatedQuery = validateQuery(query)

  const config = useRuntimeConfig()

  if (!config.openaiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OpenAI API key not configured',
    })
  }

  try {
    const openai = new OpenAI({
      apiKey: config.openaiApiKey,
    })

    // Step 1: Use GPT to understand the query and generate search terms
    const gptResult = await generateSearchTermsWithGPT(openai, validatedQuery)

    // Step 2: Normalize search terms from GPT response
    const searches = normalizeSearchTerms(gptResult, validatedQuery)

    // Step 3: Search TVMaze with generated terms
    const results = await searchWithMultipleTerms(searches)

    return {
      query: validatedQuery,
      intent: gptResult.intent,
      searchTerms: searches.map((s) => s.term),
      results,
      total: results.length,
    }
  } catch (error) {
    console.error('Semantic search error:', error)

    // Fallback to regular search if GPT fails
    try {
      return await fallbackSearch(validatedQuery)
    } catch {
      throw createError({
        statusCode: 500,
        statusMessage: 'Search failed',
      })
    }
  }
})
