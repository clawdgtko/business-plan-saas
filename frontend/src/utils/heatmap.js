/**
 * Heatmap Tracking System - Issue #60
 * Tracking des interactions pour générer des heatmaps
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

// Configuration
const CONFIG = {
  // Échantillonnage: tracker 100% des utilisateurs en dev, 10% en prod
  samplingRate: import.meta.env.DEV ? 1.0 : 0.1,
  // Batch size pour l'envoi
  batchSize: 50,
  // Interval d'envoi (ms)
  flushInterval: 5000,
  // Nombre max d'événements en mémoire
  maxEvents: 500
}

// État du tracker
let isTracking = false
let eventQueue = []
let flushTimer = null
let sessionId = null
let lastMousePos = { x: 0, y: 0 }
let lastScrollPos = { x: 0, y: 0 }

// Types d'événements
export const HeatmapEventType = {
  CLICK: 'click',
  MOUSE_MOVE: 'mouse_move',
  SCROLL: 'scroll',
  HOVER: 'hover',
  ATTENTION: 'attention' // Temps passé sur un élément
}

/**
 * Initialise le heatmap tracking
 */
export function initHeatmapTracking() {
  // Vérifier l'échantillonnage
  if (Math.random() > CONFIG.samplingRate) {
    return { active: false }
  }
  
  if (isTracking) return { active: true }
  
  sessionId = generateSessionId()
  isTracking = true
  
  // Setup event listeners
  setupClickTracking()
  setupMouseTracking()
  setupScrollTracking()
  setupAttentionTracking()
  
  // Start flush timer
  startFlushTimer()
  
  // Track page info
  trackPageInfo()
  
  // Flush on unload
  window.addEventListener('beforeunload', flushEvents)
  
  return { active: true, sessionId }
}

/**
 * Track un clic
 */
function setupClickTracking() {
  document.addEventListener('click', (e) => {
    const element = getElementInfo(e.target)
    
    trackEvent({
      type: HeatmapEventType.CLICK,
      x: e.clientX,
      y: e.clientY,
      pageX: e.pageX,
      pageY: e.pageY,
      element: element.selector,
      elementText: element.text,
      elementType: element.type
    })
  }, { passive: true })
}

/**
 * Track les mouvements de souris (avec throttling)
 */
function setupMouseTracking() {
  let throttleTimer = null
  
  document.addEventListener('mousemove', (e) => {
    lastMousePos = { x: e.clientX, y: e.clientY }
    
    if (throttleTimer) return
    
    throttleTimer = setTimeout(() => {
      trackEvent({
        type: HeatmapEventType.MOUSE_MOVE,
        x: e.clientX,
        y: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY
      })
      throttleTimer = null
    }, 100) // Throttle à 100ms
  }, { passive: true })
}

/**
 * Track le scroll
 */
function setupScrollTracking() {
  let throttleTimer = null
  
  window.addEventListener('scroll', () => {
    lastScrollPos = { x: window.scrollX, y: window.scrollY }
    
    if (throttleTimer) return
    
    throttleTimer = setTimeout(() => {
      trackEvent({
        type: HeatmapEventType.SCROLL,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        viewportHeight: window.innerHeight,
        documentHeight: document.documentElement.scrollHeight
      })
      throttleTimer = null
    }, 250) // Throttle à 250ms
  }, { passive: true })
}

/**
 * Track l'attention (temps passé sur les éléments)
 */
function setupAttentionTracking() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
  }
  
  const attentionData = new Map()
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const element = entry.target
      const key = getElementPath(element)
      
      if (entry.isIntersecting) {
        // Commencer le timer
        attentionData.set(key, {
          startTime: Date.now(),
          element: getElementInfo(element)
        })
      } else {
        // Arrêter le timer et envoyer
        const data = attentionData.get(key)
        if (data) {
          const duration = Date.now() - data.startTime
          if (duration > 1000) { // Minimum 1 seconde
            trackEvent({
              type: HeatmapEventType.ATTENTION,
              element: data.element.selector,
              elementType: data.element.type,
              duration: duration
            })
          }
          attentionData.delete(key)
        }
      }
    })
  }, observerOptions)
  
  // Observer les éléments importants
  const importantSelectors = [
    'button',
    'a',
    'input',
    'textarea',
    'select',
    '[data-track-attention]',
    'h1', 'h2', 'h3',
    '.cta-button',
    '.pricing-card'
  ]
  
  setTimeout(() => {
    document.querySelectorAll(importantSelectors.join(', ')).forEach(el => {
      observer.observe(el)
    })
  }, 1000)
}

/**
 * Ajoute un événement à la file
 */
function trackEvent(eventData) {
  if (!isTracking) return
  
  const event = {
    ...eventData,
    sessionId,
    timestamp: Date.now(),
    pathname: window.location.pathname,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }
  
  eventQueue.push(event)
  
  // Limiter la taille de la file
  if (eventQueue.length > CONFIG.maxEvents) {
    eventQueue = eventQueue.slice(-CONFIG.maxEvents)
  }
  
  // Flush si batch complet
  if (eventQueue.length >= CONFIG.batchSize) {
    flushEvents()
  }
}

/**
 * Démarrer le timer de flush
 */
function startFlushTimer() {
  flushTimer = setInterval(flushEvents, CONFIG.flushInterval)
}

