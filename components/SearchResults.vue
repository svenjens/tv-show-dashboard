<script setup lang="ts">
import { useSearchStore } from '@/stores'
import ShowCard from '@/components/ShowCard.vue'
import type { SearchResult } from '@/types'

interface Props {
  searchQuery: string
  filteredResults?: SearchResult[]
}

const props = withDefaults(defineProps<Props>(), {
  filteredResults: undefined,
})

const { t } = useI18n()
const searchStore = useSearchStore()

// Use filtered results if provided, otherwise use all results from store
const displayResults = computed(() => {
  return props.filteredResults || searchStore.fullResults
})
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
      {{ t('search.resultsTitle', { query: searchQuery }) }}
    </h2>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-fr">
      <ShowCard
        v-for="result in displayResults"
        :key="result.show.id"
        :show="result.show"
        :match-reason="result.matchedTerm"
      />
    </div>
  </div>
</template>
