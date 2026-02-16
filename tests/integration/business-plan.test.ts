/**
 * 📊 Tests d'Intégration - Business Plan API
 * 
 * Objectif: Tester CRUD business plans + validation Zod
 * Coverage: GET /, POST /, GET /:id, PUT /:id/:section, DELETE /:id
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import businessPlanRoutes from '../../worker/src/routes/business-plan.js'

describe('Business Plan API - CRUD', () => {
  let app
  let mockDb
  let jwtSecret = 'test-secret-32-chars-long-key!!'

  beforeEach(() => {
    mockDb = createMockDb()
    app = new Hono()
    
    // Mock auth middleware - inject user
    app.use('*', async (c, next) => {
      const authHeader = c.req.header('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.slice(7)
          const payload = await verifyToken(token, jwtSecret)
          c.set('user', payload)
          await next()
        } catch (e) {
          return c.json({ error: 'Token invalide' }, 401)
        }
      } else {
        return c.json({ error: 'Non authentifié' }, 401)
      }
    })
    
    app.route('/api/business-plans', businessPlanRoutes)
  })

  describe('GET /api/business-plans', () => {
    it('retourne 401 si non authentifié', async () => {
      const response = await app.request(
        '/api/business-plans',
        {},
        { DB: mockDb }
      )

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Non authentifié')
    })

    it('retourne une liste vide si pas de business plans', async () => {
      const token = await createTestToken({ userId: 'user-1', email: 'test@example.com' })
      
      const response = await app.request(
        '/api/business-plans',
        { headers: { 'Authorization': `Bearer ${token}` } },
        { DB: mockDb, JWT_SECRET: jwtSecret }
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.businessPlans).toEqual([])
    })

    it('retourne uniquement les business plans du user', async () => {
      const user1Token = await createTestToken({ userId: 'user-1', email: 'user1@example.com' })
      const user2Token = await createTestToken({ userId: 'user-2', email: 'user2@example.com' })

      // Créer des BP pour user-1
      mockDb.businessPlans.push(
        { id: 'bp-1', user_id: 'user-1', name: 'BP User 1', data: '{}', progress: 0 },
        { id: 'bp-2', user_id: 'user-1', name: 'BP User 1 bis', data: '{}', progress: 50 }
      )
      // Créer un BP pour user-2
      mockDb.businessPlans.push(
        { id: 'bp-3', user_id: 'user-2', name: 'BP User 2', data: '{}', progress: 0 }
      )

      const response = await app.request(
        '/api/business-plans',
        { headers: { 'Authorization': `Bearer ${user1Token}` } },
        { DB: mockDb, JWT_SECRET: jwtSecret }
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.businessPlans).toHaveLength(2)
      expect(data.businessPlans.map(bp => bp.id)).toContain('bp-1')
      expect(data.businessPlans.map(bp => bp.id)).toContain('bp-2')
      expect(data.businessPlans.map(bp => bp.id)).not.toContain('bp-3')
    })
  })

  describe('POST /api/business-plans', () => {
    it('retourne 401 si non authentifié', async () => {
      const response = await app.request(
        '/api/business-plans',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Mon BP' })
        },
        { DB: mockDb }
      )

      expect(response.status).toBe(401)
    })

    it('retourne 400 si données invalides (validation Zod)', async () => {
      const token = await createTestToken({ userId: 'user-1', email: 'test@example.com' })

      const response = await app.request(
        '/api/business-plans',
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: 123 }) // name doit être string
        },
        { DB: mockDb, JWT_SECRET: jwtSecret }
      )

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Validation')
      expect(data.details).toBeDefined()
    })

    it('retourne 400 si JSON invalide', async () => {
      const token = await createTestToken({ userId: 'user-1', email: 'test@example.com' })

      const response = await app.request(
        '/api/business-plans',
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: 'not-valid-json'
        },
        { DB: mockDb, JWT_SECRET: jwtSecret }
      )

      expect(response.status).toBe(400)
    })

    it('crée un business plan avec nom personnalisé', async () => {
      const token = await createTestToken({ userId: 'user-1', email: 'test@example.com' })

      const response = await app.request(
        '/api/business-plans',
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: 'Mon Super Business Plan' })
        },
        { DB: mockDb, JWT_SECRET: jwtSecret }
      )

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.id).toBeDefined()
      expect(data.name).toBe('Mon Super Business Plan')
      expect(data.status).toBe('created')
      expect(data.createdAt).toBeDefined()

      // Vérifier en DB
      expect(mockDb.businessPlans).toHaveLength(1)
      expect(mockDb.businessPlans[0].name).toBe('Mon Super Business Plan')
      expect(mockDb.businessPlans[0].user_id).toBe('user-1')
    })

    it('utilise le nom par défaut si non fourni', async () => {
      const token = await createTestToken({ userId: 'user-1', email: 'test@example.com' })

      const response = await app.request(
        '/api/business-plans',
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        },
        { DB: mockDb, JWT_SECRET: jwtSecret }
      )

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.name).toBe('Mon Business Plan')
    })
  })

  describe('GET /api/business-plans/:id', () => {
    it('retourne 404 si business plan inexistant', async () => {
      const token = await createTestToken({ userId: 'user-1', email: 'test@example.com' })

      const response = await app.request(
        '/api/business-plans/non-existent-id',
        { headers: { 'Authorization': `Bearer ${token}` } },
        { DB: mockDb, JWT_SECRET: jwtSecret }
      )

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Business plan non trouvé')
    })

    it('retourne 404 si business plan appartient à un autre user', async () => {
      const token = await createTestToken({ userId: 'user-1', email: 'test@example.com' })
      
      // Créer un BP pour user-2
      mockDb.businessPlans.push({
        id: 'bp-user2',
        user_id: 'user-2',
        name: 'BP User 2',
        data: JSON.stringify({ businessInfo: { name: 'Test' } }),
        progress: 30,
        status: 'draft'
      })

      const response = await app.request(
        '/api/business-plans/bp-user2',
        { headers: { 'Authorization': `Bearer ${token}` } },
        { DB: mockDb, JWT_SECRET: jwtSecret }
      )

      expect(response.status).toBe(404)
    })

    it('retourne le business plan avec toutes ses données', async () => {
      const token = await createTestToken({ userId: 'user-1', email: 'test@example.com' })
      
      mockDb.businessPlans.push({
        id: 'bp-1',
        user_id: 'user-1',
        name: 'Mon BP Test',
        data: JSON.stringify({ 
          businessInfo: { name: 'Ma Startup', description: 'Super idée' },
          market: { size: '100M' }
        }),
        progress: 33,
        status: 'draft',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T14:30:00Z'
      })

      const response = await app.request(
        '/api/business-plans/bp-1',
        { headers: { 'Authorization': `Bearer ${token}` } },
        { DB: mockDb, JWT_SECRET: jwtSecret }
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.id).toBe('bp-1')
      expect(data.name).toBe('Mon BP Test')
      expect(data.progress).toBe(33)
      expect(data.status).toBe('draft')
      expect(data.data.businessInfo.name).toBe('Ma Startup')
      expect(data.createdAt).toBe('2024-01-15T10:00:00Z')
      expect(data.updatedAt).toBe('2024-01-15T14:30:00Z')
    })
  })

  describe('PUT /api/business-plans/:id/:section', () => {
    it('retourne 404 si business plan inexistant', async () => {
      const token = await createTestToken({ userId: 'user-1', email: 'test@example.com' })

      const response = await app.request(
        '/api/business-plans/non-existent/market',
        {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ size: '1M' })
        },
        { DB: mockDb, JWT_SECRET: jwtSecret }
      )

      expect(response.status).toBe(404)
    })

    it('met à jour une section et calcule le progrès', async () => {
      const token = await createTestToken({ userId: 'user-1', email: 'test@example.com' })
      
      mockDb.businessPlans.push({
        id: 'bp-1',
        user_id: 'user-1',
        name: 'Mon BP',
        data: JSON.stringify({}),
        progress: 0,
        status: 'draft'
      })

      const response = await app.request(
        '/api/business-plans/bp-1/businessInfo',
        {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: 'Ma Startup', description: 'Super idée' })
        },
        { DB: mockDb, JWT_SECRET: jwtSecret }
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.updated).toBe(true)
      expect(data.section).toBe('businessInfo')
      // 1 section sur 3 = 33%
      expect(data.progress).toBe(33)

      // Vérifier en DB
      const bp = mockDb.businessPlans[0]
      const bpData = JSON.parse(bp.data)
      expect(bpData.businessInfo.name).toBe('Ma Startup')
      expect(bp.progress).toBe(33)
    })

    it('calcule 100% quand toutes les sections sont complétées', async () => {
      const token = await createTestToken({ userId: 'user-1', email: 'test@example.com' })
      
      mockDb.businessPlans.push({
        id: 'bp-1',
        user_id: 'user-1',
        name: 'Mon BP',
        data: JSON.stringify({}),
        progress: 0
      })

      // Ajouter les 3 sections
      const sections = ['businessInfo', 'market', 'financial']
      for (const section of sections) {
        await app.request(
          `/api/business-plans/bp-1/${section}`,
          {
            method: 'PUT',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: 'test' })
          },
          { DB: mockDb, JWT_SECRET: jwtSecret }
        )
      }

      // Vérifier que le progrès est à 100%
      expect(mockDb.businessPlans[0].progress).toBe(100)
    })

    it('merge les données existantes sans écraser', async () => {
      const token = await createTestToken({ userId: 'user-1', email: 'test@example.com' })
      
      mockDb.businessPlans.push({
        id: 'bp-1',
        user_id: 'user-1',
        name: 'Mon BP',
        data: JSON.stringify({ 
          businessInfo: { name: 'Old Name' },
          market: { size: '100M' }
        }),
        progress: 66
      })

      await app.request(
        '/api/business-plans/bp-1/businessInfo',
        {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ description: 'New description' })
        },
        { DB: mockDb, JWT_SECRET: jwtSecret }
      )

      const bpData = JSON.parse(mockDb.businessPlans[0].data)
      expect(bpData.businessInfo.name).toBe('Old Name') // Conservé
      expect(bpData.businessInfo.description).toBe('New description') // Ajouté
      expect(bpData.market.size).toBe('100M') // Autre section conservée
    })
  })

  describe('DELETE /api/business-plans/:id', () => {
    it('retourne 404 si business plan inexistant', async () => {
      const token = await createTestToken({ userId: 'user-1', email: 'test@example.com' })

      const response = await app.request(
        '/api/business-plans/non-existent',
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        },
        { DB: mockDb, JWT_SECRET: jwtSecret }
      )

      expect(response.status).toBe(404)
    })

    it('supprime le business plan et retourne confirmation', async () => {
      const token = await createTestToken({ userId: 'user-1', email: 'test@example.com' })
      
      mockDb.businessPlans.push({
        id: 'bp-1',
        user_id: 'user-1',
        name: 'Mon BP',
        data: '{}',
        progress: 50
      })

      const response = await app.request(
        '/api/business-plans/bp-1',
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        },
        { DB: mockDb, JWT_SECRET: jwtSecret }
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.deleted).toBe(true)
      expect(data.id).toBe('bp-1')

      // Vérifier que c'est supprimé
      expect(mockDb.businessPlans).toHaveLength(0)
    })

    it('ne supprime pas le BP d\'un autre utilisateur', async () => {
      const token = await createTestToken({ userId: 'user-1', email: 'test@example.com' })
      
      mockDb.businessPlans.push({
        id: 'bp-user2',
        user_id: 'user-2',
        name: 'BP User 2',
        data: '{}'
      })

      const response = await app.request(
        '/api/business-plans/bp-user2',
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        },
        { DB: mockDb, JWT_SECRET: jwtSecret }
      )

      expect(response.status).toBe(404)
      // Le BP n'est pas supprimé
      expect(mockDb.businessPlans).toHaveLength(1)
    })
  })
})

// Helper functions
async function createTestToken(payload) {
  return await sign({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 3600
  }, 'test-secret-32-chars-long-key!!')
}

async function verifyToken(token, secret) {
  const { verify } = await import('hono/jwt')
  return await verify(token, secret)
}

// Mock DB Helper
function createMockDb() {
  const businessPlans = []

  return {
    businessPlans,
    prepare: (sql) => {
      return {
        bind: (...params) => ({
          run: async () => {
            // SELECT all for user
            if (sql.includes('SELECT * FROM business_plans WHERE user_id = ? ORDER BY')) {
              return { results: businessPlans.filter(bp => bp.user_id === params[0]) }
            }
            // SELECT single
            if (sql.includes('SELECT * FROM business_plans WHERE id = ? AND user_id = ?')) {
              const bp = businessPlans.find(
                bp => bp.id === params[0] && bp.user_id === params[1]
              )
              return { results: bp ? [bp] : [] }
            }
            // INSERT
            if (sql.includes('INSERT INTO business_plans')) {
              businessPlans.push({
                id: params[0],
                user_id: params[1],
                name: params[2],
                data: params[3],
                progress: params[4],
                created_at: params[5],
                updated_at: params[6]
              })
              return { changes: 1 }
            }
            // UPDATE
            if (sql.includes('UPDATE business_plans SET data = ?')) {
              const bp = businessPlans.find(bp => bp.id === params[3])
              if (bp) {
                bp.data = params[0]
                bp.progress = params[1]
                bp.updated_at = params[2]
                return { changes: 1 }
              }
              return { changes: 0 }
            }
            // DELETE
            if (sql.includes('DELETE FROM business_plans WHERE id = ? AND user_id = ?')) {
              const idx = businessPlans.findIndex(
                bp => bp.id === params[0] && bp.user_id === params[1]
              )
              if (idx >= 0) {
                businessPlans.splice(idx, 1)
                return { changes: 1 }
              }
              return { changes: 0 }
            }
            return { changes: 0 }
          },
          first: async () => {
            if (sql.includes('SELECT * FROM business_plans WHERE id = ? AND user_id = ?')) {
              return businessPlans.find(
                bp => bp.id === params[0] && bp.user_id === params[1]
              ) || null
            }
            return null
          },
          all: async () => {
            if (sql.includes('SELECT * FROM business_plans WHERE user_id = ?')) {
              return { results: businessPlans.filter(bp => bp.user_id === params[0]) }
            }
            return { results: [] }
          }
        })
      }
    }
  }
}
