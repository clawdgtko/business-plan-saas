<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full p-6">
      <div class="bg-white rounded-xl shadow-sm p-8 text-center">
        <div v-if="authStore.loading">
          <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="mt-4 text-gray-600">Vérification en cours...</p>
        </div>
        
        <div v-else-if="success">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="mt-4 text-xl font-semibold">Connexion réussie !</h2>
          <p class="mt-2 text-gray-600">Redirection vers votre dashboard...</p>
        </div>
        
        <div v-else>
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 class="mt-4 text-xl font-semibold">Lien invalide</h2>
          <p class="mt-2 text-gray-600">Ce lien a expiré ou est invalide.</p>
          <router-link 
            to="/login"
            class="mt-4 inline-block text-primary-600 hover:text-primary-700"
          >
            Réessayer →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const success = ref(false)

onMounted(async () => {
  const token = route.query.token
  
  if (!token) {
    return
  }
  
  try {
    await authStore.verifyToken(token)
    try {
      await authStore.fetchOnboardingStatus()
    } catch (e) {
      // Ignore onboarding status errors
    }
    success.value = true
    
    // Redirect after 1.5s
    setTimeout(() => {
      const redirectTo = localStorage.getItem('bp_redirect_after_login')
      if (redirectTo) {
        localStorage.removeItem('bp_redirect_after_login')
        router.push(redirectTo)
        return
      }
      
      if (!authStore.onboardingCompleted) {
        router.push('/onboarding')
        return
      }
      
      router.push('/dashboard')
    }, 1500)
  } catch (e) {
    // Error handled in store
  }
})
</script>
