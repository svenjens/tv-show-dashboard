/**
 * Vue Router configuration
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: 'Home - TV Show Dashboard',
    },
  },
  {
    path: '/show/:id',
    name: 'show-detail',
    component: () => import('@/views/ShowDetail.vue'),
    meta: {
      title: 'Show Details - TV Show Dashboard',
    },
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/Search.vue'),
    meta: {
      title: 'Search - TV Show Dashboard',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '404 - Page Not Found',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Navigation guards
router.beforeEach((to, _from, next) => {
  // Update document title
  const title = to.meta.title
  if (title && typeof title === 'string') {
    document.title = title
  }

  next()
})

// Error handling
router.onError((error) => {
  console.error('[Router Error]', error)
})

export default router

