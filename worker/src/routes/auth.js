import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'
import { getJwtSecret, requireJsonContentType, securityHeaders } from '../middleware/auth.js'

const app = new Hono()

app.use('*', securityHeaders())

const MAGIC_LINK_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5
}

const memoryRateLimitStore = new Map()

function getClientIp(c) {
  const cfIp = c.req.header('CF-Connecting-IP')
  if (cfIp) {
    return cfIp
  }
  const forwardedFor = c.req.header('X-Forwarded-For')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  return 'unknown'
}

function getRateLimitCache() {
  if (typeof caches === 'undefined' || !caches.default) {
    return null
  }
  return caches.default
}

async function readRateLimitEntry(cache, key, now, windowMs) {
  if (!cache) {
    const entry = memoryRateLimitStore.get(key)
    if (!entry || entry.resetAt <= now) {
      return { count: 0, resetAt: now + windowMs }
    }
    return entry
  }

  const request = new Request(`https://rate-limit/${key}`)
  const cached = await cache.match(request)
  if (!cached) {
    return { count: 0, resetAt: now + windowMs, request }
  }

  const data = await cached.json()
  if (!data || typeof data.resetAt !== 'number' || data.resetAt <= now) {
    return { count: 0, resetAt: now + windowMs, request }
  }

  return { count: data.count || 0, resetAt: data.resetAt, request }
}

async function writeRateLimitEntry(cache, key, entry, now) {
  if (!cache) {
    memoryRateLimitStore.set(key, entry)
    return
  }

  const ttlSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000))
  const request = entry.request || new Request(`https://rate-limit/${key}`)
  await cache.put(
    request,
    new Response(JSON.stringify({ count: entry.count, resetAt: entry.resetAt }), {
      headers: { 'Cache-Control': `max-age=${ttlSeconds}` }
    })
  )
}

async function checkRateLimit(c, { windowMs, max }) {
  const key = `magic-link:${getClientIp(c)}`
  const now = Date.now()
  const cache = getRateLimitCache()
  const entry = await readRateLimitEntry(cache, key, now, windowMs)

  entry.count += 1
  await writeRateLimitEntry(cache, key, entry, now)

  const remaining = Math.max(0, max - entry.count)
  const limited = entry.count > max
  const retryAfter = Math.max(0, Math.ceil((entry.resetAt - now) / 1000))

  return {
    limited,
    remaining,
    limit: max,
    resetAt: entry.resetAt,
    retryAfter
  }
}

function setRateLimitHeaders(c, rateLimit) {
  c.header('X-RateLimit-Limit', String(rateLimit.limit))
  c.header('X-RateLimit-Remaining', String(rateLimit.remaining))
  c.header('X-RateLimit-Reset', String(Math.ceil(rateLimit.resetAt / 1000)))
  if (rateLimit.limited) {
    c.header('Retry-After', String(rateLimit.retryAfter))
  }
}

export function resetRateLimitStore() {
  memoryRateLimitStore.clear()
}

// Generate random token
function generateToken() {
  return crypto.randomUUID()
}

// Request magic link
app.post('/magic-link', async (c) => {
  const rateLimit = await checkRateLimit(c, MAGIC_LINK_RATE_LIMIT)
  setRateLimitHeaders(c, rateLimit)
  if (rateLimit.limited) {
    return c.json({ error: 'Trop de requêtes' }, 429)
  }

  const contentTypeError = requireJsonContentType(c)
  if (contentTypeError) {
    return contentTypeError
  }

  let payload
  try {
    payload = await c.req.json()
  } catch (e) {
    return c.json({ error: 'JSON invalide' }, 400)
  }

  const { email } = payload
  
  if (!email || !email.includes('@')) {
    return c.json({ error: 'Email invalide' }, 400)
  }
  
  const { DB } = c.env
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15min
  
  // Store magic link
  await DB.prepare(
    'INSERT INTO magic_links (token, email, expires_at) VALUES (?, ?, ?)'
  ).bind(token, email.toLowerCase(), expiresAt).run()
  
  // TODO: Send email via Resend
  // Pour dev: on retourne le token directement
  const isDev = c.env.ENVIRONMENT !== 'production'
  
  return c.json({ 
    success: true, 
    message: 'Magic link envoyé',
    ...(isDev && { devToken: token, devLink: `http://localhost:5173/auth/verify?token=${token}` })
  })
})

// Verify magic link token
app.get('/verify/:token', async (c) => {
  const token = c.req.param('token')
  const { DB } = c.env
  
  // Get magic link
  const magicLink = await DB.prepare(
    'SELECT * FROM magic_links WHERE token = ? AND used = FALSE AND expires_at > datetime("now")'
  ).bind(token).first()
  
  if (!magicLink) {
    return c.json({ error: 'Token invalide ou expiré' }, 400)
  }
  
  // Mark as used
  await DB.prepare(
    'UPDATE magic_links SET used = TRUE WHERE token = ?'
  ).bind(token).run()
  
  // Get or create user
  let user = await DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(magicLink.email).first()
  
  if (!user) {
    const userId = crypto.randomUUID()
    await DB.prepare(
      'INSERT INTO users (id, email) VALUES (?, ?)'
    ).bind(userId, magicLink.email).run()
    
    user = { id: userId, email: magicLink.email }
  }
  
  // Generate JWT
  const jwtSecret = getJwtSecret(c)
  if (!jwtSecret) {
    return c.json({ error: 'JWT secret manquant' }, 500)
  }

  const jwtToken = await sign({ 
    userId: user.id, 
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
  }, jwtSecret)
  
  return c.json({ 
    success: true, 
    token: jwtToken,
    user: {
      id: user.id,
      email: user.email
    }
  })
})

// Get current user
app.get('/me', async (c) => {
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
    return c.json({
      user: {
        id: payload.userId,
        email: payload.email
      }
    })
  } catch (e) {
    return c.json({ error: 'Token invalide' }, 401)
  }
})

export default app
