<script setup lang="ts">
const { t } = useI18n()

interface Props {
  modelValue: boolean // true = semantic, false = regular
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <div class="flex items-center gap-3">
    <button
      :class="[
        'px-4 py-2 rounded-lg font-medium transition-all',
        !modelValue
          ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
          : 'bg-white/20 dark:bg-gray-700/50 text-white/70 hover:bg-white/30 dark:hover:bg-gray-700',
      ]"
      @click="$emit('update:modelValue', false)"
    >
      {{ t('search.regular') }}
    </button>
    <button
      :class="[
        'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
        modelValue
          ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
          : 'bg-white/20 dark:bg-gray-700/50 text-white/70 hover:bg-white/30 dark:hover:bg-gray-700',
      ]"
      @click="$emit('update:modelValue', true)"
    >
      <Icon name="heroicons:sparkles" class="w-5 h-5" />
      {{ t('search.smart') }}
    </button>
  </div>
</template>
