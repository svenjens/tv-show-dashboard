/**
 * Pinia may finish hydrating after setup-store init, resetting skipHydrate refs on cold loads
 * (e.g. new tab). Re-apply persisted state once the app has mounted.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    useWatchlistStore().loadFromStorage()
    useSearchStore().loadRecentSearches()
  })
})
