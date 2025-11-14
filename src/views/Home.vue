<template>
  <div class="min-h-screen bg-gray-50">
    <SkipToContent />

    <!-- Hero Section -->
    <div
      class="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white overflow-hidden"
      role="banner"
    >
      <!-- Hero Background -->
      <picture class="absolute inset-0 opacity-10" aria-hidden="true">
        <source
          type="image/webp"
          srcset="/optimized/hero-background-768.webp 768w, /optimized/hero-background-1280.webp 1280w, /optimized/hero-background.webp 1920w"
          sizes="100vw"
        />
        <img
          src="/hero-background.png"
          alt=""
          class="w-full h-full object-cover"
          aria-hidden="true"
        />
      </picture>

      <div class="relative max-w-7xl mx-auto px-4 py-12">
        <div class="flex justify-between items-start mb-6">
          <div class="flex items-center gap-4">
            <!-- Logo -->
        <picture>
          <source
            type="image/webp"
            srcset="/optimized/logo-main-64.webp 64w, /optimized/logo-main-128.webp 128w, /optimized/logo-main-256.webp 256w"
            sizes="64px"
          />
          <img
            src="/logo-main.png"
            alt="TV Show Dashboard Logo"
            class="h-16 w-16 object-contain"
          />
        </picture>
            <div>
              <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ t('home.title') }}</h1>
              <p class="text-lg md:text-xl text-primary-100 mb-8">
                {{ t('home.subtitle') }}
              </p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        <SearchBar
          v-model="searchQuery"
          :placeholder="t('home.searchPlaceholder')"
          :recent-searches="searchStore.recentSearches"
          @search="handleSearch"
          @clear-recent="searchStore.clearRecentSearches()"
        />
      </div>
    </div>

    <!-- Main Content -->
    <main id="main-content" class="max-w-7xl mx-auto py-8 overflow-visible" tabindex="-1">
      <!-- Loading State -->
      <LoadingSpinner
        v-if="showsStore.isLoading"
        :text="t('status.loadingShows')"
        :full-screen="true"
      />

      <!-- Error State -->
      <ErrorMessage
        v-else-if="showsStore.hasError"
        :message="showsStore.error?.message || t('status.error')"
        :retry="true"
        :full-screen="true"
        @retry="showsStore.fetchAllShows()"
      />

      <!-- Genre Rows -->
      <div v-else-if="showsStore.genres.length > 0" role="region" :aria-label="t('home.title')">
        <div class="px-4 md:px-0 mb-6">
          <p class="text-gray-600">
            {{
              t('home.showsCount', {
                count: showsStore.showsCount,
                genres: showsStore.genres.length,
              })
            }}
          </p>
        </div>

        <GenreRow
          v-for="genre in displayedGenres"
          :key="genre"
          :genre="genre"
          :shows="showsStore.getShowsByGenre(genre)"
        />
        
        <!-- Load More Button -->
        <div v-if="canLoadMore" class="text-center py-8">
          <button
            class="btn-primary"
            @click="loadMoreGenres"
          >
            {{ t('home.loadMore') }} ({{ remainingGenres }} {{ t('home.moreGenres') }})
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16 px-4" role="status">
        <picture>
          <source
            type="image/webp"
            srcset="/optimized/empty-state-illustration-256.webp 256w, /optimized/empty-state-illustration.webp 512w"
            sizes="192px"
          />
          <img
            src="/empty-state-illustration.png"
            alt=""
            class="mx-auto h-48 w-48 object-contain opacity-50"
            aria-hidden="true"
          />
        </picture>
        <h3 class="mt-6 text-lg font-medium text-gray-900">{{ t('home.noShows') }}</h3>
        <p class="mt-2 text-sm text-gray-500">{{ t('home.noShowsMessage') }}</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useShowsStore } from '@/stores'
import { useSearchStore } from '@/stores'
import { useSEO } from '@/composables'
import GenreRow from '@/components/GenreRow.vue'
import SearchBar from '@/components/SearchBar.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import SkipToContent from '@/components/SkipToContent.vue'

// Lazy load conditional components
const LoadingSpinner = defineAsyncComponent(() => import('@/components/LoadingSpinner.vue'))
const ErrorMessage = defineAsyncComponent(() => import('@/components/ErrorMessage.vue'))

const { t } = useI18n()

const router = useRouter()
const route = useRoute()
const showsStore = useShowsStore()
const searchStore = useSearchStore()
const searchQuery = ref('')

// Performance: Lazy load genres
const genresPerPage = 5
const visibleGenresCount = ref(genresPerPage)

const displayedGenres = computed(() => {
  return showsStore.genres.slice(0, visibleGenresCount.value)
})

const canLoadMore = computed(() => {
  return visibleGenresCount.value < showsStore.genres.length
})

const remainingGenres = computed(() => {
  return showsStore.genres.length - visibleGenresCount.value
})

function loadMoreGenres() {
  visibleGenresCount.value += genresPerPage
}

// SEO
useSEO({
  title: 'TV Show Dashboard - Discover thousands of TV shows',
  description:
    'Explore and discover thousands of TV shows organized by genre. Search, browse, and find detailed information about your favorite series.',
  keywords: ['tv shows', 'series', 'entertainment', 'genres', 'streaming'],
})

function handleSearch(query: string) {
  if (query.trim()) {
    const locale = route.params.locale || 'en'
    router.push({ name: 'search', params: { locale }, query: { q: query } })
  }
}

onMounted(() => {
  showsStore.fetchAllShows()
})
</script>
