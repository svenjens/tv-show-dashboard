/**
 * Client-side plugin to enhance i18n SEO
 * Ensures proper hreflang tags and x-default are set
 */

interface LocaleConfig {
  code: string
  iso?: string
}

export default defineNuxtPlugin((nuxtApp) => {
  // Access i18n instance directly from nuxtApp to avoid context issues in plugins
  const i18n = nuxtApp.$i18n as any
  const locales = computed(() => i18n.locales.value)

  const route = useRoute()
  const switchLocalePath = useSwitchLocalePath()

  // Watch for route changes to update hreflang tags
  watch(
    () => route.fullPath,
    () => {
      if (!import.meta.client) return

      const baseUrl = 'https://bingelist.app'
      const links: { rel: string; hreflang: string; href: string }[] = []

      // Generate hreflang links for each locale
      // Cast to unknown first to avoid TS errors with string[] union
      ;(locales.value as unknown as LocaleConfig[]).forEach((loc) => {
        const localeCode = loc.code
        const isoCode = loc.iso ? loc.iso.toLowerCase() : loc.code // Convert to lowercase per Google guidelines
        // @ts-expect-error - switchLocalePath types are sometimes too strict for dynamic locale codes
        const localePath = switchLocalePath(localeCode)

        if (localePath) {
          links.push({
            rel: 'alternate',
            hreflang: isoCode,
            href: `${baseUrl}${localePath}`,
          })
        }
      })

      // Add x-default pointing to default locale (English)
      const defaultPath = switchLocalePath('en')
      if (defaultPath) {
        links.push({
          rel: 'alternate',
          hreflang: 'x-default',
          href: `${baseUrl}${defaultPath}`,
        })
      }

      // Update head with hreflang links
      useHead({
        link: links,
      })
    },
    { immediate: true }
  )
})
