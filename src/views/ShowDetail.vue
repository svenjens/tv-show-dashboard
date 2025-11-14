<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <LoadingSpinner
      v-if="loading"
      text="Loading show details..."
      :full-screen="true"
    />

    <!-- Error State -->
    <ErrorMessage
      v-else-if="error"
      :message="error.message || 'Failed to load show details'"
      :retry="true"
      :full-screen="true"
      @retry="loadShow"
    />

    <!-- Show Details -->
    <div v-else-if="show" class="pb-12">
      <!-- Hero Section -->
      <div class="relative bg-gray-900 text-white">
        <!-- Background Image -->
        <div
          v-if="show.image?.original"
          class="absolute inset-0 opacity-20"
          :style="{
            backgroundImage: `url(${show.image.original})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }"
        ></div>

        <div class="relative max-w-7xl mx-auto px-4 py-12">
          <button
            class="inline-flex items-center gap-2 text-white hover:text-primary-300 mb-6 transition-colors"
            @click="router.back()"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          <div class="flex flex-col md:flex-row gap-8">
            <!-- Poster -->
            <div class="flex-shrink-0">
              <img
                :src="getShowImage(show, 'original')"
                :alt="show.name"
                class="w-64 rounded-lg shadow-2xl"
              />
            </div>

            <!-- Info -->
            <div class="flex-1">
              <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ show.name }}</h1>

              <div class="flex flex-wrap items-center gap-4 mb-6">
                <RatingBadge v-if="show.rating.average" :rating="show.rating.average" />
                <GenreTags v-if="show.genres" :genres="show.genres" :max-display="5" />
              </div>

              <div class="space-y-3 text-gray-200">
                <div v-if="show.premiered" class="flex items-center gap-2">
                  <span class="font-semibold">Premiered:</span>
                  <span>{{ formatDate(show.premiered) }}</span>
                  <span v-if="show.ended" class="text-gray-400">
                    - {{ formatDate(show.ended) }}
                  </span>
                </div>

                <div v-if="show.status" class="flex items-center gap-2">
                  <span class="font-semibold">Status:</span>
                  <span
                    class="px-2 py-1 rounded text-sm"
                    :class="
                      show.status === 'Running'
                        ? 'bg-green-600'
                        : 'bg-gray-600'
                    "
                  >
                    {{ show.status }}
                  </span>
                </div>

                <div v-if="show.network" class="flex items-center gap-2">
                  <span class="font-semibold">Network:</span>
                  <span>{{ show.network.name }}</span>
                </div>

                <div v-if="show.schedule" class="flex items-center gap-2">
                  <span class="font-semibold">Schedule:</span>
                  <span>{{ formatSchedule(show.schedule) }}</span>
                </div>

                <div v-if="show.runtime" class="flex items-center gap-2">
                  <span class="font-semibold">Runtime:</span>
                  <span>{{ show.runtime }} minutes</span>
                </div>
              </div>

              <div v-if="show.officialSite" class="mt-6">
                <a
                  :href="show.officialSite"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 btn-primary"
                >
                  Official Website
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Section -->
      <div class="max-w-7xl mx-auto px-4 py-12">
        <div v-if="show.summary" class="mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Summary</h2>
          <div class="prose prose-lg max-w-none text-gray-700" v-html="show.summary"></div>
        </div>

        <!-- Related Shows -->
        <div v-if="relatedShows.length > 0" class="mt-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Related Shows</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <ShowCard v-for="relatedShow in relatedShows" :key="relatedShow.id" :show="relatedShow" />
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Show Not Found</h2>
        <p class="text-gray-600 mb-6">The show you're looking for doesn't exist.</p>
        <button class="btn-primary" @click="router.push({ name: 'home' })">
          Go to Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useShowsStore } from '@/stores'
import type { Show, ApiError } from '@/types'
import { getShowImage, formatSchedule } from '@/utils'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import RatingBadge from '@/components/RatingBadge.vue'
import GenreTags from '@/components/GenreTags.vue'
import ShowCard from '@/components/ShowCard.vue'

const route = useRoute()
const router = useRouter()
const showsStore = useShowsStore()

const show = ref<Show | null>(null)
const loading = ref(true)
const error = ref<ApiError | null>(null)

const relatedShows = computed(() => {
  if (!show.value) return []
  return showsStore.getRelatedShows(show.value, 6)
})

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

async function loadShow() {
  const id = Number(route.params.id)
  if (isNaN(id)) {
    error.value = { message: 'Invalid show ID' }
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    // First try to get from store
    let showData = showsStore.getShowById(id)

    // If not in store, fetch from API
    if (!showData) {
      showData = await showsStore.fetchShowById(id)
    }

    show.value = showData
  } catch (err) {
    error.value = err as ApiError
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadShow()
})
</script>

