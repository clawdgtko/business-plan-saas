import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

export const useBusinessPlanStore = defineStore('businessPlan', () => {
  const authStore = useAuthStore()
  
  // State
  const businessPlans = ref([])
  const currentPlan = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // Getters
  const hasPlans = computed(() => businessPlans.value.length > 0)
  
  // Actions
  async function fetchBusinessPlans() {
    loading.value = true
    error.value = null
    
    try {
      const res = await fetch(`${API_URL}/api/business-plans`, {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur')
      }
      
      businessPlans.value = data.businessPlans
      return data.businessPlans
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }
  
  async function createBusinessPlan(name) {
    loading.value = true
    error.value = null
    
    try {
      const res = await fetch(`${API_URL}/api/business-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify({ name })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur')
      }
      
      businessPlans.value.unshift(data)
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }
  
  async function fetchBusinessPlan(id) {
    loading.value = true
    error.value = null
    
    try {
      const res = await fetch(`${API_URL}/api/business-plans/${id}`, {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur')
      }
      
      currentPlan.value = data
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }
  
  async function updateSection(id, section, data) {
    error.value = null
    
    try {
      const res = await fetch(`${API_URL}/api/business-plans/${id}/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify(data)
      })
      
      const result = await res.json()
      
      if (!res.ok) {
        throw new Error(result.error || 'Erreur')
      }
      
      // Update current plan if loaded
      if (currentPlan.value && currentPlan.value.id === id) {
        currentPlan.value.data = { ...currentPlan.value.data, [section]: data }
        currentPlan.value.progress = result.progress
      }
      
      return result
    } catch (e) {
      error.value = e.message
      throw e
    }
  }
  
  async function updateBusinessPlan(id, data) {
    // Update all sections with the provided data
    return updateSection(id, 'data', data)
  }
  
  async function deleteBusinessPlan(id) {
    try {
      const res = await fetch(`${API_URL}/api/business-plans/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur')
      }
      
      businessPlans.value = businessPlans.value.filter(p => p.id !== id)
      
      if (currentPlan.value?.id === id) {
        currentPlan.value = null
      }
    } catch (e) {
      error.value = e.message
      throw e
    }
  }
  
  return {
    businessPlans,
    currentPlan,
    loading,
    error,
    hasPlans,
    fetchBusinessPlans,
    createBusinessPlan,
    fetchBusinessPlan,
    updateSection,
    updateBusinessPlan,
    deleteBusinessPlan
  }
})