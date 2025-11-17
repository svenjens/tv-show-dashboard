# BingeList - Nuxt 3 Version

This is the Nuxt 3 migration of BingeList, featuring server-side rendering, improved SEO, and automatic location detection via Vercel headers.

## Key Differences from SPA Version

### 🎯 SSR (Server-Side Rendering)
- Pages are rendered server-side for faster initial load
- Better SEO with pre-rendered content
- Improved Core Web Vitals scores

### 🌍 Location Detection
- Automatic user location detection via Vercel geo-headers
- Server-side country detection for streaming availability
- No client-side geolocation API needed

### 🚀 Performance Improvements
- File-based routing (no manual route configuration)
- Auto-imported components and composables
- Built-in code splitting and lazy loading
- Optimized bundle size

### 📱 SEO Enhancements
- Server-rendered meta tags
- Dynamic Open Graph images
- Structured data (JSON-LD) for TV shows
- Better social media sharing

## Project Structure

```
nuxt-bingelist/
├── api/                    # API services (client-side)
├── assets/                 # CSS and static assets
├── components/             # Vue components (auto-imported)
├── composables/            # Composables (auto-imported)
├── layouts/                # Page layouts
├── locales/                # i18n translations
├── middleware/             # Route middleware
├── pages/                  # File-based routing
│   ├── index.vue          # Home page
│   ├── search.vue         # Search page
│   ├── watchlist.vue      # Watchlist page
│   ├── show/[slug].vue    # Show detail (dynamic route)
│   ├── genre/[genre].vue  # Genre overview (dynamic route)
│   └── legal/             # Legal pages
├── public/                 # Static files
├── server/                 # Server-side code
│   └── api/               # Server API routes
│       └── location.get.ts # Location detection endpoint
├── stores/                 # Pinia stores (auto-imported)
├── types/                  # TypeScript types
└── utils/                  # Utility functions

```

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev
```

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Copy `.env` from the original project or create a new one:

```env
# TMDB API
VITE_TMDB_API_KEY=your_tmdb_api_key_here

# Google AdSense
VITE_GOOGLE_ADSENSE_ID=your_adsense_id_here

# Amazon Associates
VITE_AMAZON_ASSOCIATE_TAG=your_amazon_tag_here
```

## Key Features

### 1. Server-Side Location Detection

The app automatically detects user location via Vercel's geo-headers:

```typescript
// server/api/location.get.ts
export default defineEventHandler((event) => {
  const headers = getHeaders(event)
  return {
    country: headers['x-vercel-ip-country'] || 'NL',
    city: headers['x-vercel-ip-city'],
    // ... more location data
  }
})
```

### 2. Dynamic SEO

Each page automatically generates appropriate meta tags:

```typescript
// In any page
useSEO({
  title: 'My Page Title',
  description: 'Page description',
  image: '/og-image.png'
})
```

### 3. File-Based Routing

Routes are automatically generated from the `pages/` directory:
- `pages/index.vue` → `/`
- `pages/show/[slug].vue` → `/show/:slug`
- `pages/genre/[genre].vue` → `/genre/:genre`

### 4. Auto-Imports

Components, composables, and utilities are automatically imported:

```vue
<template>
  <!-- No import needed for components -->
  <ShowCard :show="show" />
</template>

<script setup>
// No import needed for composables
const { country } = useLocation()
</script>
```

## Vercel Deployment

This app is optimized for Vercel deployment:

1. **Push to GitHub**
   ```bash
   git push origin feat/nuxt-migration
   ```

2. **Deploy via Vercel**
   - Vercel automatically detects Nuxt 3
   - Set environment variables in Vercel dashboard
   - Deploy and test

3. **Geo-Headers**
   - Vercel automatically provides `x-vercel-ip-country` headers
   - Location detection works out of the box
   - No additional configuration needed

## Migration Notes

### What Was Migrated

✅ All pages and components
✅ Pinia stores
✅ API services
✅ i18n translations
✅ Tailwind CSS configuration
✅ Dark mode functionality
✅ SEO composables
✅ Public assets

### What Changed

- `@/` imports still work (Nuxt alias)
- `router.push()` → `navigateTo()` or keep router (both work)
- `import.meta.env` → `useRuntimeConfig()`
- DOM-based utilities → SSR-safe alternatives

### Testing Checklist

- [ ] All pages render correctly
- [ ] Client-side navigation works
- [ ] Server-side rendering generates HTML
- [ ] Location detection works on Vercel
- [ ] Streaming links show correct region
- [ ] Dark mode persists
- [ ] i18n works (NL/EN)
- [ ] SEO meta tags render server-side
- [ ] Lighthouse scores 95+ on all

## Performance Targets

- **Lighthouse Performance**: 95+
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

## Rollback Plan

If issues arise, the original SPA version remains in `tv-show-dashboard/`:
- Simply revert Vercel deployment to previous version
- No data loss (all state is client-side)
- Easy to switch back

## Next Steps

1. Test locally: `npm run dev`
2. Build and preview: `npm run build && npm run preview`
3. Deploy to Vercel preview environment
4. Test location detection on Vercel
5. Compare Lighthouse scores
6. Gradually migrate traffic
7. Monitor performance and errors

## Questions?

See the main migration plan in `nuxt-migration-plan.plan.md` for full details.
