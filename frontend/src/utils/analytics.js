/**
 * Analytics Client - Track client-side events
 * Issue #89 - Analytics: Track events conversion funnel
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

// Queue for batching events
let eventQueue = []
let flushTimeout = null

/**
 * Track an event
 * @param {string} eventType - Type of event (e.g., 'page_view', 'button_click')
 * @param {string} eventCategory - Category (e.g., 'conversion', 'engagement')
 * @param {Object} properties - Additional properties
 */
export function track(eventType, eventCategory = 'engagement', properties = {}) {
  const event = {
    eventType,
    eventCategory,
    properties: {
      ...properties,
      pathname: window.location.pathname,
      timestamp: new Date().toISOString()
    }
  }
  
  // Add to queue
  eventQueue.push(event)
  
  // Flush immediately for conversion events
  if (eventCategory === 'conversion') {
    flushEvents()
  } else {
    // Batch other events
    if (!flushTimeout) {
      flushTimeout = setTimeout(flushEvents, 5000)
    }
  }
}

/**
 * Flush queued events to server
 */
async function flushEvents() {
  if (eventQueue.length === 0) return
  
  const events = [...eventQueue]
  eventQueue = []
  clearTimeout(flushTimeout)
  flushTimeout = null
  
  try {
    // Send events individually (simple approach)
    for (const event of events) {
      await fetch(`${API_URL}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(event)
      })
    }
  } catch (err) {
    // Silently fail - don't break UX for analytics
    console.debug('Analytics flush error:', err)
  }
}

/**
 * Track page view
 */
export function trackPageView(properties = {}) {
  track('page_view', 'engagement', {
    title: document.title,
    referrer: document.referrer,
    ...properties
  })
}

/**
 * Track conversion event
 */
export function trackConversion(eventType, properties = {}) {
  track(eventType, 'conversion', properties)
}

/**
 * Track funnel step
 */
export function trackFunnel(step, properties = {}) {
  track(step, 'funnel', properties)
}

/**
 * Initialize analytics
 * - Track initial page view
 * - Set up route change tracking
 */
export function initAnalytics() {
  // Track initial page view
  trackPageView()
  
  // Track route changes (for SPA)
  let lastPath = window.location.pathname
  
  const observer = new MutationObserver(() => {
    const currentPath = window.location.pathname
    if (currentPath !== lastPath) {
      lastPath = currentPath
      trackPageView()
    }
  })
  
  observer.observe(document, { subtree: true, childList: true })
  
  // Flush on page unload
  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      // Use sendBeacon for reliable delivery on unload
      const blob = new Blob([JSON.stringify(eventQueue)], { type: 'application/json' })
      navigator.sendBeacon?.(`${API_URL}/api/analytics/track`, blob)
    }
  })
}

// Predefined events for consistency
export const AnalyticsEvents = {
  // Funnel
  LANDING_VIEW: 'landing_view',
  GUEST_FUNNEL_START: 'guest_funnel_start',
  GUEST_FUNNEL_COMPLETE: 'guest_funnel_complete',
  
  // Conversion
  SIGNUP_START: 'signup_start',
  SIGNUP_COMPLETE: 'signup_complete',
  ONBOARDING_START: 'onboarding_start',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  CHECKOUT_START: 'checkout_start',
  CHECKOUT_COMPLETE: 'checkout_complete',
  SUBSCRIPTION_COMPLETE: 'subscription_complete',
  
  // Engagement
  BP_CREATE: 'bp_create',
  BP_EDIT: 'bp_edit',
  BP_DELETE: 'bp_delete',
  PDF_DOWNLOAD: 'pdf_download',
  PDF_PREVIEW: 'pdf_preview',
}

export default {
  track,
  trackPageView,
  trackConversion,
  trackFunnel,
  initAnalytics,
  AnalyticsEvents
}
