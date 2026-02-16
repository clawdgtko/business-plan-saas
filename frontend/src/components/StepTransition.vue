<template>
  <transition
    :name="direction === 'forward' ? 'slide-forward' : 'slide-backward'"
    mode="out-in"
  >
    <slot />
  </transition>
</template>

<script setup>
defineProps({
  direction: {
    type: String,
    default: 'forward', // 'forward' | 'backward'
    validator: (value) => ['forward', 'backward'].includes(value)
  }
})
</script>

<style scoped>
/* Forward slide (next) */
.slide-forward-enter-active,
.slide-forward-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-forward-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-forward-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Backward slide (previous) */
.slide-backward-enter-active,
.slide-backward-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-backward-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-backward-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