/**
 * Envoyer les événements au serveur
 */
async function flushEvents() {
  if (eventQueue.length === 0) return
  
  const events = [...eventQueue]
  eventQueue = []
  
  try {
    // Utiliser sendBeacon si disponible (pour beforeunload)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ events })], { 
        type: 'application/json' 
      })
      navigator.sendBeacon(`${API_URL}/api/heatmap/events`, blob)
    } else {
      await fetch(`${API_URL}/api/heatmap/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ events })
      })
    }
  } catch (err) {
    // Remettre en file si échec
    eventQueue.unshift(...events)
    if (eventQueue.length > CONFIG.maxEvents) {
      eventQueue = eventQueue.slice(-CONFIG.maxEvents)
    }
  }
}

/**
 * Track les informations de la page
 */
function trackPageInfo() {
  const pageInfo = {
    type: 'page_info',
    url: window.location.href,
    pathname: window.location.pathname,
    title: document.title,
    referrer: document.referrer,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      colorDepth: window.screen.colorDepth
    },
    devicePixelRatio: window.devicePixelRatio,
    sessionId,
    timestamp: Date.now()
  }
  
  fetch(`${API_URL}/api/heatmap/page`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(pageInfo)
  }).catch(() => {})
}

/**
 * Récupère les informations sur un élément
 */
function getElementInfo(element) {
  if (!element || element === document.body) {
    return { selector: 'body', text: '', type: 'body' }
  }
  
  const selector = getElementPath(element)
  const text = element.textContent?.trim().substring(0, 100) || ''
  const type = element.tagName?.toLowerCase() || 'unknown'
  
  return { selector, text, type }
}

/**
 * Génère un sélecteur CSS unique pour un élément
 */
function getElementPath(element) {
  if (!element) return ''
  
  const path = []
  let current = element
  
  while (current && current !== document.body) {
    let selector = current.tagName?.toLowerCase() || ''
    
    if (current.id) {
      selector += `#${current.id}`
      path.unshift(selector)
      break
    }
    
    if (current.className && typeof current.className === 'string') {
      const classes = current.className.split(' ').filter(c => c).slice(0, 2)
      if (classes.length) {
        selector += `.${classes.join('.')}`
      }
    }
    
    // Ajouter l'index si nécessaire
    if (current.parentElement) {
      const siblings = Array.from(current.parentElement.children)
        .filter(s => s.tagName === current.tagName)
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1
        selector += `:nth-of-type(${index})`
      }
    }
    
    path.unshift(selector)
    current = current.parentElement
  }
  
  return path.join(' > ')
}

/**
 * Arrêter le tracking
 */
export function stopHeatmapTracking() {
  isTracking = false
  if (flushTimer) {
    clearInterval(flushTimer)
    flushTimer = null
  }
  flushEvents()
}

/**
 * Vérifie si le tracking est actif
 */
export function isHeatmapActive() {
  return isTracking
}

/**
 * Récupère les statistiques du heatmap
 * @param {string} pathname - Page spécifique (optionnel)
 * @param {Object} filters - Filtres (deviceType, dateRange, etc.)
 */
export async function getHeatmapStats(pathname = null, filters = {}) {
  const params = new URLSearchParams()
  if (pathname) params.append('pathname', pathname)
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value)
  })
  
  try {
    const response = await fetch(
      `${API_URL}/api/heatmap/stats?${params}`,
      { credentials: 'include' }
    )
    return await response.json()
  } catch (err) {
    console.error('Failed to fetch heatmap stats:', err)
    return null
  }
}

/**
 * Récupère les données brutes pour une heatmap
 * @param {string} pathname - Page à analyser
 */
export async function getHeatmapData(pathname) {
  try {
    const response = await fetch(
      `${API_URL}/api/heatmap/data?pathname=${encodeURIComponent(pathname)}`,
      { credentials: 'include' }
    )
    return await response.json()
  } catch (err) {
    console.error('Failed to fetch heatmap data:', err)
    return null
  }
}

/**
 * Génère un rapport de scroll depth
 * @param {string} pathname - Page spécifique
 */
export async function getScrollDepthReport(pathname = null) {
  try {
    const params = pathname ? `?pathname=${encodeURIComponent(pathname)}` : ''
    const response = await fetch(
      `${API_URL}/api/heatmap/scroll-depth${params}`,
      { credentials: 'include' }
    )
    return await response.json()
  } catch (err) {
    console.error('Failed to fetch scroll depth:', err)
    return null
  }
}

/**
 * Génère un rapport des zones cliquées
 * @param {string} pathname - Page spécifique
 */
export async function getClickReport(pathname = null) {
  try {
    const params = pathname ? `?pathname=${encodeURIComponent(pathname)}` : ''
    const response = await fetch(
      `${API_URL}/api/heatmap/clicks${params}`,
      { credentials: 'include' }
    )
    return await response.json()
  } catch (err) {
    console.error('Failed to fetch click report:', err)
    return null
  }
}

function generateSessionId() {
  return `heatmap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Auto-initialize
if (typeof window !== 'undefined') {
  initHeatmapTracking()
}

export default {
  HeatmapEventType,
  initHeatmapTracking,
  stopHeatmapTracking,
  isHeatmapActive,
  getHeatmapStats,
  getHeatmapData,
  getScrollDepthReport,
  getClickReport
}
