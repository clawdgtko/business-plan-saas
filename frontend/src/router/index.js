import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Verify from '../views/Verify.vue'
import Dashboard from '../views/Dashboard.vue'
import Funnel from '../views/Funnel.vue'
import Onboarding from '../views/Onboarding.vue'
import CheckoutLogin from '../views/CheckoutLogin.vue'
import { useAuthStore } from '../stores/auth.js'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/auth/verify', name: 'Verify', component: Verify },
  { path: '/onboarding', name: 'Onboarding', component: Onboarding },
  { path: '/checkout', name: 'CheckoutLogin', component: CheckoutLogin },
  { 
    path: '/dashboard', 
    name: 'Dashboard', 
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  { 
    path: '/funnel/:id?', 
    name: 'Funnel', 
    component: Funnel
    // No requiresAuth - guests can access funnel
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Auth guard - Allow guest access to funnel
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Dashboard and payment require auth
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Save intended destination for redirect after login
    localStorage.setItem('bp_redirect_after_login', to.fullPath)
    next('/login')
  } else {
    next()
  }
})

export default router