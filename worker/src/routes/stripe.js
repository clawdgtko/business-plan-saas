// Stripe Routes - Express Checkout avec OpenTelemetry
import { Hono } from 'hono'
import { auth } from '../middleware/auth.js'
import { createStripeInstrumenter } from '../middleware/opentelemetry.js'

const app = new Hono()

// Stripe config - à externaliser en prod
const STRIPE_SECRET_KEY = 'sk_test_' // Remplacer par wrangler secret

// Create checkout session
app.post('/checkout', auth, async (c) => {
  const { priceId, successUrl, cancelUrl } = await c.req.json()
  const user = c.get('user')
  const { DB } = c.env
  const logger = c.get('logger')
  const stripeInst = createStripeInstrumenter(c)
  
  logger.info('Creating checkout session', {
    type: 'stripe.checkout.start',
    userId: user.userId,
    priceId
  });
  
  // Get or create Stripe customer avec tracing
  let subscription = await DB.prepare(
    'SELECT * FROM subscriptions WHERE user_id = ?'
  ).bind(user.userId).first()
  
  logger.debug('Subscription lookup completed', {
    hasSubscription: !!subscription
  });
  
  // TODO: Integrate real Stripe with instrumentation
  // const session = await stripeInst.instrument(
  //   'create',
  //   'checkout.session',
  //   () => stripe.checkout.sessions.create({...})
  // );
  
  // Pour l'instant: mock response
  const sessionId = 'cs_test_' + crypto.randomUUID();
  
  logger.info('Checkout session created', {
    type: 'stripe.checkout.complete',
    sessionId,
    userId: user.userId
  });
  
  return c.json({
    sessionId,
    url: successUrl || 'http://localhost:5173/dashboard?success=true'
  })
})

// Get subscription status
app.get('/subscription', auth, async (c) => {
  const user = c.get('user')
  const { DB } = c.env
  const logger = c.get('logger')
  
  logger.debug('Fetching subscription status', {
    userId: user.userId
  });
  
  const subscription = await DB.prepare(
    'SELECT * FROM subscriptions WHERE user_id = ?'
  ).bind(user.userId).first()
  
  if (!subscription) {
    logger.info('No subscription found', { userId: user.userId });
    return c.json({
      status: 'inactive',
      plan: 'free',
      hasAccess: false
    })
  }
  
  logger.info('Subscription found', {
    userId: user.userId,
    status: subscription.status,
    plan: subscription.plan
  });
  
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
  const logger = c.get('logger')
  
  logger.info('Creating portal session', { userId: user.userId });
  
  // TODO: Create portal session avec instrumentation Stripe
  
  return c.json({
    url: 'https://billing.stripe.com/session/xxx'
  })
})

// Webhook (no auth - Stripe signature verification needed)
app.post('/webhook', async (c) => {
  const body = await c.req.text()
  const signature = c.req.header('stripe-signature')
  const { DB } = c.env
  const logger = c.get('logger')
  
  logger.info('Stripe webhook received', {
    type: 'stripe.webhook.received',
    signature: signature?.substring(0, 20) + '...'
  });
  
  // TODO: Verify webhook signature
  // TODO: Handle events avec tracing
  
  const event = JSON.parse(body)
  
  logger.info('Processing webhook event', {
    type: 'stripe.webhook.processing',
    eventType: event.type,
    eventId: event.id
  });
  
  switch (event.type) {
    case 'checkout.session.completed': {
      logger.info('Checkout completed', {
        sessionId: event.data?.object?.id,
        customerId: event.data?.object?.customer
      });
      // Update subscription in DB
      break;
    }
    case 'invoice.paid': {
      logger.info('Invoice paid', {
        invoiceId: event.data?.object?.id
      });
      // Extend subscription period
      break;
    }
    case 'customer.subscription.updated': {
      logger.info('Subscription updated', {
        subscriptionId: event.data?.object?.id,
        status: event.data?.object?.status
      });
      break;
    }
    case 'customer.subscription.deleted': {
      logger.warn('Subscription deleted', {
        subscriptionId: event.data?.object?.id
      });
      break;
    }
    default: {
      logger.debug('Unhandled webhook event', { eventType: event.type });
    }
  }
  
  logger.info('Webhook processed', {
    type: 'stripe.webhook.complete',
    eventType: event.type
  });
  
  return c.json({ received: true })
})

export default app
