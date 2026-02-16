<template>
  <router-view />
  
  <!-- Feedback Widget - Système de feedback in-app -->
  <FeedbackWidget />
  
  <!-- NPS Survey - Survey de satisfaction -->
  <NPSSurvey />
  
  <!-- Heatmap Overlay (mode admin uniquement) -->
  <HeatmapOverlay v-if="showHeatmap" @close="showHeatmap = false" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import FeedbackWidget from './components/FeedbackWidget.vue'
import NPSSurvey from './components/NPSSurvey.vue'
import HeatmapOverlay from './components/HeatmapOverlay.vue'
import { initAnalytics } from './utils/analytics.js'
import { initABTesting } from './utils/ab-testing.js'
import { initOnboardingAnalytics } from './utils/onboarding-analytics.js'
import { initHeatmapTracking } from './utils/heatmap.js'
import { flushPendingFeedback } from './utils/feedback.js'

const route = useRoute()
const showHeatmap = ref(false)

// Admin mode pour heatmap (via query param ou localStorage)
function checkAdminMode() {
  const urlParams = new URLSearchParams(window.location.search)
  const isAdminMode = urlParams.get('heatmap') === 'admin' || 
                      localStorage.getItem('heatmap_admin') === 'true'
  showHeatmap.value = isAdminMode
}

onMounted(() => {
  // Initialize all tracking systems
  initAnalytics()
  initABTesting()
  initOnboardingAnalytics()
  initHeatmapTracking()
  
  // Check admin mode
  checkAdminMode()
  
  // Flush pending feedback on load
  flushPendingFeedback()
  
  // Keyboard shortcut for heatmap admin (Ctrl+Shift+H)
  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'H') {
      e.preventDefault()
      showHeatmap.value = !showHeatmap.value
      localStorage.setItem('heatmap_admin', showHeatmap.value)
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
})
</script>

<style>
/* Global styles for animations */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 10px 40px -10px rgba(245, 158, 11, 0.3);
  }
  50% {
    box-shadow: 0 10px 40px -5px rgba(245, 158, 11, 0.5);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Smooth transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
