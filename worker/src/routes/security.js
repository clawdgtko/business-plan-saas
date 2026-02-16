/**
 * 🔐 Security Routes - Secrets Management & JWT
 * 
 * Routes:
 * - POST /api/auth/register
 * - POST /api/auth/login
 * - POST /api/auth/refresh
 * - POST /api/auth/logout
 * - GET  /api/admin/secrets
 * - POST /api/admin/secrets/rotate-jwt
 * - POST /api/admin/secrets/:key/rotate
 */

import { Hono } from 'hono';
import {
  createAuthMiddleware,
  requireRoles,
  hashPassword,
  generateSalt,
  validatePasswordStrength,
  sanitizeInput,
  generateSecureToken
} from '../security/index.js';

const app = new Hono();

// ============================================
// 🔐 AUTHENTICATION
// ============================================

/**
 * POST /api/auth/register
 * Register a new user
 */
app.post('/auth/register', async (c) => {
  const db = c.env.DB;
  const jwtManager = c.get('jwtManager');
  
  try {
    const { email, password, name } = await c.req.json();
    
    // Validate input
    const cleanEmail = sanitizeInput(email)?.toLowerCase().trim();
    const cleanName = sanitizeInput(name);
    
    if (!cleanEmail || !password || !cleanName) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return c.json({ error: 'Invalid email format' }, 400);
    }
    
    // Validate password strength
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      return c.json({ 
        error: 'Password too weak',
        details: passwordCheck.errors 
      }, 400);
    }
    
    // Check if user exists
    const existingUser = await db.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(cleanEmail).first();
    
    if (existingUser) {
      return c.json({ error: 'Email already registered' }, 409);
    }
    
    // Hash password
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    
    // Create user
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await db.prepare(`
      INSERT INTO users (id, email, name, password_hash, salt, roles, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      cleanEmail,
      cleanName,
      passwordHash,
      salt,
      JSON.stringify(['user']),
      now,
      now
    ).run();
    
    // Generate tokens
    const tokens = await jwtManager.generateTokens({
      id: userId,
      email: cleanEmail,
      roles: ['user']
    });
    
    // Store refresh token hash for revocation
    const refreshTokenHash = await hashPassword(tokens.refreshToken, salt);
    await c.env.SESSIONS.put(
      `refresh:${userId}`,
      JSON.stringify({
        hash: refreshTokenHash,
        createdAt: now,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      }),
      { expirationTtl: 7 * 24 * 60 * 60 }
    );
    
    return c.json({
      success: true,
      user: {
        id: userId,
        email: cleanEmail,
        name: cleanName,
        roles: ['user']
      },
      tokens
    }, 201);
    
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
app.post('/auth/login', async (c) => {
  const db = c.env.DB;
  const jwtManager = c.get('jwtManager');
  
  try {
    const { email, password } = await c.req.json();
    
    const cleanEmail = sanitizeInput(email)?.toLowerCase().trim();
    
    if (!cleanEmail || !password) {
      return c.json({ error: 'Missing credentials' }, 400);
    }
    
    // Get user
    const user = await db.prepare(
      'SELECT id, email, name, password_hash, salt, roles FROM users WHERE email = ?'
    ).bind(cleanEmail).first();
    
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Verify password
    const passwordHash = await hashPassword(password, user.salt);
    if (passwordHash !== user.password_hash) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Parse roles
    const roles = JSON.parse(user.roles || '[]');
    
    // Generate tokens
    const tokens = await jwtManager.generateTokens({
      id: user.id,
      email: user.email,
      roles
    });
    
    // Store refresh token
    await c.env.SESSIONS.put(
      `refresh:${user.id}`,
      JSON.stringify({
        createdAt: new Date().toISOString(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
      }),
      { expirationTtl: 7 * 24 * 60 * 60 }
    );
    
    // Update last login
    await db.prepare(
      'UPDATE users SET last_login = ? WHERE id = ?'
    ).bind(new Date().toISOString(), user.id).run();
    
    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles
      },
      tokens
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
app.post('/auth/refresh', async (c) => {
  const jwtManager = c.get('jwtManager');
  
  try {
    const { refreshToken } = await c.req.json();
    
    if (!refreshToken) {
      return c.json({ error: 'Missing refresh token' }, 400);
    }
    
    const tokens = await jwtManager.refresh(refreshToken);
    
    return c.json({
      success: true,
      tokens
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    return c.json({ error: 'Invalid refresh token' }, 401);
  }
});

/**
 * POST /api/auth/logout
 * Logout user (revoke refresh token)
 */
app.post('/auth/logout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const jwtManager = c.get('jwtManager');
      
      try {
        const { payload } = await jwtManager.verify(token);
        
        // Delete refresh token from KV
        await c.env.SESSIONS.delete(`refresh:${payload.sub}`);
        
        // Add token to revocation list (blacklist)
        await c.env.SESSIONS.put(
          `revoked:${token}`,
          'true',
          { expirationTtl: 900 } // 15 min
        );
      } catch (e) {
        // Token invalid, but logout should still succeed
      }
    }
    
    return c.json({ success: true, message: 'Logged out successfully' });
    
  } catch (error) {
    return c.json({ error: 'Logout failed' }, 500);
  }
});

// ============================================
// 👤 USER PROFILE
// ============================================

/**
 * GET /api/user/profile
 * Get current user profile
 */
app.get('/user/profile', createAuthMiddleware(app.jwtManager), async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  
  try {
    const profile = await db.prepare(
      'SELECT id, email, name, roles, created_at, last_login FROM users WHERE id = ?'
    ).bind(user.sub).first();
    
    if (!profile) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({
      success: true,
      user: {
        ...profile,
        roles: JSON.parse(profile.roles || '[]')
      }
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// ============================================
 * 🔐 ADMIN - SECRETS MANAGEMENT
 * ============================================

/**
 * GET /api/admin/secrets
 * List all secret keys (admin only)
 */
app.get('/admin/secrets',
  createAuthMiddleware(app.jwtManager),
  requireRoles(['admin']),
  async (c) => {
    const secretsManager = c.get('secretsManager');
    
    try {
      const keys = await secretsManager.list();
      
      return c.json({
        success: true,
        secrets: keys.map(key => ({
          name: key,
          // Don't return actual values!
          masked: '***'
        }))
      });
      
    } catch (error) {
      console.error('List secrets error:', error);
      return c.json({ error: 'Failed to list secrets' }, 500);
    }
  }
);

/**
 * POST /api/admin/secrets/rotate-jwt
 * Force rotate JWT secret (admin only)
 */
app.post('/admin/secrets/rotate-jwt',
  createAuthMiddleware(app.jwtManager),
  requireRoles(['admin']),
  async (c) => {
    const jwtManager = c.get('jwtManager');
    
    try {
      await jwtManager.forceRotate();
      
      return c.json({
        success: true,
        message: 'JWT secret rotated successfully',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('JWT rotation error:', error);
      return c.json({ error: 'Failed to rotate JWT secret' }, 500);
    }
  }
);

/**
 * POST /api/admin/secrets/:key/rotate
 * Rotate a specific secret (admin only)
 */
app.post('/admin/secrets/:key/rotate',
  createAuthMiddleware(app.jwtManager),
  requireRoles(['admin']),
  async (c) => {
    const secretsManager = c.get('secretsManager');
    const key = c.req.param('key');
    const { generator } = await c.req.json().catch(() => ({}));
    
    try {
      // Default generator: random string
      const defaultGenerator = () => generateSecureToken(32);
      const newValue = await secretsManager.rotate(key, generator || defaultGenerator);
      
      return c.json({
        success: true,
        message: `Secret "${key}" rotated successfully`,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Secret rotation error:', error);
      return c.json({ error: 'Failed to rotate secret' }, 500);
    }
  }
);

/**
 * GET /api/admin/rbac/roles
 * List all RBAC roles and permissions
 */
app.get('/admin/rbac/roles',
  createAuthMiddleware(app.jwtManager),
  requireRoles(['admin']),
  async (c) => {
    // Define role hierarchy and permissions
    const roles = {
      superadmin: {
        description: 'Full system access',
        permissions: ['*']
      },
      admin: {
        description: 'Administrative access',
        permissions: [
          'users:read', 'users:write',
          'content:read', 'content:write', 'content:delete',
          'settings:read', 'settings:write',
          'analytics:read',
          'secrets:read', 'secrets:write'
        ]
      },
      moderator: {
        description: 'Content moderation',
        permissions: [
          'users:read',
          'content:read', 'content:write',
          'analytics:read'
        ]
      },
      user: {
        description: 'Standard user',
        permissions: [
          'profile:read', 'profile:write',
          'content:read'
        ]
      }
    };
    
    return c.json({
      success: true,
      roles
    });
  }
);

/**
 * POST /api/admin/users/:id/roles
 * Update user roles (admin only)
 */
app.post('/admin/users/:id/roles',
  createAuthMiddleware(app.jwtManager),
  requireRoles(['admin']),
  async (c) => {
    const db = c.env.DB;
    const userId = c.req.param('id');
    const { roles } = await c.req.json();
    
    if (!Array.isArray(roles) || roles.length === 0) {
      return c.json({ error: 'Invalid roles array' }, 400);
    }
    
    // Validate roles
    const validRoles = ['user', 'moderator', 'admin', 'superadmin'];
    const invalidRoles = roles.filter(r => !validRoles.includes(r));
    
    if (invalidRoles.length > 0) {
      return c.json({ error: 'Invalid roles', invalidRoles }, 400);
    }
    
    try {
      await db.prepare(
        'UPDATE users SET roles = ?, updated_at = ? WHERE id = ?'
      ).bind(JSON.stringify(roles), new Date().toISOString(), userId).run();
      
      return c.json({
        success: true,
        message: 'Roles updated successfully',
        userId,
        roles
      });
      
    } catch (error) {
      console.error('Role update error:', error);
      return c.json({ error: 'Failed to update roles' }, 500);
    }
  }
);

export default app;