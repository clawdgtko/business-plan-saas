import { loadFeatureFlags, isFeatureEnabled } from '../config/features.js'

export async function featureFlags(c, next) {
  const flags = loadFeatureFlags(c.env)
  c.set('features', flags)
  await next()
}

export function requireFeature(flagName) {
  return async (c, next) => {
    const flags = c.get('features') || loadFeatureFlags(c.env)

    if (!isFeatureEnabled(flagName, flags)) {
      return c.json({
        error: 'Feature disabled',
        feature: flagName
      }, 403)
    }

    await next()
  }
}
