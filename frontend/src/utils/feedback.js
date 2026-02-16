/**
 * Feedback System - Issue #59
 * Système de feedback in-app pour collecter les retours utilisateurs
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

// Types de feedback supportés
export const FeedbackType = {
  GENERAL: 'general',
  BUG: 'bug',
  FEATURE: 'feature',
  UX: 'ux',
  SATISFACTION: 'satisfaction'
}

// Niveaux de satisfaction
export const SatisfactionLevel = {
  VERY_DISSATISFIED: 1,
  DISSATISFIED: 2,
  NEUTRAL: 3,
  SATISFIED: 4,
  VERY_SATISFIED: 5
}

/**
 * Soumettre un feedback utilisateur
 * @param {Object} feedback - Données du feedback
 * @param {string} feedback.type - Type de feedback
 * @param {string} feedback.message - Message utilisateur
 * @param {number} feedback.rating - Note (1-5)
 * @param {string} feedback.page - Page courante
 * @param {Object} feedback.metadata - Métadonnées additionnelles
 */
export async function submitFeedback(feedback) {
  const payload = {
    ...feedback,
    pathname: window.location.pathname,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    sessionDuration: getSessionDuration()
  }

  try {
    const response = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    })

    if (!response.ok) throw new Error('Failed to submit feedback')
    return { success: true }
  } catch (err) {
    console.error('Feedback submission error:', err)
    // Stockage local en cas d'échec
    storeFeedbackLocally(payload)
    return { success: false, error: err.message }
  }
}

/**
 * Envoyer une NPS (Net Promoter Score)
 * @param {number} score - Score NPS (0-10)
 * @param {string} reason - Raison optionnelle
 */
export async function submitNPS(score, reason = '') {
  return submitFeedback({
    type: 'nps',
    rating: score,
    message: reason,
    page: window.location.pathname
  })
}

/**
 * Tracker la satisfaction sur une action spécifique
 * @param {string} action - Nom de l'action
 * @param {number} rating - Note (1-5)
 * @param {string} comment - Commentaire optionnel
 */
export async function trackActionSatisfaction(action, rating, comment = '') {
  return submitFeedback({
    type: 'action_satisfaction',
    action,
    rating,
    message: comment,
    page: window.location.pathname
  })
}

/**
 * Vérifier si l'utilisateur devrait voir la popup NPS
 * Basé sur la fréquence et le contexte
 */
export function shouldShowNPS() {
  const lastShown = localStorage.getItem('nps_last_shown')
  const npsResponses = parseInt(localStorage.getItem('nps_response_count') || '0')
  
  // Ne pas montrer si déjà répondu 2 fois
  if (npsResponses >= 2) return false
  
  // Attendre au moins 7 jours entre chaque demande
  if (lastShown) {
    const daysSinceLastShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24)
    if (daysSinceLastShown < 7) return false
  }
  
  // Vérifier le temps passé sur le site (au moins 3 minutes)
  const sessionStart = sessionStorage.getItem('session_start')
  if (sessionStart) {
    const minutesOnSite = (Date.now() - parseInt(sessionStart)) / (1000 * 60)
    if (minutesOnSite < 3) return false
  }
  
  return true
}

/**
 * Marquer NPS comme montré
 */
export function markNPSShown() {
  localStorage.setItem('nps_last_shown', Date.now().toString())
}

/**
 * Marquer NPS comme répondu
 */
export function markNPSResponded() {
  const count = parseInt(localStorage.getItem('nps_response_count') || '0')
  localStorage.setItem('nps_response_count', (count + 1).toString())
  localStorage.setItem('nps_last_responded', Date.now().toString())
}

/**
 * Capturer une capture d'écran automatique (simplifiée)
 * Envoie les informations sur l'état de la page
 */
export function capturePageState() {
  return {
    scrollPosition: window.scrollY,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    documentHeight: document.documentElement.scrollHeight,
    url: window.location.href,
    referrer: document.referrer
  }
}

// Session tracking
function getSessionDuration() {
  const start = sessionStorage.getItem('session_start')
  if (!start) return 0
  return Math.floor((Date.now() - parseInt(start)) / 1000)
}

function storeFeedbackLocally(feedback) {
  const queue = JSON.parse(localStorage.getItem('feedback_queue') || '[]')
  queue.push(feedback)
  localStorage.setItem('feedback_queue', JSON.stringify(queue))
}

/**
 * Réessayer d'envoyer les feedbacks en attente
 */
export async function flushPendingFeedback() {
  const queue = JSON.parse(localStorage.getItem('feedback_queue') || '[]')
  if (queue.length === 0) return

  const successful = []
  
  for (const feedback of queue) {
    try {
      await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(feedback)
      })
      successful.push(feedback)
    } catch (err) {
      // Garder en file d'attente
    }
  }

  // Supprimer ceux qui ont réussi
  const remaining = queue.filter(f => !successful.includes(f))
  localStorage.setItem('feedback_queue', JSON.stringify(remaining))
}

// Initialize session tracking
if (typeof window !== 'undefined') {
  if (!sessionStorage.getItem('session_start')) {
    sessionStorage.setItem('session_start', Date.now().toString())
  }
}

export default {
  submitFeedback,
  submitNPS,
  trackActionSatisfaction,
  shouldShowNPS,
  markNPSShown,
  markNPSResponded,
  capturePageState,
  flushPendingFeedback,
  FeedbackType,
  SatisfactionLevel
}
