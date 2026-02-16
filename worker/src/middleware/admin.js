// Admin middleware - protects admin routes
import { verify } from 'hono/jwt'
import { getJwtSecret } from './auth.js'

// List of admin emails (could also be stored in DB or env)
const getAdminEmails = (c) => {
  const adminEmails = c.env.ADMIN_EMAILS || ''
  return adminEmails.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
}

// Admin middleware
export async function requireAdmin(c, next) {
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
    
    // Check if user is admin
    const adminEmails = getAdminEmails(c)
    if (!adminEmails.includes(payload.email?.toLowerCase())) {
      return c.json({ error: 'Accès interdit - Admin requis' }, 403)
    }
    
    c.set('user', payload)
    c.set('isAdmin', true)
    await next()
  } catch (e) {
    return c.json({ error: 'Token invalide' }, 401)
  }
}

// Check if user is admin (for conditional UI)
export async function checkAdmin(c, next) {
  const authHeader = c.req.header('Authorization')
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const jwtSecret = getJwtSecret(c)
    if (jwtSecret) {
      try {
        const payload = await verify(token, jwtSecret)
        const adminEmails = getAdminEmails(c)
        if (adminEmails.includes(payload.email?.toLowerCase())) {
          c.set('user', payload)
          c.set('isAdmin', true)
        }
      } catch (e) {
        // Invalid token, continue
      }
    }
  }
  
  await next()
}
