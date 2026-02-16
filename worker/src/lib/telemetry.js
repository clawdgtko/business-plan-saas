const WINDOW_MS = 60_000
const ALERT_THRESHOLD = 0.05
const ALERT_COOLDOWN_MS = 60_000
const MIN_REQUESTS_FOR_ALERT = 20

const globalStore = globalThis

function initStore() {
  if (!globalStore.__telemetryStore) {
    globalStore.__telemetryStore = {
      startedAt: Date.now(),
      totalRequests: 0,
      totalErrors: 0,
      totalDurationMs: 0,
      byStatus: {},
      window: {
        startedAt: Date.now(),
        totalRequests: 0,
        totalErrors: 0,
        totalDurationMs: 0
      },
      lastAlertAt: 0
    }
  }
  return globalStore.__telemetryStore
}

function rollWindow(store, now) {
  if (now - store.window.startedAt >= WINDOW_MS) {
    store.window = {
      startedAt: now,
      totalRequests: 0,
      totalErrors: 0,
      totalDurationMs: 0
    }
  }
}

function shouldAlert(store, now) {
  if (store.window.totalRequests < MIN_REQUESTS_FOR_ALERT) {
    return false
  }

  const errorRate = store.window.totalErrors / store.window.totalRequests
  if (errorRate <= ALERT_THRESHOLD) {
    return false
  }

  return now - store.lastAlertAt >= ALERT_COOLDOWN_MS
}

function emitAlert(store, context) {
  const errorRate = store.window.totalErrors / store.window.totalRequests
  store.lastAlertAt = Date.now()

  console.error(JSON.stringify({
    timestamp: new Date(store.lastAlertAt).toISOString(),
    level: 'alert',
    message: 'error_rate_high',
    threshold: ALERT_THRESHOLD,
    errorRate,
    windowRequests: store.window.totalRequests,
    windowErrors: store.window.totalErrors,
    requestContext: context
  }))
}

export function recordRequest({ status, durationMs, method, path, requestId }) {
  const store = initStore()
  const now = Date.now()

  rollWindow(store, now)

  store.totalRequests += 1
  store.totalDurationMs += durationMs
  store.byStatus[status] = (store.byStatus[status] || 0) + 1

  store.window.totalRequests += 1
  store.window.totalDurationMs += durationMs

  const isError = status >= 500 || status === 0
  if (isError) {
    store.totalErrors += 1
    store.window.totalErrors += 1
  }

  if (shouldAlert(store, now)) {
    emitAlert(store, { method, path, requestId })
  }
}

export function getMetricsSnapshot() {
  const store = initStore()
  const now = Date.now()

  rollWindow(store, now)

  const avgResponseTimeMs = store.totalRequests
    ? Math.round(store.totalDurationMs / store.totalRequests)
    : 0

  const windowAvgResponseTimeMs = store.window.totalRequests
    ? Math.round(store.window.totalDurationMs / store.window.totalRequests)
    : 0

  const errorRate = store.totalRequests
    ? store.totalErrors / store.totalRequests
    : 0

  const windowErrorRate = store.window.totalRequests
    ? store.window.totalErrors / store.window.totalRequests
    : 0

  return {
    startedAt: new Date(store.startedAt).toISOString(),
    uptimeMs: now - store.startedAt,
    totals: {
      requests: store.totalRequests,
      errors: store.totalErrors,
      avgResponseTimeMs,
      errorRate
    },
    window: {
      durationMs: WINDOW_MS,
      requests: store.window.totalRequests,
      errors: store.window.totalErrors,
      avgResponseTimeMs: windowAvgResponseTimeMs,
      errorRate: windowErrorRate
    },
    byStatus: store.byStatus
  }
}
