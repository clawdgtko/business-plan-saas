const DEFAULT_FEATURE_FLAGS = {
  'new-dashboard': false
}

const FEATURE_FLAG_ENV_PREFIX = 'FEATURE_FLAG_'
const FEATURE_FLAGS_ENV_KEY = 'FEATURE_FLAGS'

function coerceFlagValue(value) {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value !== 0
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['1', 'true', 'yes', 'on'].includes(normalized)) {
      return true
    }
    if (['0', 'false', 'no', 'off'].includes(normalized)) {
      return false
    }
  }

  return undefined
}

function normalizeFlagName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
}

function readJsonFlags(raw) {
  if (!raw || typeof raw !== 'string') {
    return {}
  }

  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }
    return parsed
  } catch (error) {
    return {}
  }
}

function readEnvFlags(env) {
  const flags = {}
  if (!env || typeof env !== 'object') {
    return flags
  }

  for (const [key, value] of Object.entries(env)) {
    if (!key.startsWith(FEATURE_FLAG_ENV_PREFIX)) {
      continue
    }

    const flagName = normalizeFlagName(key.slice(FEATURE_FLAG_ENV_PREFIX.length))
    if (!flagName) {
      continue
    }

    const coerced = coerceFlagValue(value)
    if (typeof coerced === 'boolean') {
      flags[flagName] = coerced
    }
  }

  return flags
}

export function loadFeatureFlags(env = {}) {
  const jsonFlags = readJsonFlags(env[FEATURE_FLAGS_ENV_KEY])
  const envFlags = readEnvFlags(env)

  return {
    ...DEFAULT_FEATURE_FLAGS,
    ...jsonFlags,
    ...envFlags
  }
}

export function isFeatureEnabled(flagName, flags = {}) {
  return Boolean(flags[flagName])
}

export { DEFAULT_FEATURE_FLAGS }
