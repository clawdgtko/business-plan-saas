/**
 * 🔐 Tests d'Intégration - Auth API
 * 
 * Objectif: Tester le flow magic link complet
 * Coverage: POST /magic-link, GET /verify/:token, GET /me
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import authRoutes from '../../worker/src/routes/auth.js'
import { resetRateLimitStore } from '../../worker/src/routes/auth.js'

describe('Auth API - Magic Link Flow', () => {
  let app

  beforeEach(() => {
    // Reset rate limit store before each test
    resetRateLimitStore()
    app = new Hono()
    app.route('/api/auth', authRoutes)
  })

  describe('POST /api/auth/magic-link', () => {
    it('retourne 400 si email invalide', async () => {
      const response = await app.request(
        '/api/auth/magic-link',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'invalid-email' })
        },
        { ENVIRONMENT: 'test', DB: createMockDb() }
      )

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Email invalide')
    })

    it('retourne 400 si JSON invalide', async () => {
      const response = await app.request(
        '/api/auth/magic-link',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'not-valid-json'
        },
        { ENVIRONMENT: 'test', DB: createMockDb() }
      )

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('JSON invalide')
    })

    it('crée un magic link avec email valide', async () => {
      const db = createMockDb()
      const response = await app.request(
        '/api/auth/magic-link',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com' })
        },
        { ENVIRONMENT: 'test', DB: db }
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.message).toBe('Magic link envoyé')
      expect(data.devToken).toBeDefined()
      expect(data.devLink).toContain(data.devToken)

      // Vérifier que le token est stocké en DB
      expect(db.magicLinks).toHaveLength(1)
      expect(db.magicLinks[0].email).toBe('test@example.com')
      expect(db.magicLinks[0].used).toBe(false)
    })

    it('applique le rate limiting', async () => {
      const db = createMockDb()
      const env = { ENVIRONMENT: 'test', DB: db }

      // 5 requêtes OK
      for (let i = 0; i < 5; i++) {
        const res = await app.request(
          '/api/auth/magic-link',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: `test${i}@example.com` })
          },
          env
        )
        expect(res.status).toBe(200)
      }

      // 6ème requête = rate limit
      const response = await app.request(
        '/api/auth/magic-link',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test6@example.com' })
        },
        env
      )

      expect(response.status).toBe(429)
      const data = await response.json()
      expect(data.error).toBe('Trop de requêtes')
    })

    it('retourne les headers de rate limit', async () => {
      const response = await app.request(
        '/api/auth/magic-link',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com' })
        },
        { ENVIRONMENT: 'test', DB: createMockDb() }
      )

      expect(response.status).toBe(200)
      expect(response.headers.get('X-RateLimit-Limit')).toBe('5')
      expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined()
    })
  })

  describe('GET /api/auth/verify/:token', () => {
    it('retourne 400 si token invalide', async () => {
      const response = await app.request(
        '/api/auth/verify/invalid-token',
        {},
        { ENVIRONMENT: 'test', DB: createMockDb() }
      )

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Token invalide ou expiré')
    })

    it('retourne 400 si token déjà utilisé', async () => {
      const db = createMockDb()
      db.magicLinks.push({
        token: 'used-token',
        email: 'test@example.com',
        used: true,
        expires_at: new Date(Date.now() + 3600000).toISOString()
      })

      const response = await app.request(
        '/api/auth/verify/used-token',
        {},
        { ENVIRONMENT: 'test', DB: db }
      )

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Token invalide ou expiré')
    })

    it('retourne 400 si token expiré', async () => {
      const db = createMockDb()
      db.magicLinks.push({
        token: 'expired-token',
        email: 'test@example.com',
        used: false,
        expires_at: new Date(Date.now() - 3600000).toISOString() // 1h dans le passé
      })

      const response = await app.request(
        '/api/auth/verify/expired-token',
        {},
        { ENVIRONMENT: 'test', DB: db }
      )

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Token invalide ou expiré')
    })

    it('crée un utilisateur et retourne JWT si token valide', async () => {
      const db = createMockDb()
      const token = 'valid-token'
      db.magicLinks.push({
        token,
        email: 'newuser@example.com',
        used: false,
        expires_at: new Date(Date.now() + 3600000).toISOString()
      })

      const response = await app.request(
        `/api/auth/verify/${token}`,
        {},
        { ENVIRONMENT: 'test', DB: db, JWT_SECRET: 'test-secret-32-chars-long-key!!' }
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.token).toBeDefined()
      expect(data.token.length).toBeGreaterThan(10)
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe('newuser@example.com')
      expect(data.user.id).toBeDefined()

      // Vérifier que le magic link est marqué comme utilisé
      expect(db.magicLinks[0].used).toBe(true)
      // Vérifier que l'utilisateur est créé
      expect(db.users).toHaveLength(1)
      expect(db.users[0].email).toBe('newuser@example.com')
    })

    it('réutilise un utilisateur existant', async () => {
      const db = createMockDb()
      const existingUserId = 'existing-user-id'
      db.users.push({
        id: existingUserId,
        email: 'existing@example.com'
      })
      db.magicLinks.push({
        token: 'valid-token-2',
        email: 'existing@example.com',
        used: false,
        expires_at: new Date(Date.now() + 3600000).toISOString()
      })

      const response = await app.request(
        '/api/auth/verify/valid-token-2',
        {},
        { ENVIRONMENT: 'test', DB: db, JWT_SECRET: 'test-secret-32-chars-long-key!!' }
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.user.id).toBe(existingUserId)
      // Pas de nouvel utilisateur créé
      expect(db.users).toHaveLength(1)
    })
  })

  describe('GET /api/auth/me', () => {
    it('retourne 401 si pas de header Authorization', async () => {
      const response = await app.request(
        '/api/auth/me',
        {},
        { ENVIRONMENT: 'test', DB: createMockDb() }
      )

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Non authentifié')
    })

    it('retourne 401 si token invalide', async () => {
      const response = await app.request(
        '/api/auth/me',
        {
          headers: { 'Authorization': 'Bearer invalid-token' }
        },
        { ENVIRONMENT: 'test', DB: createMockDb(), JWT_SECRET: 'test-secret-32-chars-long-key!!' }
      )

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Token invalide')
    })

    it('retourne les infos utilisateur avec token valide', async () => {
      const db = createMockDb()
      const { sign } = await import('hono/jwt')
      const jwtSecret = 'test-secret-32-chars-long-key!!'
      const token = await sign({ 
        userId: 'test-user-id', 
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600
      }, jwtSecret)

      const response = await app.request(
        '/api/auth/me',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        },
        { ENVIRONMENT: 'test', DB: db, JWT_SECRET: jwtSecret }
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.user).toBeDefined()
      expect(data.user.id).toBe('test-user-id')
      expect(data.user.email).toBe('test@example.com')
    })
  })
})

// Mock DB Helper
function createMockDb() {
  const magicLinks = []
  const users = []

  return {
    magicLinks,
    users,
    prepare: (sql) => {
      return {
        bind: (...params) => ({
          run: async () => {
            // INSERT magic_links
            if (sql.includes('INSERT INTO magic_links')) {
              magicLinks.push({
                token: params[0],
                email: params[1],
                expires_at: params[2],
                used: false
              })
              return { changes: 1 }
            }
            // INSERT users
            if (sql.includes('INSERT INTO users')) {
              users.push({
                id: params[0],
                email: params[1]
              })
              return { changes: 1 }
            }
            // UPDATE magic_links
            if (sql.includes('UPDATE magic_links')) {
              const link = magicLinks.find(l => l.token === params[0])
              if (link) {
                link.used = true
                return { changes: 1 }
              }
              return { changes: 0 }
            }
            return { changes: 0 }
          },
          first: async () => {
            // SELECT magic_links
            if (sql.includes('SELECT * FROM magic_links')) {
              return magicLinks.find(l => l.token === params[0]) || null
            }
            // SELECT users
            if (sql.includes('SELECT * FROM users')) {
              return users.find(u => u.email === params[0]) || null
            }
            return null
          }
        })
      }
    }
  }
}
