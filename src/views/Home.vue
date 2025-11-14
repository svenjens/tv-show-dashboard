<template>
  <div class="min-h-screen bg-gray-50">
    <SkipToContent />
    
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-primary-600 to-primary-800 text-white" role="banner">
      <div class="max-w-7xl mx-auto px-4 py-12">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ t('home.title') }}</h1>
            <p class="text-lg md:text-xl text-primary-100 mb-8">
              {{ t('home.subtitle') }}
            </p>
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
    <main id="main-content" class="max-w-7xl mx-auto py-8" tabindex="-1">
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
            {{ t('home.showsCount', { count: showsStore.showsCount, genres: showsStore.genres.length }) }}
          </p>
        </div>

        <GenreRow
          v-for="genre in showsStore.genres"
          :key="genre"
          :genre="genre"
          :shows="showsStore.getShowsByGenre(genre)"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16 px-4" role="status">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">{{ t('home.noShows') }}</h3>
        <p class="mt-1 text-sm text-gray-500">{{ t('home.noShowsMessage') }}</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useShowsStore } from '@/stores'
import { useSearchStore } from '@/stores'
import { useSEO } from '@/composables'
import GenreRow from '@/components/GenreRow.vue'
import SearchBar from '@/components/SearchBar.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import SkipToContent from '@/components/SkipToContent.vue'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()
const showsStore = useShowsStore()
const searchStore = useSearchStore()
const searchQuery = ref('')

// SEO
useSEO({
  title: 'TV Show Dashboard - Discover thousands of TV shows',
  description: 'Explore and discover thousands of TV shows organized by genre. Search, browse, and find detailed information about your favorite series.',
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

