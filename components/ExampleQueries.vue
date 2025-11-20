<script setup lang="ts">
const { t } = useI18n()

interface Props {
  examples: string[]
  hasQuery?: boolean
}

defineProps<Props>()

defineEmits<{
  select: [query: string]
}>()
</script>

<template>
  <div v-if="examples && examples.length > 0">
    <h3 class="text-lg font-semibold text-white mb-4">
      {{ hasQuery ? t('search.orTryAsking') : t('search.tryAsking') }}
    </h3>
    <div class="flex flex-wrap gap-3">
      <button
        v-for="example in examples"
        :key="example"
        class="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
        @click="$emit('select', example)"
      >
        {{ example }}
      </button>
    </div>
  </div>
</template>
