/**
 * Image proxy endpoint
 * Proxies TVMaze images through our domain for better control and caching
 */

// Simple in-memory request queue to prevent overwhelming TVMaze
class RequestQueue {
  private queue: Array<() => void> = []
  private activeRequests = 0
  private readonly maxConcurrent = 5 // Max 5 concurrent requests to TVMaze

  async add<T>(fn: () => Promise<T>): Promise<T> {
    // If we're at capacity, wait in queue
    if (this.activeRequests >= this.maxConcurrent) {
      await new Promise<void>((resolve) => this.queue.push(resolve))
    }

    this.activeRequests++

    try {
      return await fn()
    } finally {
      this.activeRequests--
      // Process next in queue
      const next = this.queue.shift()
      if (next) next()
    }
  }
}

const requestQueue = new RequestQueue()

export default defineEventHandler(async (event) => {
  const path = event.context.params?.path

  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image path is required',
    })
  }

  // Construct TVMaze image URL
  const imageUrl = `https://static.tvmaze.com/${path}`

  try {
    // Queue the request to prevent overwhelming TVMaze
    const buffer = await requestQueue.add(async () => {
      // Fetch image from TVMaze with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      const response = await fetch(imageUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'BingeList/3.0 (Image Proxy)',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.warn(`Image fetch failed: ${imageUrl} - Status: ${response.status}`)
        throw new Error(`Failed to fetch: ${response.status}`)
      }

      // Get image content
      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    })

    // Set appropriate headers
    setHeader(event, 'Content-Type', 'image/jpeg')
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
    setHeader(event, 'Access-Control-Allow-Origin', '*')

    // Return image buffer
    return buffer
  } catch (error) {
    // Log the actual error for debugging
    if (error instanceof Error) {
      console.warn(`Image proxy fallback for ${imageUrl}:`, error.message)
    }

    // Fallback: redirect to original TVMaze URL
    // This way images still load even if proxy fails or queue is full
    return sendRedirect(event, imageUrl, 302)
  }
})
