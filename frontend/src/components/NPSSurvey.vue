<template>
  <!-- NPS Survey Modal -->
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="opacity-0 translate-y-8 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-8 scale-95"
  >
    <div
      v-if="isVisible"
      class="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] shadow-2xl overflow-hidden"
    >
      <!-- Header avec gradient -->
      <div class="relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-orange-500/20 to-fuchsia-500/20" />
        <div class="relative flex items-center justify-between px-5 py-4">
          <h3 class="text-sm font-semibold text-white flex items-center gap-2">
            <svg class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Quick Question
          </h3>
          <button
            @click="dismiss"
            class="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Success State -->
      <div v-if="submitted" class="p-6 text-center">
        <div class="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-bounce-in">
          <svg class="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 class="text-white font-medium mb-2">Merci beaucoup !</h4>
        <p class="text-sm text-white/60">Votre avis aide à améliorer notre service.</p>
      </div>

      <!-- Question -->
      <div v-else-if="!showReason" class="p-5">
        <p class="text-sm text-white/90 mb-4 leading-relaxed">
          Quelle est la probabilité que vous recommandiez <strong class="text-amber-400">notre service</strong> à un ami ou collègue ?
        </p>

        <!-- Scale -->
        <div class="mb-3">
          <div class="flex justify-between gap-1">
            <button
              v-for="score in 11"
              :key="score - 1"
              @click="selectScore(score - 1)"
              @mouseenter="hoverScore = score - 1"
              @mouseleave="hoverScore = -1"
              :class="[
                'w-8 h-10 rounded-lg text-sm font-bold transition-all duration-200',
                selectedScore === score - 1
                  ? getScoreClass(score - 1)
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              ]"
            >
              {{ score - 1 }}
            </button>
          </div>
        </div>

        <!-- Labels -->
        <div class="flex justify-between text-[10px] text-white/40 mb-4">
          <span>Pas du tout probable</span>
          <span>Extrêmement probable</span>
        </div>

        <!-- Legend -->
        <div class="flex justify-center gap-4 text-[10px]">
          <span class="flex items-center gap-1 text-red-400">
            <span class="w-2 h-2 rounded-full bg-red-400" />
            Détracteurs (0-6)
          </span>
          <span class="flex items-center gap-1 text-amber-400">
            <span class="w-2 h-2 rounded-full bg-amber-400" />
            Passifs (7-8)
          </span>
          <span class="flex items-center gap-1 text-emerald-400">
            <span class="w-2 h-2 rounded-full bg-emerald-400" />
            Promoteurs (9-10)
          </span>
        </div>
      </div>

      <!-- Reason Input -->
      <div v-else class="p-5">
        <p class="text-sm text-white/90 mb-3">
          Pourquoi avez-vous donné cette note ?
        </p>
        <textarea
          v-model="reason"
          rows="3"
          placeholder="Votre retour nous aide à nous améliorer..."
          class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 resize-none mb-3"
        />
        <div class="flex gap-2">
          <button
            @click="showReason = false"
            class="flex-1 py-2 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors"
          >
            Retour
          </button>
          <button
            @click="submit"
            :disabled="isSubmitting"
            class="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-fuchsia-500 text-white text-sm font-semibold shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl disabled:opacity-50"
          >
            {{ isSubmitting ? 'Envoi...' : 'Envoyer' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { submitNPS, shouldShowNPS, markNPSShown, markNPSResponded } from '../utils/feedback.js'

const isVisible = ref(false)
const selectedScore = ref(-1)
const hoverScore = ref(-1)
const showReason = ref(false)
const reason = ref('')
const isSubmitting = ref(false)
const submitted = ref(false)

function getScoreClass(score) {
  if (score <= 6) return 'bg-red-500/20 text-red-400 border border-red-500/30'
  if (score <= 8) return 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
  return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
}

function selectScore(score) {
  selectedScore.value = score
  showReason.value = true
}

function dismiss() {
  isVisible.value = false
  markNPSShown()
}

async function submit() {
  if (selectedScore.value < 0) return

  isSubmitting.value = true

  try {
    await submitNPS(selectedScore.value, reason.value.trim())
    markNPSResponded()
    submitted.value = true
    
    setTimeout(() => {
      isVisible.value = false
    }, 2500)
  } catch (err) {
    console.error('NPS submission error:', err)
  } finally {
    isSubmitting.value = false
  }
}

// Show NPS after delay
onMounted(() => {
  if (shouldShowNPS()) {
    setTimeout(() => {
      if (shouldShowNPS()) {
        isVisible.value = true
        markNPSShown()
      }
    }, 30000) // Show after 30 seconds
  }
})
</script>

<style scoped>
@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-bounce-in {
  animation: bounce-in 0.5s ease-out;
}
</style>
