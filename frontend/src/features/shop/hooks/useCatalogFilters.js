import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { filterProducts, isCategory } from '../../../data/selectors'

export const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
]

const SORT_IDS = SORTS.map((s) => s.id)
const DEFAULTS = { category: 'all', q: '', sort: 'featured' }

/**
 * Catalogue state lives in the URL, not in component state.
 *
 * That makes a filtered shelf a shareable link, makes the back button undo a
 * filter, and means the page survives a reload — none of which local `useState`
 * can do. Unknown or default values are dropped so the URL stays clean.
 */
export function useCatalogFilters() {
  const [params, setParams] = useSearchParams()

  const rawCategory = params.get('category')
  const rawSort = params.get('sort')

  const category = rawCategory && isCategory(rawCategory) ? rawCategory : DEFAULTS.category
  const sort = rawSort && SORT_IDS.includes(rawSort) ? rawSort : DEFAULTS.sort
  const query = params.get('q') ?? DEFAULTS.q

  const results = useMemo(
    () => filterProducts({ category, query, sort }),
    [category, query, sort],
  )

  const update = useCallback(
    (patch) => {
      const next = new URLSearchParams(params)
      for (const [key, value] of Object.entries(patch)) {
        if (!value || value === DEFAULTS[key]) next.delete(key)
        else next.set(key, value)
      }
      // Filtering is not a navigation event — replace so Back leaves the shop
      // rather than stepping through every keystroke.
      setParams(next, { replace: true })
    },
    [params, setParams],
  )

  const reset = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams])

  const isFiltered = category !== DEFAULTS.category || query !== DEFAULTS.q || sort !== DEFAULTS.sort

  return { category, query, sort, results, update, reset, isFiltered }
}
