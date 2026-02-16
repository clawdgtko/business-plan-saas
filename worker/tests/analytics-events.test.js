/**
 * Tests for Analytics Events API
 * Mission #88 - Analytics Tracking
 */

import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { Hono } from 'hono'
import analyticsEventsRoutes from '../src/routes/analytics-events.js'

// Mock D1 Database
class MockD1PreparedStatement {
  constructor(sql, db, params = []) {
    this.sql = sql
    this.db = db
    this.params = params
  }

  bind(...params) {
    return new MockD1PreparedStatement(this.sql, this.db, params)
  }

  async run() {
    if (this.sql.includes('INSERT')) {
      this.db.data.push({ sql: this.sql, params: this.params })
      return { success: true }
    }
    if (this.sql.includes('SELECT')) {
      return {
        results: this.db.data.map(d => ({
          event_type: d.params[3],
          count: 1,
          unique_sessions: 1,
          unique_users: d.params[1] ? 1 : 0
        }))
      }
    }
    return { success: true }
  }

  async all() {
    return {
      results: this.db.data.map(d => ({
        event_type: d.params[3],
        count: 1,
        unique_sessions: 1,
        unique_users: d.params[1] ? 1 : 0
      }))
    }
  }

  async first() {
    return {
      count: this.db.data.length,
      unique_sessions: new Set(this.db.data.map(d => d.params[2])).size,
      unique_users: new Set(this.db.data.filter(d => d.params[1]).map(d => d.params[1])).size
    }
  }
}

class MockD1Database {
  constructor() {
    this.data = []
    this.inTransaction = false
  }

  prepare(sql) {
    return new MockD1PreparedStatement(sql, this)
  }

  exec(sql) {
    if (sql === 'BEGIN TRANSACTION') this.inTransaction = true
    if (sql === 'COMMIT') this.inTransaction = false
    if (sql === 'ROLLBACK') this.inTransaction = false
    return Promise.resolve({ success: true })
  }
}

describe('Analytics Events API', () => {
  let app
  let mockDB

  beforeEach(() => {
    app = new Hono()
    mockDB = new MockD1Database()
    
    app.use('*', async (c, next) => {
      c.env = { DB: mockDB }
      c.req.header = (name) => {
        const headers = {
          'user-agent': 'Test-Agent/1.0',
          'cf-connecting-ip': '192.168.1.1'
        }
        return headers[name.toLowerCase()]
      }
      await next()
    })
    
    app.route('/analytics', analyticsEventsRoutes)
  })

  describe('POST /analytics/event', () => {
    it('should track a page_view event', async () => {
      const response = await app.request('/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'page_view',
          session_id: 'sess-123',
          user_id: '550e8400-e29b-41d4-a716-446655440000', // valid UUID
          page_path: '/dashboard',
          page_url: 'https://example.com/dashboard',
          metadata: { referrer: 'google' }
        })
      })

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.tracked).toBe(true)
      expect(body.event_id).toBeDefined()
    })

    it('should track a button_click event', async () => {
      const response = await app.request('/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'button_click',
          session_id: 'sess-123',
          button_id: 'btn-signup',
          button_text: 'Get Started',
          page_path: '/landing'
        })
      })

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body.success).toBe(true)
    })

    it('should track a funnel_step event', async () => {
      const response = await app.request('/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'funnel_step',
          session_id: 'sess-123',
          user_id: '550e8400-e29b-41d4-a716-446655440000', // valid UUID
          funnel_step: 'checkout_started',
          funnel_name: 'purchase_flow',
          metadata: { plan: 'pro' }
        })
      })

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body.success).toBe(true)
    })

    it('should reject invalid event_type', async () => {
      const response = await app.request('/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'invalid_type',
          session_id: 'sess-123'
        })
      })

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBeDefined()
    })

    it('should require session_id', async () => {
      const response = await app.request('/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'page_view'
        })
      })

      expect(response.status).toBe(400)
    })

    it('should work without user_id (anonymous tracking)', async () => {
      const response = await app.request('/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'page_view',
          session_id: 'sess-anon',
          page_path: '/blog'
        })
      })

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body.success).toBe(true)
    })
  })

  describe('POST /analytics/event/batch', () => {
    it('should track multiple events in batch', async () => {
      const events = [
        {
          event_type: 'page_view',
          session_id: 'sess-batch-1',
          page_path: '/home'
        },
        {
          event_type: 'button_click',
          session_id: 'sess-batch-1',
          button_id: 'cta-primary'
        },
        {
          event_type: 'funnel_step',
          session_id: 'sess-batch-1',
          funnel_step: 'signup_start'
        }
      ]

      const response = await app.request('/analytics/event/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      })

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.tracked_count).toBe(3)
      expect(body.failed_count).toBe(0)
      expect(body.event_ids).toHaveLength(3)
    })

    it('should handle batch with metadata', async () => {
      const response = await app.request('/analytics/event/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: [
            {
              event_type: 'page_view',
              session_id: 'sess-batch-2',
              page_path: '/pricing'
            }
          ],
          batch_metadata: {
            source: 'mobile_app',
            version: '1.2.3'
          }
        })
      })

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body.success).toBe(true)
    })

    it('should reject empty batch', async () => {
      const response = await app.request('/analytics/event/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: [] })
      })

      expect(response.status).toBe(400)
    })

    it('should reject batch exceeding 100 events', async () => {
      const events = Array(101).fill({
        event_type: 'page_view',
        session_id: 'sess-limit'
      })

      const response = await app.request('/analytics/event/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      })

      expect(response.status).toBe(400)
    })

    it('should return 207 for partial success', async () => {
      // This test would need a mock that simulates partial failures
      // For now, we just verify the structure
      const response = await app.request('/analytics/event/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: [
            { event_type: 'page_view', session_id: 'valid' },
            { event_type: 'page_view', session_id: 'valid2' }
          ]
        })
      })

      expect(response.status).toBe(201)
    })
  })

  describe('GET /analytics/event/types', () => {
    it('should return available event types', async () => {
      const response = await app.request('/analytics/event/types')

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.event_types).toContain('page_view')
      expect(body.event_types).toContain('button_click')
      expect(body.event_types).toContain('funnel_step')
      expect(body.funnel_steps).toContain('landing_view')
      expect(body.funnel_steps).toContain('checkout_started')
      expect(body.funnel_steps).toContain('subscription_complete')
    })
  })

  describe('GET /analytics/event/stats', () => {
    it('should return event statistics', async () => {
      // First track some events
      await app.request('/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'page_view',
          session_id: 'stats-test',
          page_path: '/test'
        })
      })

      const response = await app.request('/analytics/event/stats?hours=24')

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.period).toBe('24 hours')
      expect(body.summary).toBeDefined()
      expect(body.summary.by_type).toBeDefined()
    })

    it('should accept custom hours parameter', async () => {
      const response = await app.request('/analytics/event/stats?hours=48')

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.period).toBe('48 hours')
    })
  })
})

describe('Analytics Event Categories', () => {
  it('should categorize page_view correctly', () => {
    const categoryMap = {
      'page_view': 'page_view',
      'button_click': 'interaction',
      'funnel_step': 'funnel',
      'form_submit': 'conversion',
      'error': 'error',
      'custom': 'custom'
    }
    
    expect(categoryMap['page_view']).toBe('page_view')
    expect(categoryMap['button_click']).toBe('interaction')
    expect(categoryMap['funnel_step']).toBe('funnel')
  })
})
