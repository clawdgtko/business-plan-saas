# 🔐 Security Module Documentation

## Overview

This module provides comprehensive security features for the Business Plan SaaS application:

- **Secrets Management**: Secure storage and rotation of sensitive data
- **JWT Rotation**: Automatic key rotation with grace period support
- **RBAC**: Role-Based Access Control with hierarchical permissions

## Features

### 🔑 Secrets Management

The `SecretsManager` class provides secure storage using Cloudflare KV:

```javascript
import { SecretsManager } from './security/index.js';

const secrets = new SecretsManager(env.SECRETS_STORE, 'production');

// Store a secret
await secrets.set('api:stripe', 'sk_live_...', {
  version: '1.0.0',
  expiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000 // 90 days
});

// Retrieve a secret
const apiKey = await secrets.get('api:stripe');

// Rotate a secret
const newKey = await secrets.rotate('api:stripe', () => generateNewKey());
```

### 🎫 JWT Management

Automatic JWT secret rotation with zero-downtime token validation:

```javascript
import { JWTManager } from './security/index.js';

const jwt = new JWTManager(secretsManager, {
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  rotationInterval: 30 * 24 * 60 * 60 * 1000 // 30 days
});

// Initialize (checks if rotation needed)
await jwt.initialize();

// Generate tokens
const tokens = await jwt.generateTokens({
  id: user.id,
  email: user.email,
  roles: ['user']
});

// Verify token
const { payload } = await jwt.verify(token);

// Refresh access token
const newTokens = await jwt.refresh(refreshToken);
```

### 🛡️ RBAC (Role-Based Access Control)

Hierarchical permission system:

**Roles:**
- `superadmin`: Full system access
- `admin`: Administrative functions
- `moderator`: Content moderation
- `user`: Standard user access

**Middleware:**

```javascript
import { createAuthMiddleware, requireRoles } from './security/index.js';

// Protect route with authentication
app.get('/api/user/profile', createAuthMiddleware(jwtManager), handler);

// Protect with role requirement
app.post('/api/admin/users',
  createAuthMiddleware(jwtManager),
  requireRoles(['admin', 'superadmin']),
  handler
);
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout user |

### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get current user profile |

### Admin - Secrets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/secrets` | List all secrets (masked) |
| POST | `/api/admin/secrets/rotate-jwt` | Force JWT rotation |
| POST | `/api/admin/secrets/:key/rotate` | Rotate specific secret |

### Admin - RBAC

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/rbac/roles` | List all roles |
| POST | `/api/admin/users/:id/roles` | Update user roles |

## Scripts

### Manual JWT Rotation

```bash
# Rotate JWT secret for staging
node worker/scripts/rotate-jwt.js staging

# Rotate JWT secret for production
node worker/scripts/rotate-jwt.js production
```

## Environment Variables

Required in Cloudflare Worker:

```
SECRETS_STORE=KV namespace for secrets
SESSIONS=KV namespace for sessions
JWT_SECRET=Initial JWT secret (for bootstrap)
ENVIRONMENT=production|staging|local
```

## Security Best Practices

1. **Secret Rotation**: Rotate API keys every 90 days
2. **JWT Rotation**: Automatic rotation every 30 days
3. **Token Expiry**: Access tokens expire in 15 minutes
4. **Rate Limiting**: Auth endpoints limited to 5 req/min
5. **Password Policy**: Minimum 8 chars, mixed case, number, special char

## Migration

Run migration 006 to create security tables:

```bash
# Migration is applied automatically on worker startup
# Or manually via Wrangler CLI
wrangler d1 execute DB --file=./worker/src/migrations/006_security_rbac.js
```

## Testing

Run security tests:

```bash
cd worker
npm test -- security.test.js
```