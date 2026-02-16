<template>
  <div class="flex items-center gap-2 text-sm transition-all duration-300" :class="statusClass">
    <div class="relative flex items-center justify-center w-5 h-5">
      <!-- Saving spinner -->
      <svg
        v-if="status === 'saving'"
        class="w-4 h-4 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      
      <!-- Saved checkmark with animation -->
      <svg
        v-else-if="status === 'saved'"
        class="w-4 h-4 animate-check"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
      
      <!-- Idle cloud -->
      <svg
        v-else
        class="w-4 h-4 opacity-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
        />
      </svg>
    </div>
    
    <span class="font-medium">{{ statusText }}</span>
    
    <!-- Last saved time -->
    <span v-if="lastSaved && status === 'saved'" class="text-xs opacity-60">
      {{ formattedTime }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'idle', // 'idle' | 'saving' | 'saved' | 'error'
    validator: (value) => ['idle', 'saving', 'saved', 'error'].includes(value)
  },
  lastSaved: {
    type: Date,
    default: null
  }
})

const statusClass = computed(() => ({
  'text-gray-400': props.status === 'idle',
  'text-amber-500': props.status === 'saving',
  'text-emerald-500': props.status === 'saved',
  'text-red-500': props.status === 'error'
}))

const statusText = computed(() => {
  switch (props.status) {
    case 'saving':
      return 'Sauvegarde...'
    case 'saved':
      return 'Sauvegardé'
    case 'error':
      return 'Erreur de sauvegarde'
    default:
      return 'Prêt'
  }
})

const formattedTime = computed(() => {
  if (!props.lastSaved) return ''
  const now = new Date()
  const diff = Math.floor((now - props.lastSaved) / 1000)
  
  if (diff < 5) return 'à l\'instant'
  if (diff < 60) return `il y a ${diff}s`
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`
  return props.lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
})
</script>

<style scoped>
@keyframes check-bounce {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-check {
  animation: check-bounce 0.3s ease-out;
}
</style>
