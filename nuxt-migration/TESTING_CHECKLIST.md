# Nuxt Migration - Testing Checklist

## ✅ Build Verification
- [x] Production build succeeds (no errors)
- [x] Dev server starts successfully
- [x] No critical warnings
- [x] PostCSS configuration correct

## 🌐 Browser Testing

### Core Functionality
- [ ] Home page loads (http://localhost:3001/)
- [ ] Genre rows display correctly
- [ ] Show cards render with images
- [ ] Click on show goes to detail page
- [ ] Show detail page displays full information
- [ ] Back button works
- [ ] Search functionality works
- [ ] Genre filtering works
- [ ] Watchlist add/remove works
- [ ] Language switching (EN/NL) works
- [ ] Dark mode toggle works and persists

### Navigation
- [ ] Client-side routing (no page reload)
- [ ] Direct URL access works (SSR)
- [ ] Browser back/forward buttons work
- [ ] 404 page for invalid routes

### SSR Features
- [ ] View page source shows pre-rendered HTML
- [ ] Meta tags visible in source (SEO)
- [ ] Images have proper alt text
- [ ] Structured data (JSON-LD) present

### Performance
- [ ] Page loads feel fast
- [ ] No visible layout shifts
- [ ] Images lazy load properly
- [ ] Smooth scrolling in genre rows

## 🔧 Technical Testing

### API & Data
- [ ] TVMaze API calls work
- [ ] TMDB API calls work (if key configured)
- [ ] Streaming availability shows
- [ ] Cast information loads
- [ ] Episode list loads

### State Management
- [ ] Pinia stores work correctly
- [ ] Watchlist persists in localStorage
- [ ] Filters state updates correctly
- [ ] Search state works

### Composables
- [ ] useDarkMode works (no console errors)
- [ ] useLocation can be tested on Vercel
- [ ] useSEO updates meta tags
- [ ] useToast shows notifications

### i18n
- [ ] EN translations load
- [ ] NL translations load (default)
- [ ] Language switcher changes text
- [ ] No missing translation keys

## 🚀 Console Checks

Open browser DevTools and check:
- [ ] No JavaScript errors in console
- [ ] No 404s for assets
- [ ] No CORS errors
- [ ] Network tab shows cached assets

## 📱 Responsive Testing
- [ ] Mobile view (< 640px)
- [ ] Tablet view (640px - 1024px)
- [ ] Desktop view (> 1024px)
- [ ] Touch interactions work

## 🔍 Lighthouse Audit
Run Lighthouse on both dev and preview:
- [ ] Performance score
- [ ] Accessibility score
- [ ] Best Practices score
- [ ] SEO score

Target: All scores 90+

## 🌍 Vercel Preview Testing

After deploying to Vercel preview:
- [ ] Location detection works (check browser console)
- [ ] Correct country detected
- [ ] Streaming availability shows for detected country
- [ ] SSR works on Vercel
- [ ] All environment variables loaded

### Check Vercel Headers
Open DevTools > Network tab > Select any request > Headers:
- [ ] `x-vercel-ip-country` header present
- [ ] Location API returns correct data

## 🐛 Known Issues

### Non-Critical
1. **WebSocket Port Conflict** (Dev only)
   - Error: `Port 24678 is already in use`
   - Impact: DevTools may not work
   - Fix: Stop other dev servers or ignore (not critical)

2. **Port 3000 in use** (Dev only)
   - Dev server uses port 3001
   - No impact on functionality

### To Investigate
- [ ] PWA functionality (service worker)
- [ ] Offline mode
- [ ] Install prompt

## ✅ Success Criteria

Migration is successful if:
- [x] Production build works
- [ ] All pages load without errors
- [ ] SSR renders content server-side
- [ ] Core functionality works (search, detail, watchlist)
- [ ] Performance is same or better than SPA
- [ ] No regression in user experience

## 📝 Testing Commands

```bash
# Development server
cd nuxt-migration/
npm run dev
# Visit http://localhost:3001

# Production build
npm run build
node .output/server/index.mjs
# Visit http://localhost:3000

# Check for TypeScript errors
npx nuxi typecheck

# Check build output size
npm run build
# Look at the bundle sizes
```

## 🎯 Next Steps After Testing

1. ✅ Fix any critical issues found
2. ✅ Document any non-critical issues
3. ✅ Commit fixes to feat/nuxt-migration
4. ✅ Push to GitHub
5. ⏳ Create Vercel preview deployment
6. ⏳ Test on real Vercel infrastructure
7. ⏳ Compare Lighthouse scores
8. ⏳ Merge to main if all looks good

---

**Last Updated**: November 17, 2025
**Status**: Ready for browser testing
**Build Status**: ✅ Success

