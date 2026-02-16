// Validation middleware for Hono
import { validate } from '../validators/index.js'

export function validateBody(schema) {
  return async (c, next) => {
    let data
    try {
      data = await c.req.json()
    } catch (e) {
      return c.json({ error: 'JSON invalide' }, 400)
    }

    const result = validate(data, schema)
    if (!result.success) {
      return c.json({
        error: 'Validation failed',
        details: result.error
      }, 400)
    }

    // Attach validated data to context
    c.set('validatedData', result.data)
    await next()
  }
}
