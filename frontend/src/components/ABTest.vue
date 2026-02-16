<template>
  <!-- Wrapper pour les tests A/B -->
  <component :is="currentVariant.component || 'div'" v-bind="currentVariant.props || {}" v-if="currentVariant">
    <slot :variant="variant" :track="trackHandlers" />
  </component>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useABTest, ABTests } from '../utils/ab-testing.js'

const props = defineProps({
  testId: {
    type: String,
    required: true,
    validator: (value) => Object.keys(ABTests).includes(value) || value.startsWith('custom_')
  },
  variants: {
    type: Object,
    default: () => ({})
  }
})

const abTest = useABTest(props.testId)
const variant = abTest.variant

// Variante courante
const currentVariant = computed(() => {
  return props.variants[variant] || props.variants.control || {}
})

// Handlers de tracking
const trackHandlers = {
  interaction: (element) => abTest.trackInteraction(element),
  conversion: (type, value) => abTest.trackConversion(type, value)
}

onMounted(() => {
  // Track l'impression automatiquement
  abTest.trackInteraction('component_mounted')
})
</script>
