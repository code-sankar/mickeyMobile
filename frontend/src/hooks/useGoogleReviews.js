import { useEffect, useState } from 'react'
import { fetchPlaceReviews, isPlacesConfigured } from '../lib/googlePlaces'
import { testimonials } from '../data/testimonials'
import { site } from '../data/site'

/**
 * Reviews for the whole site, from Google when it is configured and from the
 * bundled sample set when it is not.
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
  profileUrl: site.google.mapsUrl,
}

export function useGoogleReviews() {
  const [state, setState] = useState(() =>
    isPlacesConfigured() ? { ...SAMPLE, status: 'loading' } : SAMPLE,
  )

  useEffect(() => {
    if (!isPlacesConfigured()) return

    let cancelled = false

    fetchPlaceReviews()
      .then((place) => {
        if (cancelled) return
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
          profileUrl: place.profileUrl ?? site.google.mapsUrl,
        })
      })
      .catch((error) => {
        if (cancelled) return
        if (import.meta.env.DEV) console.warn('[reviews] Google fetch failed:', error.message)
        setState({ ...SAMPLE, status: 'error' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
