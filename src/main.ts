/**
 * Main application entry point
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { getCurrentLocale } from './i18n/helpers'
import './style.css'

const app = createApp(App)

// Install Pinia store
app.use(createPinia())

// Install Vue Router
app.use(router)

// Install Vue I18n
app.use(i18n)

// Set initial locale on document
document.documentElement.setAttribute('lang', getCurrentLocale())

// Mount app
app.mount('#app')

// Log app initialization
console.log('[App] TV Show Dashboard initialized')
