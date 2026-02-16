// Auth Middleware avec OpenTelemetry
import { verify } from '@tsndr/cloudflare-worker-jwt';

export async function auth(c, next) {
  const logger = c.get('logger');
  
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Missing or invalid Authorization header', {
      type: 'auth.error',
      path: c.req.path
    });
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const token = authHeader.substring(7);
  
  try {
    // Vérifier le JWT
    const isValid = await verify(token, c.env.JWT_SECRET);
    
    if (!isValid) {
      logger.warn('Invalid JWT token', {
        type: 'auth.error',
        path: c.req.path
      });
      return c.json({ error: 'Invalid token' }, 401);
    }
    
    // Décoder le payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    logger.debug('User authenticated', {
      type: 'auth.success',
      userId: payload.userId,
      email: payload.email
    });
    
    c.set('user', payload);
    await next();
    
  } catch (error) {
    logger.error('Auth verification failed', {
      type: 'auth.error',
      error: error.message
    });
    return c.json({ error: 'Invalid token' }, 401);
  }
}
