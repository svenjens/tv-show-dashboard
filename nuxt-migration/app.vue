<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Initialize dark mode on app mount
const { initDarkMode } = useDarkMode()

onMounted(() => {
  initDarkMode()
})
</script>

