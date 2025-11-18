export default {
  getImage(src: string, { modifiers = {} }: any = {}) {
    // If src is already a full URL from TVMaze, extract the path
    let imagePath = src
    if (src.startsWith('http://static.tvmaze.com') || src.startsWith('https://static.tvmaze.com')) {
      imagePath = src.replace(/^https?:\/\/static\.tvmaze\.com/, '')
    }

    // Build the URL through our CDN subdomain
    const baseURL = 'https://cdn.bingelist.app'

    // Generate parameters for Nuxt Image optimization
    const params: string[] = []

    if (modifiers.width) {
      params.push(`w_${modifiers.width}`)
    }
    if (modifiers.height) {
      params.push(`h_${modifiers.height}`)
    }
    if (modifiers.quality) {
      params.push(`q_${modifiers.quality}`)
    }
    if (modifiers.format) {
      params.push(`f_${modifiers.format}`)
    }

    // Construct the final URL
    // Format: https://cdn.bingelist.app/_image/w_300,h_450,q_85,f_webp/uploads/123/456.jpg
    const modifierString = params.length > 0 ? `/${params.join(',')}` : ''
    const url = `${baseURL}/_image${modifierString}${imagePath}`

    return {
      url,
    }
  },
}
