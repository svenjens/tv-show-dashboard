/**
 * PWA Manifest plugin
 * Ensures the manifest link is injected in the HTML head
 */
export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    useHead({
      link: [
        {
          rel: 'manifest',
          href: '/manifest.webmanifest',
        },
      ],
    })
  }
})
