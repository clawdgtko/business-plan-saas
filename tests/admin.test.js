import { describe, it, expect, beforeEach, vi } from 'vitest'
import app from '../src/index.js'

// Mock environment
const mockEnv = {
  DB: {
    prepare: vi.fn(),
    exec: vi.fn()
  },
  JWT_SECRET: 'test-secret',
  ADMIN_EMAILS: 'admin@test.com,gtome@test.com',
  ENVIRONMENT: 'test'
}

// Helper to create JWT token for testing
async function createTestToken(payload) {
  const { sign } = await import('hono/jwt')
  return await sign(payload, mockEnv.JWT_SECRET)
}

describe('Admin Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/admin/stats', () => {
    it('should return stats for admin user', async () => {
      const token = await createTestToken({
        userId: 'admin-123',
        email: 'admin@test.com',
        exp: Math.floor(Date.now() / 1000) + 3600
      })

      // Mock DB responses
      mockEnv.DB.prepare.mockImplementation((query) => ({
        first: vi.fn().mockResolvedValue({ count: 100 }),
        all: vi.fn().mockResolvedValue({ results: [] }),
        bind: vi.fn().mockReturnThis()
      }))

      const req = new Request('http://localhost/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const res = await app.fetch(req, mockEnv)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.stats).toBeDefined()
      expect(data.stats.users).toBeDefined()
      expect(data.stats.funnel).toBeDefined()
    })

    it('should return 403 for non-admin user', async () => {
      const token = await createTestToken({
        userId: 'user-123',
        email: 'user@test.com',
        exp: Math.floor(Date.now() / 1000) + 3600
      })

      const req = new Request('http://localhost/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const res = await app.fetch(req, mockEnv)
      expect(res.status).toBe(403)

      const data = await res.json()
      expect(data.error).toContain('Admin')
    })

    it('should return 401 without token', async () => {
      const req = new Request('http://localhost/api/admin/stats')
      const res = await app.fetch(req, mockEnv)
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/admin/users', () => {
    it('should return paginated users list', async () => {
      const token = await createTestToken({
        userId: 'admin-123',
        email: 'admin@test.com',
        exp: Math.floor(Date.now() / 1000) + 3600
      })

      mockEnv.DB.prepare.mockImplementation((query) => ({
        first: vi.fn().mockResolvedValue({ count: 50 }),
        all: vi.fn().mockResolvedValue({
          results: [
            {
              id: 'user-1',
              email: 'user1@test.com',
              createdAt: '2024-01-01',
              subscriptionPlan: 'starter',
              subscriptionStatus: 'active',
              businessPlansCount: 2
            }
          ]
        }),
        bind: vi.fn().mockReturnThis()
      }))

      const req = new Request('http://localhost/api/admin/users?page=1&limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const res = await app.fetch(req, mockEnv)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.users).toBeDefined()
      expect(data.pagination).toBeDefined()
      expect(data.pagination.page).toBe(1)
    })

    it('should filter users by plan', async () => {
      const token = await createTestToken({
        userId: 'admin-123',
        email: 'admin@test.com',
        exp: Math.floor(Date.now() / 1000) + 3600
      })

      mockEnv.DB.prepare.mockImplementation((query) => ({
        first: vi.fn().mockResolvedValue({ count: 10 }),
        all: vi.fn().mockResolvedValue({ results: [] }),
        bind: vi.fn().mockReturnThis()
      }))

      const req = new Request('http://localhost/api/admin/users?plan=professional', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const res = await app.fetch(req, mockEnv)
      expect(res.status).toBe(200)
    })

    it('should search users by email', async () => {
      const token = await createTestToken({
        userId: 'admin-123',
        email: 'admin@test.com',
        exp: Math.floor(Date.now() / 1000) + 3600
      })

      mockEnv.DB.prepare.mockImplementation((query) => ({
        first: vi.fn().mockResolvedValue({ count: 1 }),
        all: vi.fn().mockResolvedValue({
          results: [{ id: 'user-1', email: 'test@example.com' }]
        }),
        bind: vi.fn().mockReturnThis()
      }))

      const req = new Request('http://localhost/api/admin/users?search=test', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const res = await app.fetch(req, mockEnv)
      expect(res.status).toBe(200)
    })
  })

  describe('GET /api/admin/users/:id', () => {
    it('should return user details', async () => {
      const token = await createTestToken({
        userId: 'admin-123',
        email: 'admin@test.com',
        exp: Math.floor(Date.now() / 1000) + 3600
      })

      mockEnv.DB.prepare.mockImplementation((query) => ({
        first: vi.fn().mockResolvedValue({
          id: 'user-1',
          email: 'user@test.com',
          createdAt: '2024-01-01',
          subscriptionPlan: 'starter'
        }),
        all: vi.fn().mockResolvedValue({ results: [] }),
        bind: vi.fn().mockReturnThis()
      }))

      const req = new Request('http://localhost/api/admin/users/user-1', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const res = await app.fetch(req, mockEnv)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.user).toBeDefined()
    })

    it('should return 404 for non-existent user', async () => {
      const token = await createTestToken({
        userId: 'admin-123',
        email: 'admin@test.com',
        exp: Math.floor(Date.now() / 1000) + 3600
      })

      mockEnv.DB.prepare.mockImplementation((query) => ({
        first: vi.fn().mockResolvedValue(null),
        bind: vi.fn().mockReturnThis()
      }))

      const req = new Request('http://localhost/api/admin/users/nonexistent', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const res = await app.fetch(req, mockEnv)
      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /api/admin/users/:id', () => {
    it('should delete user', async () => {
      const token = await createTestToken({
        userId: 'admin-123',
        email: 'admin@test.com',
        exp: Math.floor(Date.now() / 1000) + 3600
      })

      mockEnv.DB.prepare.mockImplementation((query) => ({
        run: vi.fn().mockResolvedValue({ success: true }),
        bind: vi.fn().mockReturnThis()
      }))

      const req = new Request('http://localhost/api/admin/users/user-1', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const res = await app.fetch(req, mockEnv)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.success).toBe(true)
    })
  })

  describe('PUT /api/admin/users/:id/plan', () => {
    it('should update user plan', async () => {
      const token = await createTestToken({
        userId: 'admin-123',
        email: 'admin@test.com',
        exp: Math.floor(Date.now() / 1000) + 3600
      })

      mockEnv.DB.prepare.mockImplementation((query) => ({
        first: vi.fn().mockResolvedValue({ id: 'sub-1' }),
        run: vi.fn().mockResolvedValue({ success: true }),
        bind: vi.fn().mockReturnThis()
      }))

      const req = new Request('http://localhost/api/admin/users/user-1/plan', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan: 'professional', status: 'active' })
      })

      const res = await app.fetch(req, mockEnv)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.success).toBe(true)
    })

    it('should return 400 for invalid plan', async () => {
      const token = await createTestToken({
        userId: 'admin-123',
        email: 'admin@test.com',
        exp: Math.floor(Date.now() / 1000) + 3600
      })

      const req = new Request('http://localhost/api/admin/users/user-1/plan', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan: 'invalid-plan' })
      })

      const res = await app.fetch(req, mockEnv)
      expect(res.status).toBe(400)
    })
  })
})
