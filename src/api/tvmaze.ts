/**
 * TVMaze API Service
 * 
 * Provides methods to interact with the TVMaze API
 * Documentation: https://www.tvmaze.com/api
 */

import axios, { type AxiosInstance, AxiosError } from 'axios'
import type { Show, SearchResult, ApiError } from '@/types'

const BASE_URL = 'https://api.tvmaze.com'

class TVMazeAPI {
  private client: AxiosInstance
  private cache: Map<string, { data: unknown; timestamp: number }>

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.cache = new Map()

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: error.message || 'An error occurred',
          status: error.response?.status,
          details: error.response?.data,
        }
        console.error('[API Error]', apiError)
        return Promise.reject(apiError)
      }
    )
  }

  /**
   * Get data from cache if available and not expired
   * @param key - Cache key
   * @param ttl - Time to live in milliseconds (default: 5 minutes)
   */
  private getCached<T>(key: string, ttl: number = 5 * 60 * 1000): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < ttl) {
      console.log(`[API Cache] Hit for ${key}`)
      return cached.data as T
    }
    return null
  }

  /**
   * Set data in cache
   */
  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  /**
   * Fetch all TV shows from the show index
   * Note: This returns a paginated list. For production, implement proper pagination.
   */
  async fetchAllShows(): Promise<Show[]> {
    const cacheKey = 'all-shows'
    const cached = this.getCached<Show[]>(cacheKey)
    if (cached) return cached

    try {
      const response = await this.client.get<Show[]>('/shows')
      this.setCache(cacheKey, response.data)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Fetch a single show by ID with optional embed parameters
   * @param id - Show ID
   * @param embed - Optional embed parameters (e.g., 'cast', 'episodes')
   */
  async fetchShowById(id: number, embed?: string[]): Promise<Show> {
    const embedParam = embed ? `?embed[]=${embed.join('&embed[]=')}` : ''
    const cacheKey = `show-${id}${embedParam}`
    const cached = this.getCached<Show>(cacheKey)
    if (cached) return cached

    try {
      const response = await this.client.get<Show>(`/shows/${id}${embedParam}`)
      this.setCache(cacheKey, response.data)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Search for shows by name
   * @param query - Search query
   */
  async searchShows(query: string): Promise<SearchResult[]> {
    if (!query.trim()) {
      return []
    }

    const cacheKey = `search-${query.toLowerCase()}`
    const cached = this.getCached<SearchResult[]>(cacheKey, 2 * 60 * 1000) // 2 minutes TTL
    if (cached) return cached

    try {
      const response = await this.client.get<SearchResult[]>('/search/shows', {
        params: { q: query },
      })
      this.setCache(cacheKey, response.data)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear()
    console.log('[API Cache] Cleared')
  }

  /**
   * Handle API errors and convert to ApiError type
   */
  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        message: error.response?.data?.message || error.message || 'An error occurred',
        status: error.response?.status,
        details: error.response?.data,
      }
    }
    return {
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    }
  }
}

// Export singleton instance
export const tvMazeAPI = new TVMazeAPI()

// Export class for testing purposes
export { TVMazeAPI }

