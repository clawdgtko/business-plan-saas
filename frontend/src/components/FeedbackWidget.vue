<template>
  <!-- Feedback Button (Fixed) -->
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
    <!-- Feedback Form Modal -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div
        v-if="isOpen"
        class="mb-4 w-80 sm:w-96 rounded-2xl border border-white/10 bg-[#1a1a2e]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 class="text-sm font-semibold text-white flex items-center gap-2">
            <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Votre avis compte
          </h3>
          <button
            @click="closeFeedback"
            class="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Success State -->
        <div v-if="submitted" class="p-6 text-center">
          <div class="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 class="text-white font-medium mb-2">Merci pour votre retour !</h4>
          <p class="text-sm text-white/60">Votre feedback nous aide à améliorer l'application.</p>
        </div>

        <!-- Form -->
        <form v-else @submit.prevent="submit" class="p-5 space-y-4">
          <!-- Type Selection -->
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="type in feedbackTypes"
              :key="type.value"
              type="button"
              @click="selectedType = type.value"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                selectedType === type.value
                  ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
              ]"
            >
              {{ type.label }}
            </button>
          </div>

          <!-- Rating -->
          <div>
            <label class="text-xs text-white/60 mb-2 block">Comment évaluez-vous votre expérience ?</label>
            <div class="flex gap-1">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                @click="rating = star"
                @mouseenter="hoverRating = star"
                @mouseleave="hoverRating = 0"
                class="p-1 transition-transform hover:scale-110"
              >
                <svg
                  :class="[
                    'w-6 h-6 transition-colors',
                    (hoverRating ? star <= hoverRating : star <= rating)
                      ? 'text-amber-400 fill-current'
                      : 'text-white/20'
                  ]"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Message -->
          <div>
            <textarea
              v-model="message"
              rows="3"
              :placeholder="placeholderText"
              class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 resize-none transition-all"
            />
          </div>

          <!-- Screenshot Option -->
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="includeContext"
              type="checkbox"
              class="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-400 focus:ring-amber-400/30"
            />
            <span class="text-xs text-white/60">Inclure les informations de la page</span>
          </label>

          <!-- Error -->
          <p v-if="error" class="text-xs text-red-400 flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ error }}
          </p>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="isSubmitting || !canSubmit"
            class="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-fuchsia-500 text-white text-sm font-semibold shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            {{ isSubmitting ? 'Envoi...' : 'Envoyer mon feedback' }}
          </button>
        </form>
      </div>
    </Transition>

    <!-- Floating Button -->
    <button
      v-if="!isOpen"
      @click="openFeedback"
      class="group flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-fuchsia-500 text-white font-medium shadow-lg shadow-orange-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      <span class="text-sm">Feedback</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { submitFeedback, capturePageState } from '../utils/feedback.js'

const isOpen = ref(false)
const selectedType = ref('general')
const rating = ref(0)
const hoverRating = ref(0)
const message = ref('')
const includeContext = ref(true)
const isSubmitting = ref(false)
const submitted = ref(false)
const error = ref('')

const feedbackTypes = [
  { value: 'general', label: 'Général' },
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Idée' },
  { value: 'ux', label: 'UX/UI' }
]

const placeholderText = computed(() => {
  const placeholders = {
    general: 'Partagez votre expérience...',
    bug: 'Décrivez le problème rencontré...',
    feature: 'Quelle fonctionnalité souhaiteriez-vous ?',
    ux: 'Que pourrions-nous améliorer ?'
  }
  return placeholders[selectedType.value]
})

const canSubmit = computed(() => {
  return rating.value > 0 || message.value.trim().length > 0
})

function openFeedback() {
  isOpen.value = true
  submitted.value = false
  error.value = ''
}

function closeFeedback() {
  isOpen.value = false
  // Reset après animation
  setTimeout(() => {
    if (!submitted.value) {
      selectedType.value = 'general'
      rating.value = 0
      message.value = ''
    }
  }, 300)
}

async function submit() {
  if (!canSubmit.value) return

  isSubmitting.value = true
  error.value = ''

  try {
    const result = await submitFeedback({
      type: selectedType.value,
      rating: rating.value,
      message: message.value.trim(),
      pageContext: includeContext.value ? capturePageState() : null
    })

    if (result.success) {
      submitted.value = true
      setTimeout(() => {
        closeFeedback()
      }, 2000)
    } else {
      error.value = "Erreur lors de l'envoi. Réessayez plus tard."
    }
  } catch (err) {
    error.value = "Erreur de connexion. Votre feedback est sauvegardé."
  } finally {
    isSubmitting.value = false
  }
}
</script>
