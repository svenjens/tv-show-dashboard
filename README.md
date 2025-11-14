# TV Show Dashboard

An Vue 3 application for browsing and searching TV shows using the TVMaze API. Built with modern web technologies and best practices.

![Vue 3](https://img.shields.io/badge/Vue-3.5-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Vite](https://img.shields.io/badge/Vite-7.2-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan)

## 🚀 Features

- **Genre-Based Browsing**: Browse TV shows organized by genre with horizontal scrollable lists
- **Show Details**: View comprehensive information about each show including ratings, schedule, and summary
- **Search Functionality**: Search for TV shows by name with real-time results
- **Responsive Design**: Fully responsive UI that works seamlessly on desktop, tablet, and mobile devices
- **Performance Optimized**: API response caching, lazy loading, and code splitting
- **Type-Safe**: Full TypeScript implementation with comprehensive type definitions
- **Well-Tested**: Extensive unit test coverage (>80%) using Vitest
- **Modern UI/UX**: Clean, intuitive interface built with Tailwind CSS

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)

To check your versions:

```bash
node --version
npm --version
```

## 🛠️ Installation

1. **Clone the repository** (or extract the provided archive):

```bash
cd tv-show-dashboard
```

2. **Install dependencies**:

```bash
npm install
```

## 🏃 Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 🧪 Testing

### Run Unit Tests

```bash
npm run test
```

### Run Tests with UI

```bash
npm run test:ui
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

## 🏗️ Architecture

### Technology Stack

| Technology | Purpose | Justification |
|------------|---------|---------------|
| **Vue 3** | Frontend framework | Latest version with Composition API for better TypeScript support and code reusability |
| **TypeScript** | Type safety | Ensures code quality, better IDE support, and fewer runtime errors |
| **Vite** | Build tool | Fast development server, optimized builds, and native ES modules support |
| **Tailwind CSS** | Styling | Utility-first approach enables rapid development with consistent design |
| **Pinia** | State management | Official Vue 3 store with simpler API than Vuex and excellent TypeScript support |
| **Vue Router** | Routing | Official router with declarative routing and navigation guards |
| **Axios** | HTTP client | Promise-based HTTP client with interceptors for centralized error handling |
| **Vitest** | Testing framework | Fast, Vite-native testing with excellent Vue component testing support |

### Project Structure

```
tv-show-dashboard/
├── src/
│   ├── api/              # API service layer
│   │   ├── tvmaze.ts     # TVMaze API client with caching
│   │   └── index.ts      # API exports
│   ├── components/       # Reusable Vue components
│   │   ├── ErrorMessage.vue
│   │   ├── GenreRow.vue
│   │   ├── GenreTags.vue
│   │   ├── LoadingSpinner.vue
│   │   ├── RatingBadge.vue
│   │   ├── SearchBar.vue
│   │   └── ShowCard.vue
│   ├── composables/      # Vue composables (reusable logic)
│   │   ├── useApi.ts     # Generic API handler
│   │   ├── useDebounce.ts
│   │   ├── useIntersectionObserver.ts
│   │   └── index.ts
│   ├── router/           # Vue Router configuration
│   │   └── index.ts
│   ├── stores/           # Pinia stores
│   │   ├── shows.ts      # Shows state management
│   │   ├── search.ts     # Search state management
│   │   └── index.ts
│   ├── types/            # TypeScript type definitions
│   │   ├── show.ts       # Show-related types
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   ├── show.ts       # Show-related utilities
│   │   └── index.ts
│   ├── views/            # Page components
│   │   ├── Home.vue      # Homepage with genre rows
│   │   ├── ShowDetail.vue # Show details page
│   │   └── Search.vue    # Search page
│   ├── __tests__/        # Unit tests
│   ├── App.vue           # Root component
│   ├── main.ts           # Application entry point
│   └── style.css         # Global styles with Tailwind
├── public/               # Static assets
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── vitest.config.ts      # Vitest configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── eslint.config.js      # ESLint configuration
└── README.md             # This file
```

### Key Architectural Decisions

#### 1. **Composition API over Options API**

The Composition API provides better TypeScript support, improved code organization, and easier logic reuse through composables.

```typescript
// Example: Composable for API calls
export function useApi<T>(apiCall: () => Promise<T>) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)
  // ... implementation
  return { data, loading, error, execute }
}
```

#### 2. **Pinia for State Management**

Pinia offers a simpler, more intuitive API than Vuex, with better TypeScript support and no need for mutations. The stores are modular and easy to test.

```typescript
// Example: Shows store
export const useShowsStore = defineStore('shows', () => {
  const allShows = ref<Show[]>([])
  const loading = ref(false)
  
  async function fetchAllShows() {
    // ... implementation
  }
  
  return { allShows, loading, fetchAllShows }
})
```

#### 3. **Service Layer Pattern**

API calls are centralized in a service layer, providing:
- Single source of truth for API endpoints
- Centralized error handling
- Response caching to minimize API calls
- Easy mocking for tests

```typescript
// Example: API service with caching
class TVMazeAPI {
  private cache: Map<string, { data: unknown; timestamp: number }>
  
