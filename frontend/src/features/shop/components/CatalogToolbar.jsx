import { Search, SlidersHorizontal, X } from 'lucide-react'
import { SORTS } from '../hooks/useCatalogFilters'
import { listCategories, categoryCounts } from '../../../data/selectors'
import { cx } from '../../../lib/utils'

const counts = categoryCounts()

export function CatalogToolbar({ category, query, sort, onChange, resultCount }) {
  return (
    <div className="border-3 border-ink bg-paper-50 shadow-brut">
      {/* ---------- Search + sort ---------- */}
      <div className="flex flex-col gap-0 border-b-3 border-ink sm:flex-row">
        <div className="relative flex-1 border-b-3 border-ink sm:border-b-0 sm:border-r-3">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
            strokeWidth={3}
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => onChange({ q: e.target.value })}
            placeholder="Search the shelf…"
            aria-label="Search products"
            className="h-14 w-full bg-transparent pl-11 pr-11 font-sans text-sm font-bold text-ink placeholder:font-medium placeholder:text-ink-400 focus:bg-acid/25 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => onChange({ q: '' })}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center border-3 border-ink bg-paper-200 hover:bg-flare hover:text-paper-50"
            >
              <X className="h-3.5 w-3.5" strokeWidth={3} />
            </button>
          )}
        </div>

        <div className="relative shrink-0">
          <SlidersHorizontal
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
            strokeWidth={3}
            aria-hidden="true"
          />
          <select
            value={sort}
            onChange={(e) => onChange({ sort: e.target.value })}
            aria-label="Sort products"
            className="h-14 w-full appearance-none bg-transparent pl-11 pr-6 font-mono text-2xs font-bold uppercase tracking-wider text-ink focus:bg-acid/25 focus:outline-none sm:w-56"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ---------- Category rail ---------- */}
      <div className="no-scrollbar flex items-center gap-0 overflow-x-auto">
        {listCategories().map((c) => {
          const active = category === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange({ category: c.id })}
              aria-pressed={active}
              className={cx(
                'flex shrink-0 items-center gap-2 border-r-3 border-ink px-4 py-3 font-mono text-2xs font-bold uppercase tracking-wider transition-colors duration-150',
                active ? 'bg-ink text-paper-50' : 'bg-paper-50 hover:bg-acid',
              )}
            >
              {c.label}
              <span
                className={cx(
                  'grid h-5 min-w-5 place-items-center px-1 text-[10px] tabular',
                  active ? 'bg-acid text-ink' : 'bg-paper-300 text-ink-700',
                )}
              >
                {counts[c.id]}
              </span>
            </button>
          )
        })}

        <p className="ml-auto shrink-0 whitespace-nowrap px-4 font-mono text-2xs font-bold uppercase tracking-wider text-ink-500">
          {resultCount} {resultCount === 1 ? 'item' : 'items'}
        </p>
      </div>
    </div>
  )
}
