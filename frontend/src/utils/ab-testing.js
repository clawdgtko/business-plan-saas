/**
 * A/B Testing System - Issue #58
 * Système de test A/B pour optimiser le funnel de conversion
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

// Storage keys
const STORAGE_KEY = 'ab_test_assignments'
const SESSION_KEY = 'ab_test_session'

// Tests disponibles
export const ABTests = {
  // Test: Variantes du titre sur la landing
  LANDING_HEADLINE: {
    id: 'landing_headline',
    name: 'Landing Page Headline',
    description: 'Test different headlines to improve conversion',
    variants: [
      { id: 'control', name: 'Contrôle', weight: 0.5 },
      { id: 'variant_a', name: 'Focus Rapide', weight: 0.25 },
      { id: 'variant_b', name: 'Focus IA', weight: 0.25 }
    ]
  },
  
  // Test: Variantes du CTA sur le funnel
  FUNNEL_CTA: {
    id: 'funnel_cta',
    name: 'Funnel CTA Button',
    description: 'Test CTA button text and style',
    variants: [
      { id: 'control', name: 'Débloquer mon plan', weight: 0.5 },
      { id: 'variant_a', name: 'Générer mon PDF', weight: 0.25 },
      { id: 'variant_b', name: 'Créer mon business plan', weight: 0.25 }
    ]
  },
  
  // Test: Nombre d'étapes dans le funnel
  FUNNEL_STEPS: {
    id: 'funnel_steps',
    name: 'Funnel Step Count',
    description: 'Test 3-step vs 4-step funnel',
    variants: [
      { id: 'control', name: '4 étapes', weight: 0.5 },
      { id: 'variant_a', name: '3 étapes', weight: 0.5 }
    ]
  },
  
  // Test: Position du prix
  PRICING_DISPLAY: {
    id: 'pricing_display',
    name: 'Pricing Display Position',
    description: 'Test early vs late price reveal',
    variants: [
      { id: 'control', name: 'Révélation tardive', weight: 0.5 },
      { id: 'variant_a', name: 'Transparence immédiate', weight: 0.5 }
    ]
  },
  
  // Test: Onboarding simplifié
  ONBOARDING_FLOW: {
    id: 'onboarding_flow',
    name: 'Onboarding Flow',
    description: 'Test short vs detailed onboarding',
    variants: [
      { id: 'control', name: 'Détaillé', weight: 0.5 },
      { id: 'variant_a', name: 'Simplifié', weight: 0.5 }
    ]
  }
}

/**
 * Initialise le système A/B testing
 * Assigne l'utilisateur aux variantes de test
 */
export function initABTesting() {
  const existing = getAssignments()
  const assignments = { ...existing }
  
  // Assigner aux tests actifs
  Object.values(ABTests).forEach(test => {
    if (!assignments[test.id]) {
      assignments[test.id] = assignVariant(test)
    }
  })
  
  // Sauvegarder
  saveAssignments(assignments)
  
  // Initialiser la session
  if (!sessionStorage.getItem(SESSION_KEY)) {
    sessionStorage.setItem(SESSION_KEY, Date.now().toString())
  }
  
  return assignments
}

/**
 * Assigne une variante aléatoire selon les poids
 * @param {Object} test - Configuration du test
 */
function assignVariant(test) {
  const random = Math.random()
  let cumulative = 0
  
  for (const variant of test.variants) {
    cumulative += variant.weight
    if (random <= cumulative) {
      return {
        variantId: variant.id,
        variantName: variant.name,
        assignedAt: new Date().toISOString()
      }
    }
  }
  
  // Fallback sur le contrôle
  return {
    variantId: test.variants[0].id,
    variantName: test.variants[0].name,
    assignedAt: new Date().toISOString()
  }
}

/**
 * Récupère la variante assignée pour un test
 * @param {string} testId - ID du test
 */
export function getVariant(testId) {
  const assignments = getAssignments()
  const assignment = assignments[testId]
  
  if (!assignment) {
    // Si pas assigné, créer l'assignation
    const test = Object.values(ABTests).find(t => t.id === testId)
    if (test) {
      const newAssignment = assignVariant(test)
      assignments[testId] = newAssignment
      saveAssignments(assignments)
      return newAssignment.variantId
    }
    return 'control'
  }
  
  return assignment.variantId
}

/**
 * Vérifie si l'utilisateur est dans une variante spécifique
 * @param {string} testId - ID du test
 * @param {string} variantId - ID de la variante
 */
export function isVariant(testId, variantId) {
  return getVariant(testId) === variantId
}

