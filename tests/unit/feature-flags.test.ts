import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { loadFeatureFlags } from '../../worker/src/config/features.js'
import { featureFlags, requireFeature } from '../../worker/src/middleware/features.js'

describe('Feature flags config', () => {
  it('returns defaults when env is empty', () => {
    const flags = loadFeatureFlags({})
    expect(flags['new-dashboard']).toBe(false)
  })

  it('loads flags from FEATURE_FLAGS JSON', () => {
    const flags = loadFeatureFlags({
      FEATURE_FLAGS: JSON.stringify({ 'new-dashboard': true })
    })

    expect(flags['new-dashboard']).toBe(true)
  })

  it('env FEATURE_FLAG_ overrides JSON config', () => {
    const flags = loadFeatureFlags({
      FEATURE_FLAGS: JSON.stringify({ 'new-dashboard': false }),
      FEATURE_FLAG_NEW_DASHBOARD: 'true'
    })

    expect(flags['new-dashboard']).toBe(true)
  })
})

describe('Feature flags middleware', () => {
  it('denies access when a feature is disabled', async () => {
    const app = new Hono()
    app.use('*', featureFlags)
    app.get('/guarded', requireFeature('new-dashboard'), (c) => c.json({ ok: true }))

    const response = await app.request(
      '/guarded',
      { method: 'GET' },
      { FEATURE_FLAGS: JSON.stringify({ 'new-dashboard': false }) }
    )

    expect(response.status).toBe(403)
  })

  it('allows access when a feature is enabled', async () => {
    const app = new Hono()
    app.use('*', featureFlags)
    app.get('/guarded', requireFeature('new-dashboard'), (c) => c.json({ ok: true }))

    const response = await app.request(
      '/guarded',
      { method: 'GET' },
      { FEATURE_FLAGS: JSON.stringify({ 'new-dashboard': true }) }
    )

    expect(response.status).toBe(200)
  })

  it('exposes flags on the context', async () => {
    const app = new Hono()
    app.use('*', featureFlags)
    app.get('/flags', (c) => c.json(c.get('features')))

    const response = await app.request(
      '/flags',
      { method: 'GET' },
      { FEATURE_FLAGS: JSON.stringify({ 'new-dashboard': true }) }
    )

    const payload = await response.json()
    expect(payload['new-dashboard']).toBe(true)
  })
})
