import { Review } from '../../models/Review.js'
import { Setting } from '../../models/Setting.js'
import { env, isGoogleConfigured } from '../../config/env.js'
import { fetchPlaceReviews } from '../../services/googlePlaces.js'

/**
 * Reviews for the whole site, from Google when it is configured and from the
 * shop's own stored set when it is not.
 *
 * `source` is the load-bearing field, exactly as it is in `useGoogleReviews`:
 * every component that shows a rating reads it, so sample content can never be
 * presented as a Google rating. The site's own copy is explicit that the
 * sample figures are "SAMPLE — not a real Google rating", and this endpoint is
 * what keeps that honest.
 */
async function sampleSet() {
  const [reviews, summary, site] = await Promise.all([
    Review.find({ published: true }).sort({ order: 1 }),
    Review.summary(),
    Setting.get('site'),
  ])

  const sample = site?.sampleRating ?? {}

  return {
    status: 'sample',
    source: 'sample',
    reviews: reviews.map((r) => r.toJSON()),
    // The headline figures are the shop's stated sample numbers; the
    // distribution is computed from the stored reviews, so the histogram and
    // the wall below it always describe the same set.
    rating: sample.value ?? summary.average,
    total: sample.count ?? summary.total,
    distribution: summary.distribution,
    profileUrl: site?.site?.google?.mapsUrl ?? null,
    writeReviewUrl: writeReviewUrl(site),
  }
}

function writeReviewUrl(site) {
  const placeId = env.google.placeId
  return placeId
    ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`
    : (site?.site?.google?.mapsUrl ?? null)
}

export async function getReviews() {
  if (!isGoogleConfigured()) return sampleSet()

  try {
    const place = await fetchPlaceReviews()

    // An empty review list is not a usable result — keep the sample set rather
    // than rendering an empty wall.
    if (!place.reviews.length) {
      const fallback = await sampleSet()
      return { ...fallback, status: 'empty' }
    }

    const site = await Setting.get('site')
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    for (const r of place.reviews) distribution[r.rating] = (distribution[r.rating] ?? 0) + 1

    return {
      status: 'ready',
      source: 'google',
      reviews: place.reviews,
      rating: place.rating,
      total: place.total,
      // Google returns at most five reviews, so a histogram of them would
      // misrepresent hundreds of ratings. Null says "not available" rather
      // than showing five bars as if they were the whole picture.
      distribution: place.total && place.total > place.reviews.length ? null : distribution,
      profileUrl: place.profileUrl ?? site?.site?.google?.mapsUrl ?? null,
      writeReviewUrl: writeReviewUrl(site),
    }
  } catch (error) {
    console.warn('[reviews] Google fetch failed:', error.message)
    const fallback = await sampleSet()
    return { ...fallback, status: 'error' }
  }
}
