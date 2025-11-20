import type { Page } from '@playwright/test'

/**
 * Inject CSS to make elements with data-e2e-visible always visible during tests
 * This fixes hover-based interactions that are flaky in automated tests
 */
export async function makeTestElementsVisible(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      
      [data-e2e-visible],
      [data-testid^="show-card-"],
      [data-testid="search-bar"] {
        opacity: 1 !important;
        visibility: visible !important;
        transform: none !important;
      }
    `,
  })
}

/**
 * Wait for Nuxt app to be fully hydrated and interactive
 * This is crucial for SPAs where client-side routing needs to be ready
 */
export async function waitForHydration(page: Page) {
  // Wait for DOM content to be loaded
  await page.waitForLoadState('domcontentloaded')
  
  // Small buffer to ensure Vue Router and Pinia stores are ready
  // Increased buffer for CI environments
  await page.waitForTimeout(2000)

  // Make test elements always visible
  await makeTestElementsVisible(page)
}

/**
 * Navigate and wait for SPA route change
 * Use this instead of page.goto for client-side navigation
 */
export async function navigateSPA(page: Page, urlPattern: RegExp, action: () => Promise<void>) {
  // Get current URL
  const currentUrl = page.url()

  // Perform the action (e.g., click)
  await action()

  // Wait for URL to change
  await page.waitForFunction((oldUrl) => window.location.href !== oldUrl, currentUrl, {
    timeout: 15000,
  })

  // Wait for the new URL to match the pattern
  await page.waitForURL(urlPattern, { timeout: 15000 })

  // Wait for hydration after navigation
  await waitForHydration(page)
}
