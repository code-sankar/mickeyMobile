/**
 * Google Places (New) — live review fetch.
 *
 * Reviews are Google's content, not ours. The Places API terms permit caching
 * Place IDs but not the review bodies, ratings or author names, so nothing
 * here is written into `src/data` or persisted: reviews are fetched in the
 * visitor's browser and rendered straight from the response.
 *
 * The key is public by necessity (it ships in the bundle, like any Maps JS
 * key). Restrict it by HTTP referrer to your domains in Google Cloud Console
 * and enable only the Maps JavaScript API + Places API on it.
 */

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const PLACE_ID = import.meta.env.VITE_GOOGLE_PLACE_ID

/** Both halves are required — a key without a place, or vice versa, is not usable. */
export function isPlacesConfigured() {
  return Boolean(API_KEY && PLACE_ID)
}

let mapsPromise = null

/** Injects the Maps JS bootstrap once, however many components ask for it. */
function loadMapsApi() {
  if (mapsPromise) return mapsPromise

  mapsPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'))
    if (window.google?.maps?.importLibrary) return resolve(window.google)

    const script = document.createElement('script')
    script.src =
      'https://maps.googleapis.com/maps/api/js' +
      `?key=${encodeURIComponent(API_KEY)}&libraries=places&v=weekly&loading=async`
    script.async = true
    script.onload = () => resolve(window.google)
    script.onerror = () => {
      mapsPromise = null
      reject(new Error('Google Maps JS API failed to load'))
    }
    document.head.appendChild(script)
  })

  return mapsPromise
}

const TONES = ['blue', 'emerald', 'violet', 'amber', 'slate']

function initialsOf(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

/**
 * Normalises one review into the shape the site's ReviewCard already renders.
 *
 * Places (New) nests the author under `authorAttribution` and returns text as
 * an object; the legacy web-service shape is flat. Both are accepted so a
 * field rename on Google's side degrades to a missing value rather than a
 * crash.
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
    photo: author.photoURI ?? review.profile_photo_url ?? null,
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
  if (!isPlacesConfigured()) throw new Error('Google Places is not configured')

  const google = await loadMapsApi()
  const { Place } = await google.maps.importLibrary('places')

  const place = new Place({ id: PLACE_ID })
  await place.fetchFields({
    fields: ['displayName', 'rating', 'userRatingCount', 'reviews', 'googleMapsURI'],
  })

  return {
    name: place.displayName ?? null,
    rating: place.rating ?? null,
    total: place.userRatingCount ?? null,
    profileUrl: place.googleMapsURI ?? null,
    reviews: (place.reviews ?? []).map(normalizeReview).filter(Boolean),
  }
}

/** Deep link that opens the listing's review composer, when a Place ID is set. */
export function writeReviewUrl(fallbackUrl) {
  return PLACE_ID
    ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(PLACE_ID)}`
    : fallbackUrl
}
