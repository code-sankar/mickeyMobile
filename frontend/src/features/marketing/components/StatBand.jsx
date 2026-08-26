import { Counter } from '../../../components/ui/Counter'
import { site } from '../../../data/site'
import { useGoogleReviews } from '../../../hooks/useGoogleReviews'
import { cx } from '../../../lib/utils'

const fills = ['bg-acid', 'bg-electric text-paper-50', 'bg-lime', 'bg-blush']

/** Four hard-edged panels, each its own flat colour. */
export function StatBand() {
  const { rating, total, source } = useGoogleReviews()

  // The rating tile is the one figure that must not be hard-coded — it shows
  // the live Google average when connected, and says so only then.
  const stats = site.stats.map((stat) =>
    stat.fromReviews
      ? {
          ...stat,
          value: rating,
          label: source === 'google' ? `${total} Google reviews` : 'Average rating (sample)',
        }
      : stat,
  )

  return (
    <section aria-label="Store record" className="border-b-3 border-ink">
      <dl className="grid grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={cx(
              'border-ink px-5 py-7 sm:px-7',
              fills[i % fills.length],
              i % 2 === 0 && 'border-r-3',
              i < 2 && 'border-b-3 lg:border-b-0',
              i === 1 && 'lg:border-r-3',
              i === 2 && 'lg:border-r-3',
            )}
          >
            <dd className="font-display text-3xl uppercase leading-none sm:text-4xl">
              <Counter value={stat.value} decimals={stat.decimals ?? 0} suffix={stat.suffix} />
            </dd>
            <dt className="mt-3 font-mono text-2xs font-bold uppercase tracking-[0.16em]">{stat.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}
