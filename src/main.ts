/**
 * Main application entry point
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

// Install Pinia store
app.use(createPinia())

// Install Vue Router
app.use(router)

// Mount app
app.mount('#app')

// Log app initialization
console.log('[App] TV Show Dashboard initialized')