/**
 * Récupère toutes les assignations
 */
function getAssignments() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

/**
 * Sauvegarde les assignations
 */
function saveAssignments(assignments) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments))
}

/**
 * Track un événement de conversion pour un test
 * @param {string} testId - ID du test
 * @param {string} event - Type d'événement (impression, click, conversion)
 * @param {Object} metadata - Métadonnées additionnelles
 */
export async function trackABTestEvent(testId, event, metadata = {}) {
  const variant = getVariant(testId)
  const sessionId = sessionStorage.getItem(SESSION_KEY)
  
  const payload = {
    testId,
    variant,
    event,
    sessionId,
    pathname: window.location.pathname,
    timestamp: new Date().toISOString(),
    metadata
  }
  
  try {
    await fetch(`${API_URL}/api/ab-test/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    })
  } catch (err) {
    // Stocker localement si échec
    storeEventLocally(payload)
  }
}

/**
 * Track une impression de variante
 * @param {string} testId - ID du test
 */
export function trackImpression(testId) {
  return trackABTestEvent(testId, 'impression')
}

/**
 * Track un clic/interaction
 * @param {string} testId - ID du test
 * @param {string} element - Élément cliqué
 */
export function trackInteraction(testId, element) {
  return trackABTestEvent(testId, 'interaction', { element })
}

/**
 * Track une conversion
 * @param {string} testId - ID du test
 * @param {string} conversionType - Type de conversion
 * @param {number} value - Valeur optionnelle
 */
export function trackConversion(testId, conversionType, value = null) {
  return trackABTestEvent(testId, 'conversion', { 
    conversionType, 
    value,
    sessionDuration: getSessionDuration()
  })
}

/**
 * Hook Vue pour utiliser un test A/B
 * @param {string} testId - ID du test
 */
export function useABTest(testId) {
  const variant = getVariant(testId)
  
  // Track impression automatiquement
  trackImpression(testId)
  
  return {
    variant,
    isControl: variant === 'control',
    is: (variantId) => variant === variantId,
    trackInteraction: (element) => trackInteraction(testId, element),
    trackConversion: (type, value) => trackConversion(testId, type, value)
  }
}

/**
 * Récupère les résultats d'un test (pour le dashboard admin)
 * @param {string} testId - ID du test
 */
export async function getTestResults(testId) {
  try {
    const response = await fetch(`${API_URL}/api/ab-test/results/${testId}`, {
      credentials: 'include'
    })
    return await response.json()
  } catch (err) {
    console.error('Failed to fetch test results:', err)
    return null
  }
}

/**
 * Réinitialise toutes les assignations (pour les tests)
 */
export function resetABTests() {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

/**
 * Force une variante spécifique (pour démo/debug)
 * @param {string} testId - ID du test
 * @param {string} variantId - ID de la variante
 */
export function forceVariant(testId, variantId) {
  const assignments = getAssignments()
  const test = Object.values(ABTests).find(t => t.id === testId)
  const variant = test?.variants.find(v => v.id === variantId)
  
  if (variant) {
    assignments[testId] = {
      variantId: variant.id,
      variantName: variant.name,
      assignedAt: new Date().toISOString(),
      forced: true
    }
    saveAssignments(assignments)
  }
}

// Helper functions
function getSessionDuration() {
  const start = sessionStorage.getItem(SESSION_KEY)
  if (!start) return 0
  return Math.floor((Date.now() - parseInt(start)) / 1000)
}

function storeEventLocally(event) {
  const queue = JSON.parse(localStorage.getItem('ab_test_queue') || '[]')
  queue.push(event)
  localStorage.setItem('ab_test_queue', JSON.stringify(queue))
}

/**
 * Réessaye d'envoyer les événements en attente
 */
export async function flushPendingEvents() {
  const queue = JSON.parse(localStorage.getItem('ab_test_queue') || '[]')
  if (queue.length === 0) return

  const successful = []
  
  for (const event of queue) {
    try {
      await fetch(`${API_URL}/api/ab-test/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(event)
      })
      successful.push(event)
    } catch (err) {
      // Garder en file d'attente
    }
  }

  const remaining = queue.filter(e => !successful.includes(e))
  localStorage.setItem('ab_test_queue', JSON.stringify(remaining))
}

// Auto-initialize
if (typeof window !== 'undefined') {
  initABTesting()
}

export default {
  ABTests,
  initABTesting,
  getVariant,
  isVariant,
  trackImpression,
  trackInteraction,
  trackConversion,
  useABTest,
  getTestResults,
  resetABTests,
  forceVariant,
  flushPendingEvents
}
