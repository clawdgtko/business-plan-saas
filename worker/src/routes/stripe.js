// Stripe Routes - Express Checkout
import { Hono } from 'hono'
import { auth } from '../middleware/auth.js'

const app = new Hono()

// Stripe config - à externaliser en prod
const STRIPE_SECRET_KEY = 'sk_test_' // Remplacer par wrangler secret

// Create checkout session
app.post('/checkout', auth, async (c) => {
  const { priceId, successUrl, cancelUrl } = await c.req.json()
  const user = c.get('user')
  const { DB } = c.env
  
  // Get or create Stripe customer
  let subscription = await DB.prepare(
    'SELECT * FROM subscriptions WHERE user_id = ?'
  ).bind(user.userId).first()
  
  // TODO: Create Stripe checkout session
  // Pour l'instant: mock response
  
  return c.json({
    sessionId: 'cs_test_' + crypto.randomUUID(),
    url: successUrl || 'http://localhost:5173/dashboard?success=true'
  })
})

// Get subscription status
app.get('/subscription', auth, async (c) => {
  const user = c.get('user')
  const { DB } = c.env
  
  const subscription = await DB.prepare(
    'SELECT * FROM subscriptions WHERE user_id = ?'
  ).bind(user.userId).first()
  
  if (!subscription) {
    return c.json({
      status: 'inactive',
      plan: 'free',
      hasAccess: false
    })
  }
  
  return c.json({
    status: subscription.status,
    plan: subscription.plan,
    currentPeriodEnd: subscription.current_period_end,
    hasAccess: subscription.status === 'active'
  })
})

// Customer portal
app.post('/portal', auth, async (c) => {
  const user = c.get('user')
  
  // TODO: Create portal session
  
  return c.json({
    url: 'https://billing.stripe.com/session/xxx'
  })
})

// Webhook (no auth - Stripe signature verification needed)
app.post('/webhook', async (c) => {
  const body = await c.req.text()
  const signature = c.req.header('stripe-signature')
  const { DB } = c.env
  
  // TODO: Verify webhook signature
  // TODO: Handle events:
  // - checkout.session.completed
  // - invoice.paid
  // - customer.subscription.updated
  // - customer.subscription.deleted
  
  const event = JSON.parse(body)
  
  switch (event.type) {
    case 'checkout.session.completed':
      // Update subscription in DB
      break
    case 'invoice.paid':
      // Extend subscription period
      break
  }
  
  return c.json({ received: true })
})

export default app