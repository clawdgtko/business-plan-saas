/**
 * Advanced Onboarding Analytics - Issue #60
 * Tracking détaillé du parcours d'onboarding
 */

import { track } from './analytics.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

// Storage keys
const ONBOARDING_KEY = 'onboarding_progress'
const ONBOARDING_SESSION = 'onboarding_session'

// Étapes d'onboarding
export const OnboardingSteps = {
  LANDING: 'landing',
  SIGNUP_START: 'signup_start',
  SIGNUP_COMPLETE: 'signup_complete',
  EMAIL_VERIFICATION: 'email_verification',
  ONBOARDING_FORM_START: 'onboarding_form_start',
  ONBOARDING_FORM_COMPLETE: 'onboarding_form_complete',
  FUNNEL_START: 'funnel_start',
  FUNNEL_STEP_BUSINESS: 'funnel_step_business',
  FUNNEL_STEP_MARKET: 'funnel_step_market',
  FUNNEL_STEP_FINANCIAL: 'funnel_step_financial',
  FUNNEL_STEP_REVIEW: 'funnel_step_review',
  FUNNEL_COMPLETE: 'funnel_complete',
  CHECKOUT_START: 'checkout_start',
  CHECKOUT_COMPLETE: 'checkout_complete',
  FIRST_BP_GENERATED: 'first_bp_generated',
  FIRST_PDF_DOWNLOAD: 'first_pdf_download',
  DASHBOARD_FIRST_VISIT: 'dashboard_first_visit'
}

// Événements de micro-conversion
export const MicroEvents = {
  FORM_FIELD_FOCUS: 'form_field_focus',
  FORM_FIELD_COMPLETE: 'form_field_complete',
  FORM_ERROR: 'form_error',
  TOOLTIP_VIEW: 'tooltip_view',
  HELP_CLICKED: 'help_clicked',
  EXAMPLE_VIEWED: 'example_viewed',
  AUTO_SAVE_TRIGGERED: 'auto_save_triggered',
  STEP_BACK: 'step_back',
  STEP_SKIP_ATTEMPT: 'step_skip_attempt'
}

/**
 * Initialise le tracking d'onboarding
 */
export function initOnboardingAnalytics() {
  const session = {
    sessionId: generateSessionId(),
    startedAt: new Date().toISOString(),
    steps: [],
    currentStep: null
  }
  
  sessionStorage.setItem(ONBOARDING_SESSION, JSON.stringify(session))
  
  return session
}

/**
 * Track une étape d'onboarding
 * @param {string} step - Nom de l'étape
 * @param {Object} properties - Propriétés additionnelles
 */
export function trackOnboardingStep(step, properties = {}) {
  const session = getSession()
  const timestamp = new Date().toISOString()
  
  // Calculer le temps depuis la dernière étape
  const timeSinceLastStep = session.lastStepTime 
    ? Date.now() - new Date(session.lastStepTime).getTime()
    : 0
  
  const event = {
    step,
    timestamp,
    timeSinceLastStep,
    sessionId: session.sessionId,
    ...properties
  }
  
  // Mettre à jour la session
  session.steps.push(event)
  session.currentStep = step
  session.lastStepTime = timestamp
  saveSession(session)
  
  // Envoyer à l'API
  track('onboarding_step', 'funnel', event)
  
  // Sauvegarder le progrès persistant
  saveProgress(step, event)
  
  return event
}

/**
 * Track un événement micro-conversion
 * @param {string} eventType - Type d'événement
 * @param {Object} properties - Propriétés
 */
export function trackMicroEvent(eventType, properties = {}) {
  const session = getSession()
  
  const event = {
    type: eventType,
    timestamp: new Date().toISOString(),
    currentStep: session.currentStep,
    sessionId: session.sessionId,
    ...properties
  }
  
  track('onboarding_micro_event', 'engagement', event)
  
  return event
}

/**
 * Track l'engagement sur un champ de formulaire
 * @param {string} fieldName - Nom du champ
 * @param {number} timeSpent - Temps passé (ms)
 * @param {boolean} completed - Champ complété
 */
export function trackFieldEngagement(fieldName, timeSpent, completed = false) {
  return trackMicroEvent(MicroEvents.FORM_FIELD_FOCUS, {
    field: fieldName,
    timeSpent,
    completed,
    step: getSession().currentStep
  })
}

/**
 * Track une erreur de formulaire
 * @param {string} fieldName - Nom du champ
 * @param {string} errorType - Type d'erreur
 * @param {string} errorMessage - Message d'erreur
 */
export function trackFormError(fieldName, errorType, errorMessage) {
  return trackMicroEvent(MicroEvents.FORM_ERROR, {
    field: fieldName,
    errorType,
    errorMessage,
    step: getSession().currentStep
  })
}

/**
 * Track un abandon
 * @param {string} step - Étape où l'abandon a lieu
 * @param {string} reason - Raison optionnelle
 */
