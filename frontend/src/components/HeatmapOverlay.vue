<!-- Heatmap Overlay Component - Visualisation des heatmaps -->
<template>
  <div v-if="isVisible" class="fixed inset-0 z-[9999] pointer-events-none">
    <!-- Heatmap Canvas -->
    <canvas
      ref="canvasRef"
      class="absolute inset-0 w-full h-full"
      :style="{ opacity: opacity }"
    />
    
    <!-- Controls -->
    <div class="fixed top-4 right-4 bg-[#1a1a2e]/90 backdrop-blur-xl rounded-2xl border border-white/10 p-4 pointer-events-auto shadow-2xl">
      <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Heatmap Overlay
      </h3>
      
      <!-- Type selector -->
      <div class="space-y-2 mb-4">
        <label class="text-xs text-white/60">Type de données</label>
        <select
          v-model="selectedType"
          class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none"
        >
          <option value="clicks">Clicks</option>
          <option value="moves">Mouse Moves</option>
          <option value="scroll">Scroll Depth</option>
          <option value="attention">Attention Time</option>
        </select>
      </div>
      
      <!-- Opacity slider -->
      <div class="space-y-2 mb-4">
        <label class="text-xs text-white/60 flex justify-between">
          Opacité
          <span>{{ Math.round(opacity * 100) }}%</span>
        </label>
        <input
          v-model.number="opacity"
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          class="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-orange-400"
        />
      </div>
      
      <!-- Stats -->
      <div class="text-xs text-white/60 space-y-1 mb-4">
        <div class="flex justify-between">
          <span>Points:</span>
          <span class="text-white">{{ pointCount }}</span>
        </div>
        <div class="flex justify-between">
          <span>Sessions:</span>
          <span class="text-white">{{ sessionCount }}</span>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex gap-2">
        <button
          @click="refreshData"
          class="flex-1 py-2 px-3 rounded-lg bg-white/5 text-white/80 text-xs hover:bg-white/10 transition-colors"
        >
          Rafraîchir
        </button>
        <button
          @click="close"
          class="flex-1 py-2 px-3 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
    
    <!-- Legend -->
    <div class="fixed bottom-4 right-4 bg-[#1a1a2e]/90 backdrop-blur-xl rounded-xl border border-white/10 p-3 pointer-events-auto">
      <div class="flex items-center gap-2 text-xs">
        <span class="text-white/60">Faible</span>
        <div class="w-24 h-2 rounded-full bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500" />
        <span class="text-white/60">Élevé</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { getHeatmapData } from '../utils/heatmap.js'

const props = defineProps({
  pathname: {
    type: String,
    default: () => window.location.pathname
  }
})

const emit = defineEmits(['close'])

const isVisible = ref(true)
const canvasRef = ref(null)
const selectedType = ref('clicks')
const opacity = ref(0.6)
const pointCount = ref(0)
const sessionCount = ref(0)

let heatmapData = []

function close() {
  isVisible.value = false
  emit('close')
}

async function refreshData() {
  const data = await getHeatmapData(props.pathname)
  if (data) {
    heatmapData = data.events || []
    pointCount.value = heatmapData.length
    sessionCount.value = new Set(heatmapData.map(e => e.sessionId)).size
    renderHeatmap()
  }
}

function renderHeatmap() {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  
  // Set canvas size
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  canvas.style.width = `${window.innerWidth}px`
  canvas.style.height = `${window.innerHeight}px`
  
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
  
  // Filter data by type
  const filteredData = heatmapData.filter(e => {
    if (selectedType.value === 'clicks') return e.type === 'click'
    if (selectedType.value === 'moves') return e.type === 'mouse_move'
    if (selectedType.value === 'scroll') return e.type === 'scroll'
    if (selectedType.value === 'attention') return e.type === 'attention'
    return true
  })
  
  if (filteredData.length === 0) return
  
  // Draw heatmap
  if (selectedType.value === 'clicks' || selectedType.value === 'moves') {
    drawClickHeatmap(ctx, filteredData)
  } else if (selectedType.value === 'scroll') {
    drawScrollHeatmap(ctx, filteredData)
  } else if (selectedType.value === 'attention') {
    drawAttentionHeatmap(ctx, filteredData)
  }
}

function drawClickHeatmap(ctx, data) {
  const points = data.map(e => ({ x: e.x, y: e.y, intensity: 1 }))
  
  // Create heatmap gradient
  points.forEach(point => {
    const gradient = ctx.createRadialGradient(
      point.x, point.y, 0,
      point.x, point.y, 30
    )
    gradient.addColorStop(0, 'rgba(255, 0, 0, 0.1)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.05)')
    gradient.addColorStop(1, 'rgba(0, 0, 255, 0)')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(point.x, point.y, 30, 0, Math.PI * 2)
    ctx.fill()
  })
}

function drawScrollHeatmap(ctx, data) {
  // Aggregate scroll positions
  const scrollCounts = {}
  data.forEach(e => {
    const bucket = Math.floor(e.scrollY / 100) * 100
    scrollCounts[bucket] = (scrollCounts[bucket] || 0) + 1
  })
  
  const maxCount = Math.max(...Object.values(scrollCounts))
  
  Object.entries(scrollCounts).forEach(([y, count]) => {
    const intensity = count / maxCount
    const yPos = parseInt(y)
    
    const gradient = ctx.createLinearGradient(0, yPos, window.innerWidth, yPos)
    gradient.addColorStop(0, `rgba(255, ${255 - intensity * 255}, 0, ${intensity * 0.3})`)
    gradient.addColorStop(1, `rgba(255, ${255 - intensity * 255}, 0, ${intensity * 0.3})`)
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, yPos, window.innerWidth, 100)
  })
}

function drawAttentionHeatmap(ctx, data) {
  // Draw attention boxes
  data.forEach(e => {
    if (!e.element) return
    
    const element = document.querySelector(e.element.split(' > ').pop())
    if (element) {
      const rect = element.getBoundingClientRect()
      const intensity = Math.min(e.duration / 10000, 1) // Max 10s
      
      ctx.fillStyle = `rgba(255, 100, 0, ${intensity * 0.4})`
      ctx.fillRect(rect.left, rect.top, rect.width, rect.height)
      
      // Draw duration text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = '10px sans-serif'
      ctx.fillText(`${Math.round(e.duration / 1000)}s`, rect.left + 4, rect.top + 12)
    }
  })
}

// Watch for changes
watch([selectedType, opacity], renderHeatmap)

// Handle resize
let resizeTimeout
function handleResize() {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(renderHeatmap, 100)
}

onMounted(() => {
  refreshData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
