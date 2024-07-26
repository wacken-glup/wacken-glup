import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import ActsView from '../views/ActsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
        path: '/',
        name: 'overview',
        component: HomeView,
        meta: {
          navId: "home",
          requiresAuth: false
        }
    },
    {
      path: '/acts',
      name: 'acts',
      component: ActsView,
      meta: {
        navId: "acts",
        requiresAuth: false
      }
    },
    {
      path: '/swiper',
      name: 'swiper',
      component: () => import('../views/SwiperView.vue')
    },
    {
      path: '/members',
      name: 'members',
      component: () => import('../views/MembersView.vue'),
      meta: {
        navId: "members"
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: {
        navId: "settings"
      }
    },

    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: {
        navId: "login",
        requiresAuth: false
      }
    },
    {
      path: '/login/mail',
      name: 'login via mail',
      component: () => import('../views/login/LoginMailView.vue'),
      meta: {
        navId: "login",
        requiresAuth: false
      }
    },

    {
      path: '/join',
      name: 'join',
      component: () => import('../views/JoinView.vue'),
      meta: {
        requiresAuth: false,
        hideNavigation: true
      }
    }
  ]
})

export default router
