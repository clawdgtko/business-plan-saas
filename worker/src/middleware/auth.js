import { verify } from 'hono/jwt'

// Auth middleware
export async function auth(c, next) {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Non authentifié' }, 401)
  }
  
  const token = authHeader.slice(7)
  const jwtSecret = c.env.JWT_SECRET
  
  try {
    const payload = await verify(token, jwtSecret)
    c.set('user', payload)
    await next()
  } catch (e) {
    return c.json({ error: 'Token invalide' }, 401)
  }
}

// Optional auth (sets user if available)
export async function optionalAuth(c, next) {
  const authHeader = c.req.header('Authorization')
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const jwtSecret = c.env.JWT_SECRET
    try {
      const payload = await verify(token, jwtSecret)
      c.set('user', payload)
    } catch (e) {
      // Invalid token, continue without user
    }
  }
  
  await next()
}