export function trackDropoff(step, reason = '') {
  const session = getSession()
  
  const event = {
    step,
    reason,
    timestamp: new Date().toISOString(),
    sessionDuration: Date.now() - new Date(session.startedAt).getTime(),
    completedSteps: session.steps.length,
    sessionId: session.sessionId
  }
  
  track('onboarding_dropoff', 'funnel', event)
  
  // Marquer comme abandonné
  saveProgress(`${step}_dropoff`, event)
  
  return event
}

/**
 * Track une rétrogradation (step back)
 * @param {string} fromStep - Étape de départ
 * @param {string} toStep - Étape d'arrivée
 */
export function trackStepBack(fromStep, toStep) {
  return trackMicroEvent(MicroEvents.STEP_BACK, {
    fromStep,
    toStep
  })
}

/**
 * Track un temps de complétion
 * @param {string} step - Nom de l'étape
 * @param {number} durationMs - Durée en millisecondes
 */
export function trackCompletionTime(step, durationMs) {
  const session = getSession()
  
  const event = {
    step,
    durationMs,
    durationSeconds: Math.round(durationMs / 1000),
    timestamp: new Date().toISOString(),
    sessionId: session.sessionId
  }
  
  track('onboarding_completion_time', 'performance', event)
  
  return event
}

/**
 * Calcul le taux de complétion
 * @returns {Object} Statistiques de complétion
 */
export function getCompletionStats() {
  const progress = getProgress()
  const allSteps = Object.values(OnboardingSteps)
  
  const completedSteps = allSteps.filter(step => 
    progress[step] && !step.includes('dropoff')
  )
  
  const dropoffSteps = allSteps.filter(step =>
    progress[`${step}_dropoff`]
  )
  
  return {
    totalSteps: allSteps.length,
    completedSteps: completedSteps.length,
    completionRate: (completedSteps.length / allSteps.length) * 100,
    dropoffSteps: dropoffSteps.length,
    currentStep: getSession().currentStep
  }
}

/**
 * Récupère le temps total passé sur l'onboarding
 */
export function getTotalTimeSpent() {
  const session = getSession()
  if (!session.startedAt) return 0
  
  return Date.now() - new Date(session.startedAt).getTime()
}

/**
 * Génère un rapport détaillé de l'onboarding
 */
export function generateOnboardingReport() {
  const session = getSession()
  const progress = getProgress()
  const stats = getCompletionStats()
  
  return {
    sessionId: session.sessionId,
    startedAt: session.startedAt,
    currentStep: session.currentStep,
    totalTimeSpent: getTotalTimeSpent(),
    stepsCompleted: session.steps.length,
    completionStats: stats,
    stepDetails: session.steps,
    progress: progress
  }
}

/**
 * Envoyer le rapport final
 */
export async function sendFinalReport() {
  const report = generateOnboardingReport()
  
  try {
    await fetch(`${API_URL}/api/analytics/onboarding-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(report)
    })
  } catch (err) {
    console.error('Failed to send onboarding report:', err)
  }
  
  return report
}

// Session management
function getSession() {
  const stored = sessionStorage.getItem(ONBOARDING_SESSION)
  if (stored) {
    return JSON.parse(stored)
  }
  return initOnboardingAnalytics()
}

function saveSession(session) {
  sessionStorage.setItem(ONBOARDING_SESSION, JSON.stringify(session))
}

function saveProgress(step, data) {
  const progress = getProgress()
  progress[step] = data
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(progress))
}

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '{}')
  } catch {
    return {}
  }
}

function generateSessionId() {
  return `onboarding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Hook Vue pour tracker le temps passé sur une étape
 */
export function useStepTimer(stepName) {
  const startTime = Date.now()
  
  return {
    stop: () => {
      const duration = Date.now() - startTime
      trackCompletionTime(stepName, duration)
      return duration
    }
  }
}

/**
 * Hook Vue pour tracker un champ de formulaire
 */
export function useFieldTracker(fieldName) {
  let focusTime = null
  let blurTime = null
  
  const onFocus = () => {
    focusTime = Date.now()
    trackMicroEvent(MicroEvents.FORM_FIELD_FOCUS, { field: fieldName })
  }
  
  const onBlur = (completed = false) => {
    if (focusTime) {
      const timeSpent = Date.now() - focusTime
      trackFieldEngagement(fieldName, timeSpent, completed)
      focusTime = null
    }
  }
  
  return { onFocus, onBlur }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  initOnboardingAnalytics()
}

export default {
  OnboardingSteps,
  MicroEvents,
  initOnboardingAnalytics,
  trackOnboardingStep,
  trackMicroEvent,
  trackFieldEngagement,
  trackFormError,
  trackDropoff,
  trackStepBack,
  trackCompletionTime,
  getCompletionStats,
  getTotalTimeSpent,
  generateOnboardingReport,
  sendFinalReport,
  useStepTimer,
  useFieldTracker
}
