import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'

const app = new Hono()

// JWT Secret - en prod via wrangler secret
const JWT_SECRET = 'dev-secret-change-in-production'

// Generate random token
function generateToken() {
  return crypto.randomUUID()
}

// Request magic link
app.post('/magic-link', async (c) => {
  const { email } = await c.req.json()
  
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
  const jwtToken = await sign({ 
    userId: user.id, 
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
  }, JWT_SECRET)
  
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
  
  try {
    const payload = await verify(token, JWT_SECRET)
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