import { useEffect, useState } from 'react'
import { fetchPlaceReviews, isPlacesConfigured } from '../lib/googlePlaces'
import { api, isApiConfigured } from '../lib/api'
import { testimonials } from '../data/testimonials'
import { site } from '../data/site'

/**
 * Reviews for the whole site, from the best source available.
 *
 * Three sources, in order of preference:
 *
 *   1. The API, which proxies Google Places server-side. Preferred because the
 *      Places key stays on the server — it never ships in this bundle, so it
 *      can be IP-restricted rather than referrer-restricted.
 *   2. Google direct from the browser, if a `VITE_GOOGLE_*` key is still
 *      configured. Kept so a deployment without the API behaves as it did.
 *   3. The bundled sample set, which always renders.
 *
 * `source` is the important part of the return value: every component that
 * shows a rating reads it, so sample content can never be presented as a
 * Google rating. Nothing fetched here is cached — see lib/googlePlaces.js.
 */
const SAMPLE = {
  status: 'sample',
  source: 'sample',
  reviews: testimonials,
  rating: site.sampleRating.value,
  total: site.sampleRating.count,
  distribution: null,
  profileUrl: site.google.mapsUrl,
}

/** Normalises an API payload into the shape this hook already returns. */
const fromApi = (data) => ({
  status: data.status ?? 'ready',
  source: data.source ?? 'sample',
  reviews: data.reviews?.length ? data.reviews : SAMPLE.reviews,
  rating: data.rating ?? SAMPLE.rating,
  total: data.total ?? SAMPLE.total,
  distribution: data.distribution ?? null,
  profileUrl: data.profileUrl ?? SAMPLE.profileUrl,
})

const hasRemoteSource = () => isApiConfigured() || isPlacesConfigured()

export function useGoogleReviews() {
  const [state, setState] = useState(() =>
    hasRemoteSource() ? { ...SAMPLE, status: 'loading' } : SAMPLE,
  )

  useEffect(() => {
    if (!hasRemoteSource()) return

    const controller = new AbortController()

    async function load() {
      // The API already decides between live Google reviews and the shop's own
      // set, and reports which in `source` — so its answer is taken as final
      // rather than second-guessed here.
      if (isApiConfigured()) {
        const data = await api.reviews(controller.signal)
        if (controller.signal.aborted) return
        if (data) {
          setState(fromApi(data))
          return
        }
      }

      if (!isPlacesConfigured()) {
        if (!controller.signal.aborted) setState({ ...SAMPLE, status: 'error' })
        return
      }

      try {
        const place = await fetchPlaceReviews()
        if (controller.signal.aborted) return
        // An empty review list is not a usable result — keep the sample set
        // rather than rendering an empty wall.
        if (!place.reviews.length) {
          setState({ ...SAMPLE, status: 'empty' })
          return
        }
        setState({
          status: 'ready',
          source: 'google',
          reviews: place.reviews,
          rating: place.rating ?? SAMPLE.rating,
          total: place.total ?? SAMPLE.total,
          distribution: null,
          profileUrl: place.profileUrl ?? site.google.mapsUrl,
        })
      } catch (error) {
        if (controller.signal.aborted) return
        if (import.meta.env.DEV) console.warn('[reviews] Google fetch failed:', error.message)
        setState({ ...SAMPLE, status: 'error' })
      }
    }

    load()

    return () => controller.abort()
  }, [])

  return state
}
