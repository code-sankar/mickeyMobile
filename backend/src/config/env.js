import 'dotenv/config'

/**
 * Environment, read and validated once.
 *
 * Anything the API cannot run without is asserted here rather than blowing up
 * halfway through the first request. Optional integrations (Google Places,
 * admin auth) degrade instead: the reviews endpoint falls back to the seeded
 * sample set, and admin routes refuse to mount without a secret.
 */

const required = (key) => {
  const value = process.env[key]
  if (!value) {
    console.error(`[env] Missing required variable: ${key}`)
    process.exit(1)
  }
  return value
}

const optional = (key, fallback = null) => process.env[key] ?? fallback

const int = (key, fallback) => {
  const raw = process.env[key]
  if (raw === undefined || raw === '') return fallback
  const value = Number.parseInt(raw, 10)
  return Number.isFinite(value) ? value : fallback
}

const list = (key, fallback = []) => {
  const raw = process.env[key]
  if (!raw) return fallback
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

const NODE_ENV = optional('NODE_ENV', 'development')

export const env = {
  nodeEnv: NODE_ENV,
  isProd: NODE_ENV === 'production',
  isTest: NODE_ENV === 'test',

  port: int('PORT', 4000),
  apiPrefix: optional('API_PREFIX', '/api/v1'),

  /** MongoDB Atlas connection string (mongodb+srv://…). */
  mongoUri: required('MONGODB_URI'),
  mongoDbName: optional('MONGODB_DB_NAME', 'mickey-mobile'),

  /**
   * Allowed browser origins. The frontend dev server and the deployed site.
   * Empty means "reflect any origin", which is only sane outside production.
   */
  corsOrigins: list('CORS_ORIGINS', ['http://localhost:5173', 'http://127.0.0.1:5173']),

  /** Admin JWT. Without a secret the /admin routes are not mounted at all. */
  jwtSecret: optional('JWT_SECRET'),
  jwtExpiresIn: optional('JWT_EXPIRES_IN', '12h'),

  /**
   * Google Places (New), server-side.
   *
   * Holding the key here rather than in the Vite bundle is the point of the
   * proxy: it can be IP-restricted instead of referrer-restricted, and it is
   * never shipped to a visitor.
   */
  google: {
    apiKey: optional('GOOGLE_MAPS_API_KEY'),
    placeId: optional('GOOGLE_PLACE_ID'),
    /**
     * Seconds to hold a Places response in memory. Google's terms allow
     * caching Place IDs but not review bodies, author names or ratings, so
     * this is a short in-process TTL only — nothing reaches MongoDB.
     */
    cacheTtlSeconds: int('GOOGLE_CACHE_TTL_SECONDS', 300),
  },

  /** Shop-local timezone, so "open now" does not depend on the caller's clock. */
  timezone: optional('SHOP_TIMEZONE', 'Asia/Kolkata'),

  rateLimit: {
    windowMs: int('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    max: int('RATE_LIMIT_MAX', 300),
    writeMax: int('RATE_LIMIT_WRITE_MAX', 20),
  },

  /** Trust proxy hop count — 1 behind a single reverse proxy (Render, Fly, Nginx). */
  trustProxy: int('TRUST_PROXY', 1),
}

export const isGoogleConfigured = () => Boolean(env.google.apiKey && env.google.placeId)

export const isAdminConfigured = () => Boolean(env.jwtSecret)
