import { verify } from 'hono/jwt'

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Resource-Policy': 'same-site',
  'Cross-Origin-Opener-Policy': 'same-origin'
}

export function applySecurityHeaders(c) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    c.header(key, value)
  }
}

export function securityHeaders() {
  return async (c, next) => {
    await next()
    applySecurityHeaders(c)
  }
}

export function requireJsonContentType(c) {
  const contentType = c.req.header('Content-Type') || ''
  if (!contentType.toLowerCase().includes('application/json')) {
    return c.json({ error: 'Content-Type invalide' }, 415)
  }
  return null
}

export function getJwtSecret(c) {
  const jwtSecret = c.env?.JWT_SECRET
  if (typeof jwtSecret !== 'string' || jwtSecret.trim() === '') {
    return null
  }
  return jwtSecret
}

// Auth middleware
export async function auth(c, next) {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Non authentifié' }, 401)
  }
  
  const token = authHeader.slice(7)
  const jwtSecret = getJwtSecret(c)
  if (!jwtSecret) {
    return c.json({ error: 'JWT secret manquant' }, 500)
  }
  
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
    const jwtSecret = getJwtSecret(c)
    if (!jwtSecret) {
      return c.json({ error: 'JWT secret manquant' }, 500)
    }
    try {
      const payload = await verify(token, jwtSecret)
      c.set('user', payload)
    } catch (e) {
      // Invalid token, continue without user
    }
  }
  
  await next()
}
