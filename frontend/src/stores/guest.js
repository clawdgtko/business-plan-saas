import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Store for guest mode - persists funnel progress without login
export const useGuestStore = defineStore('guest', () => {
  // State - persisted to localStorage
  const guestFunnelData = ref(JSON.parse(localStorage.getItem('bp_guest_funnel') || '{}'))
  const guestEmail = ref(localStorage.getItem('bp_guest_email') || null)
  
  // Getters
  const hasFunnelData = computed(() => Object.keys(guestFunnelData.value).length > 0)
  const isGuest = computed(() => !localStorage.getItem('bp_token'))
  
  // Actions
  function saveFunnelData(data) {
    guestFunnelData.value = { ...guestFunnelData.value, ...data }
    localStorage.setItem('bp_guest_funnel', JSON.stringify(guestFunnelData.value))
  }
  
  function getFunnelData() {
    return guestFunnelData.value
  }
  
  function setGuestEmail(email) {
    guestEmail.value = email
    localStorage.setItem('bp_guest_email', email)
  }
  
  function getGuestEmail() {
    return guestEmail.value
  }
  
  function clearGuestData() {
    guestFunnelData.value = {}
    guestEmail.value = null
    localStorage.removeItem('bp_guest_funnel')
    localStorage.removeItem('bp_guest_email')
  }
  
  // Called after successful login to migrate guest data
  function migrateGuestDataToUser() {
    const data = getFunnelData()
    clearGuestData()
    return data
  }
  
  return {
    guestFunnelData,
    guestEmail,
    hasFunnelData,
    isGuest,
    saveFunnelData,
    getFunnelData,
    setGuestEmail,
    getGuestEmail,
    clearGuestData,
    migrateGuestDataToUser
  }
})
