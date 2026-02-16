import { Hono } from 'hono'
import { requireAdmin } from '../middleware/admin.js'
import { securityHeaders } from '../middleware/auth.js'

const app = new Hono()

app.use('*', securityHeaders())
app.use('*', requireAdmin)

// GET /api/admin/stats - Get dashboard statistics
app.get('/stats', async (c) => {
  const { DB } = c.env
  
  try {
    // Get user counts
    const totalUsers = await DB.prepare(
      'SELECT COUNT(*) as count FROM users'
    ).first()
    
    // Get users by date (last 30 days)
    const usersByDate = await DB.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= DATE('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all()
    
    // Get subscription stats
    const subscriptionStats = await DB.prepare(`
      SELECT 
        plan,
        status,
        COUNT(*) as count
      FROM subscriptions
      GROUP BY plan, status
    `).all()
    
    // Get conversion funnel
    const funnelStats = await DB.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(DISTINCT user_id) FROM business_plans) as users_with_bp,
        (SELECT COUNT(DISTINCT user_id) FROM subscriptions WHERE status = 'active' AND plan != 'free') as paying_users
    `).first()
    
    // Get revenue estimates (from Stripe data if available)
    const revenueStats = await DB.prepare(`
      SELECT 
        plan,
        COUNT(*) as count
      FROM subscriptions
      WHERE status = 'active'
      GROUP BY plan
    `).all()
    
    // Calculate MRR (Monthly Recurring Revenue)
    const planPrices = {
      'free': 0,
      'starter': 29,
      'professional': 79,
      'enterprise': 199
    }
    
    let mrr = 0
    if (revenueStats.results) {
      for (const row of revenueStats.results) {
        mrr += (row.count || 0) * (planPrices[row.plan] || 0)
      }
    }
    
    // Get recent activity
    const recentActivity = await DB.prepare(`
      SELECT 
        'user' as type,
        email as title,
        created_at as date
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `).all()
    
    return c.json({
      success: true,
      stats: {
        users: {
          total: totalUsers?.count || 0,
          byDate: usersByDate.results || []
        },
        subscriptions: {
          byPlan: subscriptionStats.results || [],
          mrr: mrr
        },
        funnel: {
          totalUsers: funnelStats?.total_users || 0,
          usersWithBusinessPlan: funnelStats?.users_with_bp || 0,
          payingUsers: funnelStats?.paying_users || 0,
          conversionRate: funnelStats?.total_users > 0 
            ? Math.round((funnelStats.paying_users / funnelStats.total_users) * 100 * 100) / 100
            : 0
        },
        recentActivity: recentActivity.results || []
      }
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return c.json({ error: 'Erreur lors de la récupération des statistiques' }, 500)
  }
})

// GET /api/admin/users - Get users list with pagination
app.get('/users', async (c) => {
  const { DB } = c.env
  
  // Pagination params
  const page = parseInt(c.req.query('page')) || 1
  const limit = parseInt(c.req.query('limit')) || 20
  const offset = (page - 1) * limit
  
  // Filters
  const search = c.req.query('search') || ''
  const plan = c.req.query('plan') || ''
  const dateFrom = c.req.query('dateFrom') || ''
  const dateTo = c.req.query('dateTo') || ''
  
  try {
    // Build query conditions
    const conditions = []
    const params = []
    
    if (search) {
      conditions.push('u.email LIKE ?')
      params.push(`%${search}%`)
    }
    
    if (plan) {
      conditions.push('s.plan = ?')
      params.push(plan)
    }
    
    if (dateFrom) {
      conditions.push('u.created_at >= ?')
      params.push(dateFrom)
    }
    
    if (dateTo) {
      conditions.push('u.created_at <= ?')
      params.push(`${dateTo}T23:59:59`)
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      ${whereClause}
    `
    const totalResult = await DB.prepare(countQuery).bind(...params).first()
    const total = totalResult?.count || 0
    
    // Get users with subscription info
    const usersQuery = `
      SELECT 
        u.id,
        u.email,
        u.created_at as createdAt,
        s.plan as subscriptionPlan,
        s.status as subscriptionStatus,
        s.current_period_end as subscriptionEnd,
        (SELECT COUNT(*) FROM business_plans WHERE user_id = u.id) as businessPlansCount
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `
    
    const users = await DB.prepare(usersQuery)
      .bind(...params, limit, offset)
      .all()
    
    return c.json({
      success: true,
      users: users.results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Admin users error:', error)
    return c.json({ error: 'Erreur lors de la récupération des utilisateurs' }, 500)
  }
})

// GET /api/admin/users/:id - Get user details
app.get('/users/:id', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  
  try {
    // Get user info
    const user = await DB.prepare(`
      SELECT 
        u.id,
        u.email,
        u.created_at as createdAt,
        s.plan as subscriptionPlan,
        s.status as subscriptionStatus,
        s.stripe_customer_id as stripeCustomerId,
        s.current_period_start as subscriptionStart,
        s.current_period_end as subscriptionEnd
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      WHERE u.id = ?
    `).bind(userId).first()
    
    if (!user) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404)
    }
    
    // Get user's business plans
    const businessPlans = await DB.prepare(`
      SELECT 
        id,
        name,
        status,
        progress,
        created_at as createdAt,
        updated_at as updatedAt
      FROM business_plans
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `).bind(userId).all()
    
    // Get user's analytics events (if analytics table exists)
    let activity = []
    try {
      const analytics = await DB.prepare(`
        SELECT 
          event_type,
          page_path,
          created_at as date
        FROM analytics_events
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 20
      `).bind(userId).all()
      activity = analytics.results || []
    } catch (e) {
      // Analytics table might not exist
    }
    
    return c.json({
      success: true,
      user: {
        ...user,
        businessPlans: businessPlans.results || [],
        activity
      }
    })
  } catch (error) {
    console.error('Admin user details error:', error)
    return c.json({ error: 'Erreur lors de la récupération des détails' }, 500)
  }
})

// DELETE /api/admin/users/:id - Delete user
app.delete('/users/:id', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  
  try {
    // Delete user (cascade will handle related records)
    await DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run()
    
    return c.json({
      success: true,
      message: 'Utilisateur supprimé'
    })
  } catch (error) {
    console.error('Admin delete user error:', error)
    return c.json({ error: 'Erreur lors de la suppression' }, 500)
  }
})

// PUT /api/admin/users/:id/plan - Update user plan
app.put('/users/:id/plan', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  
  let payload
  try {
    payload = await c.req.json()
  } catch (e) {
    return c.json({ error: 'JSON invalide' }, 400)
  }
  
  const { plan, status } = payload
  
  if (!plan || !['free', 'starter', 'professional', 'enterprise'].includes(plan)) {
    return c.json({ error: 'Plan invalide' }, 400)
  }
  
  try {
    // Check if subscription exists
    const existing = await DB.prepare(
      'SELECT id FROM subscriptions WHERE user_id = ?'
    ).bind(userId).first()
    
    if (existing) {
      await DB.prepare(`
        UPDATE subscriptions 
        SET plan = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).bind(plan, status || 'active', userId).run()
    } else {
      const subId = crypto.randomUUID()
      await DB.prepare(`
        INSERT INTO subscriptions (id, user_id, plan, status, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(subId, userId, plan, status || 'active').run()
    }
    
    return c.json({
      success: true,
      message: 'Plan mis à jour'
    })
  } catch (error) {
    console.error('Admin update plan error:', error)
    return c.json({ error: 'Erreur lors de la mise à jour' }, 500)
  }
})

export default app
