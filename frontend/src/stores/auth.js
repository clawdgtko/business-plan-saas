import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(localStorage.getItem('bp_token') || null)
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // Getters
  const isAuthenticated = computed(() => !!token.value)
  
  // Actions
  async function requestMagicLink(email) {
    loading.value = true
    error.value = null
    
    try {
      const res = await fetch(`${API_URL}/api/auth/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur')
      }
      
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }
  
  async function verifyToken(tokenParam) {
    loading.value = true
    error.value = null
    
    try {
      const res = await fetch(`${API_URL}/api/auth/verify/${tokenParam}`)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Token invalide')
      }
      
      token.value = data.token
      user.value = data.user
      localStorage.setItem('bp_token', data.token)
      
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }
  
  async function fetchUser() {
    if (!token.value) return
    
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token.value}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        user.value = data.user
      } else {
        logout()
      }
    } catch (e) {
      logout()
    }
  }
  
  async function completeOnboarding(onboardingData) {
    loading.value = true
    error.value = null
    
    try {
      const res = await fetch(`${API_URL}/api/onboarding`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify(onboardingData)
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'onboarding')
      }
      
      // Update user with onboarding info
      user.value = { ...user.value, ...onboardingData, onboardingCompleted: true }
      
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }
  
  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('bp_token')
  }
  
  const onboardingCompleted = computed(() => {
    return user.value?.onboardingCompleted || false
  })
  
  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    onboardingCompleted,
    requestMagicLink,
    verifyToken,
    fetchUser,
    completeOnboarding,
    logout
  }
})