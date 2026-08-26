import { env, isGoogleConfigured } from '../config/env.js'

/**
 * Google Places (New) — server-side review fetch.
 *
 * Two things move by doing this here instead of in the browser, which is what
 * `src/lib/googlePlaces.js` does today:
 *
 *   1. The API key stops shipping in the Vite bundle. It can be IP-restricted
 *      to this server rather than referrer-restricted to a domain, which is a
 *      restriction a page cannot forge its way past.
 *   2. One upstream call serves every visitor instead of one call per page
 *      load, which is the difference between a free tier and a bill.
 *
 * What does NOT change: reviews are Google's content, not the shop's. The
 * Places terms permit caching Place IDs but not review bodies, ratings or
 * author names, so responses are held in this process for minutes and never
 * written to MongoDB. Restarting the server forgets them entirely, which is
 * the intended behaviour, not a limitation.
 */

const ENDPOINT = 'https://places.googleapis.com/v1/places'
const FIELDS = 'displayName,rating,userRatingCount,reviews,googleMapsUri'

const TONES = ['blue', 'emerald', 'violet', 'amber', 'slate']

/** In-process, short-lived, single-entry. Deliberately not a durable cache. */
let cache = { at: 0, value: null }

function initialsOf(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

/**
 * Normalises one review into the shape `ReviewCard` already renders.
 *
 * Places (New) nests the author under `authorAttribution` and returns text as
 * an object; the legacy shape is flat. Both are accepted so a field rename on
 * Google's side degrades to a missing value rather than a crash.
 */
function normalizeReview(review, i) {
  const author = review.authorAttribution ?? {}
  const name = author.displayName ?? review.author_name ?? 'Google reviewer'

  const text =
    (typeof review.text === 'string' ? review.text : review.text?.text) ??
    review.originalText?.text ??
    ''

  if (!text.trim()) return null

  return {
    id: review.name ?? `google-${i}`,
    name,
    initials: initialsOf(name),
    rating: review.rating ?? 5,
    date: review.relativePublishTimeDescription ?? review.relative_time_description ?? '',
    body: text.trim(),
    photo: author.photoUri ?? review.profile_photo_url ?? null,
    url: author.uri ?? review.author_url ?? null,
    tone: TONES[i % TONES.length],
    verified: true,
  }
}

/**
 * Live rating, review count and up to five reviews.
 * Five is Google's cap on the Place Details response — there is no supported
 * way to page past it.
 */
export async function fetchPlaceReviews() {
  if (!isGoogleConfigured()) throw new Error('Google Places is not configured')

  const fresh = Date.now() - cache.at < env.google.cacheTtlSeconds * 1000
  if (fresh && cache.value) return cache.value

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(`${ENDPOINT}/${encodeURIComponent(env.google.placeId)}`, {
      headers: {
        'X-Goog-Api-Key': env.google.apiKey,
        'X-Goog-FieldMask': FIELDS,
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`Places API ${response.status}: ${body.slice(0, 200)}`)
    }

    const place = await response.json()

    const value = {
      name: place.displayName?.text ?? null,
      rating: place.rating ?? null,
      total: place.userRatingCount ?? null,
      profileUrl: place.googleMapsUri ?? null,
      reviews: (place.reviews ?? []).map(normalizeReview).filter(Boolean),
    }

    cache = { at: Date.now(), value }
    return value
  } finally {
    clearTimeout(timeout)
  }
}

/** Drops the in-memory copy — used by tests and after a config change. */
export function clearPlacesCache() {
  cache = { at: 0, value: null }
}
