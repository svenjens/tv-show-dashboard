<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div class="max-w-7xl mx-auto px-4 py-12">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">TV Show Dashboard</h1>
        <p class="text-lg md:text-xl text-primary-100 mb-8">
          Discover and explore thousands of TV shows organized by genre
        </p>
        
        <SearchBar
          v-model="searchQuery"
          :recent-searches="searchStore.recentSearches"
          @search="handleSearch"
          @clear-recent="searchStore.clearRecentSearches()"
        />
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-8">
      <!-- Loading State -->
      <LoadingSpinner
        v-if="showsStore.isLoading"
        text="Loading TV shows..."
        :full-screen="true"
      />

      <!-- Error State -->
      <ErrorMessage
        v-else-if="showsStore.hasError"
        :message="showsStore.error?.message || 'Failed to load TV shows'"
        :retry="true"
        :full-screen="true"
        @retry="showsStore.fetchAllShows()"
      />

      <!-- Genre Rows -->
      <div v-else-if="showsStore.genres.length > 0">
        <div class="px-4 md:px-0 mb-6">
          <p class="text-gray-600">
            Showing <span class="font-semibold">{{ showsStore.showsCount }}</span> shows across
            <span class="font-semibold">{{ showsStore.genres.length }}</span> genres
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
      <div v-else class="text-center py-16 px-4">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No TV shows found</h3>
        <p class="mt-1 text-sm text-gray-500">Try refreshing the page or check back later.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useShowsStore } from '@/stores'
import { useSearchStore } from '@/stores'
import GenreRow from '@/components/GenreRow.vue'
import SearchBar from '@/components/SearchBar.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'

const router = useRouter()
const showsStore = useShowsStore()
const searchStore = useSearchStore()
const searchQuery = ref('')

function handleSearch(query: string) {
  if (query.trim()) {
    router.push({ name: 'search', query: { q: query } })
  }
}

onMounted(() => {
  showsStore.fetchAllShows()
})
</script>