  async fetchAllShows(): Promise<Show[]> {
    // Check cache first, then fetch if needed
  }
}
```

#### 4. **Utility-First CSS with Tailwind**

Tailwind CSS enables rapid development while maintaining consistency. Custom utilities are defined in the `@layer` directive for reusability.

#### 5. **TypeScript Strict Mode**

Full type safety throughout the application catches errors at compile time and provides excellent IDE support.

#### 6. **Component-Based Architecture**

Small, focused, reusable components follow the Single Responsibility Principle:
- `ShowCard` - Display a single show
- `GenreRow` - Display a row of shows for a genre
- `SearchBar` - Search input with debouncing
- `RatingBadge` - Display show rating

### Data Processing Strategy

Since the TVMaze API doesn't provide a dedicated genre endpoint:

1. **Fetch all shows** from the `/shows` endpoint
2. **Extract genres** from each show
3. **Group shows by genre** in the Pinia store
4. **Sort within genres** by rating (descending)
5. **Cache results** to minimize API calls

```typescript
export function groupShowsByGenre(shows: Show[]): ShowsByGenre {
  const grouped: ShowsByGenre = {}
  
  shows.forEach((show) => {
    show.genres.forEach((genre) => {
      if (!grouped[genre]) grouped[genre] = []
      grouped[genre].push(show)
    })
  })
  
  // Sort by rating within each genre
  Object.keys(grouped).forEach((genre) => {
    grouped[genre].sort((a, b) => 
      (b.rating?.average || 0) - (a.rating?.average || 0)
    )
  })
  
  return grouped
}
```

## 🎨 Design Decisions

### Responsive Design

- **Mobile-first approach**: Base styles target mobile, with progressive enhancement for larger screens
- **Horizontal scrolling on desktop**: Natural browsing experience similar to Netflix/Disney+
- **Grid layout on mobile**: Better touch interaction and visibility
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

### User Experience

- **Search with debouncing**: Reduces API calls and improves performance
- **Recent searches**: Quick access to previous searches stored in localStorage
- **Loading states**: Clear feedback during data fetching
- **Error handling**: User-friendly error messages with retry options
- **Smooth transitions**: Subtle animations enhance the experience without being distracting

### Performance Optimizations

1. **API Response Caching**: Reduces unnecessary API calls
2. **Lazy Loading**: Components and images load on-demand
3. **Code Splitting**: Routes are loaded dynamically
4. **Debounced Search**: Minimizes API calls during typing
5. **Virtual Scrolling**: Could be added for very large lists

## 🧩 Code Quality

### Linting and Formatting

- **ESLint**: Configured with Vue, TypeScript, and Prettier rules
- **Prettier**: Consistent code formatting across the project

Run linting:

```bash
npm run lint
```

Format code:

```bash
npm run format
```

### Testing Strategy

- **Unit Tests**: Individual functions, components, stores
- **Integration Tests**: Component interactions with stores
- **Coverage Target**: >80% code coverage

Test files are co-located with source files in the `__tests__` directory.

## 🌐 Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## 📝 API Documentation

This application uses the [TVMaze API](http://www.tvmaze.com/api):

- **Show Index**: `GET https://api.tvmaze.com/shows`
- **Show Details**: `GET https://api.tvmaze.com/shows/:id`
- **Search Shows**: `GET https://api.tvmaze.com/search/shows?q=:query`

No API key required. Rate limiting applies (20 requests per 10 seconds).

## 🚀 Deployment

The application can be deployed to any static hosting service:

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Upload the dist/ folder to Netlify
```

### GitHub Pages

```bash
npm run build
# Push the dist/ folder to gh-pages branch
```

## 🔮 Future Enhancements

Potential features for future iterations:

- [ ] User authentication and favorites
- [ ] Advanced filtering (by network, year, status)
- [ ] Episode tracking
- [ ] Show recommendations based on viewing history
- [ ] Dark mode toggle
- [ ] Internationalization (i18n)
- [ ] Progressive Web App (PWA) support
- [ ] Season and episode details
- [ ] Cast and crew information

### Node Version

This project was developed and tested with:
- Node.js v18.19.0
- npm v9.8.1

If you encounter any issues, ensure you're using compatible versions.

### Environment Variables

No environment variables are required for this project as it uses the public TVMaze API.

### Known Limitations

1. **API Rate Limiting**: The TVMaze API has rate limits (20 requests per 10 seconds)
2. **Large Dataset**: Loading all shows (~60K shows) can take a few seconds on first load
3. **No Pagination**: The show index endpoint returns all shows at once

## 🤝 Contributing

This project follows standard Git workflow:

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Ensure all tests pass
5. Create a pull request


