/**
 * The API client.
 *
 * The site is built to work without this. Every page renders from the data
 * bundled in `src/data/`, which is the same content the API is seeded from, so
 * a visitor sees the catalogue and the estimator instantly and correctly even
 * if the server is down, cold-starting, or has not been deployed yet.
 *
 * What the API adds on top:
 *
 *   - Writes that actually persist. A booking becomes a real ticket with a
 *     unique number instead of a `Math.random()` one that nothing stores.
 *   - A Google Places key that never ships to the browser.
 *   - Open/closed decided in the shop's timezone rather than the visitor's.
 *
 * So every call here is written to *fail softly*: callers get `null` (or a
 * thrown `ApiError` they are expected to catch) and fall back to the local
 * path. Nothing in this module is allowed to break a render.
 */

/** Unset means "no API configured" — the site runs entirely on bundled data. */
const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''

/** A slow network should not hold a form hostage; fall back instead. */
const TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 10_000

export const isApiConfigured = () => Boolean(BASE_URL)

/**
 * A failed request, carrying the field-keyed `details` the API returns for a
 * 422 — the same shape the forms already hold in their `errors` state.
 */
export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK', details = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  /** True when retrying or falling back is the right move, not fixing input. */
  get isTransient() {
    return this.status === 0 || this.status === 429 || this.status >= 500
  }

  /** True when the user can fix this by editing the form. */
  get isValidation() {
    return this.status === 422 || this.status === 409
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  if (!BASE_URL) throw new ApiError('No API configured', { code: 'NOT_CONFIGURED' })

  // Caller-supplied aborts (an unmounting component) and our own timeout both
  // need to cancel the same request.
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort, { once: true })

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    // A proxy or a cold start can answer with HTML; treat anything unparseable
    // as a transport failure rather than letting `.json()` throw raw.
    const payload = await response.json().catch(() => null)

    if (!response.ok || !payload?.ok) {
      const error = payload?.error
      throw new ApiError(error?.message ?? `Request failed (${response.status})`, {
        status: response.status,
        code: error?.code ?? 'HTTP_ERROR',
        details: error?.details ?? null,
      })
    }

    return payload.data
  } catch (error) {
    if (error instanceof ApiError) throw error
    // AbortError covers both our timeout and an unmounted caller.
    throw new ApiError(
      error.name === 'AbortError' ? 'The server took too long to answer' : 'Could not reach the server',
      { code: error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK' },
    )
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', onAbort)
  }
}

/**
 * Read helper for progressive enhancement.
 *
 * Returns `null` instead of throwing, because every read in this app has a
 * bundled fallback and a caller that must keep rendering. A read failing is
 * not an error condition for the site — it is the normal offline path.
 */
async function tryRead(path, options) {
  if (!BASE_URL) return null
  try {
    return await request(path, options)
  } catch (error) {
    if (import.meta.env.DEV) console.warn(`[api] ${path} unavailable:`, error.message)
    return null
  }
}

export const api = {
  /* -------------------------------------------------------------- reads --- */
  /** All soft: `null` means "use the bundled data". */

  reviews: (signal) => tryRead('/reviews', { signal }),

  openStatus: (signal) => tryRead('/site/status', { signal }),

  /* ------------------------------------------------------------- writes --- */
  /** These throw — a caller must decide between showing errors and falling back. */

  createBooking: (booking, signal) =>
    request('/bookings', { method: 'POST', body: booking, signal }),

  registerStudent: (registration, signal) =>
    request('/students/register', { method: 'POST', body: registration, signal }),

  /**
   * Server-authoritative quote.
   *
   * The estimator computes the same number locally from bundled prices and
   * shows it immediately; this is only used at booking time, so the ticket
   * carries a price the server agreed to rather than one the client asserted.
   */
  quote: (selection, signal) =>
    request('/repairs/quote', { method: 'POST', body: selection, signal }),
}
