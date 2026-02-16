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
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-forward-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.98);
  filter: blur(4px);
}

.slide-forward-enter-to {
  opacity: 1;
  transform: translateX(0) scale(1);
  filter: blur(0);
}

.slide-forward-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
  filter: blur(0);
}

.slide-forward-leave-to {
  opacity: 0;
  transform: translateX(-40px) scale(0.98);
  filter: blur(4px);
}

/* Backward slide (previous) */
.slide-backward-enter-active,
.slide-backward-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-backward-enter-from {
  opacity: 0;
  transform: translateX(-40px) scale(0.98);
  filter: blur(4px);
}

.slide-backward-enter-to {
  opacity: 1;
  transform: translateX(0) scale(1);
  filter: blur(0);
}

.slide-backward-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
  filter: blur(0);
}

.slide-backward-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.98);
  filter: blur(4px);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .slide-forward-enter-active,
  .slide-forward-leave-active,
  .slide-backward-enter-active,
  .slide-backward-leave-active {
    transition: opacity 0.2s ease;
  }

  .slide-forward-enter-from,
  .slide-forward-leave-to,
  .slide-backward-enter-from,
  .slide-backward-leave-to {
    transform: none;
    filter: none;
  }
}
</style>
