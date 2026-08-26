import { ExternalLink } from 'lucide-react'
import { Stars } from '../../../components/ui/Stars'
import { Counter } from '../../../components/ui/Counter'
import { Card } from '../../../components/ui/Card'
import { SampleNotice } from './SampleNotice'
import { useGoogleReviews } from '../../../hooks/useGoogleReviews'

/**
 * Illustrative distribution for the sample set only.
 * Place Details returns an overall rating and a count but no star breakdown,
 * so these bars are hidden entirely once real reviews are in play rather than
 * being invented from them.
 */
const sampleBars = [
  { stars: 5, pct: 92 },
  { stars: 4, pct: 6 },
  { stars: 3, pct: 1 },
  { stars: 2, pct: 0 },
  { stars: 1, pct: 1 },
]

export function RatingSummary({ className }) {
  const { source, rating, total, profileUrl, status } = useGoogleReviews()
  const live = source === 'google'

  return (
    <Card className={className}>
      <div className="flex items-center gap-4 border-b-3 border-ink bg-acid p-5">
        <div>
          <p className="font-display text-4xl uppercase leading-none">
            <Counter value={rating} decimals={1} />
          </p>
          <Stars value={rating} size="md" className="mt-2.5" />
        </div>
        <div className="ml-auto text-right">
          <p className="font-mono text-2xs font-bold uppercase tracking-wider">Based on</p>
          <p className="mt-1.5 font-display text-sm uppercase">
            <Counter value={total} /> reviews
          </p>
          <p className="mt-1 font-mono text-2xs font-bold uppercase tracking-wider text-ink-700">
            {live ? 'Google' : status === 'loading' ? 'Loading…' : 'Sample data'}
          </p>
        </div>
      </div>

      {live ? (
        <div className="p-5">
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="press inline-flex items-center gap-2 border-3 border-ink bg-paper-200 px-3 py-2 font-mono text-2xs font-bold uppercase tracking-wider shadow-brut-xs"
          >
            Reviews from Google
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
          </a>
        </div>
      ) : (
        <>
          <ul className="space-y-2 p-5">
            {sampleBars.map((bar) => (
              <li key={bar.stars} className="flex items-center gap-3">
                <span className="w-3 font-mono text-2xs font-bold">{bar.stars}</span>
                <span className="h-3 flex-1 border-3 border-ink bg-paper-200">
                  <span className="block h-full bg-ink" style={{ width: `${bar.pct}%` }} />
                </span>
                <span className="w-9 text-right font-mono text-2xs font-bold tabular">{bar.pct}%</span>
              </li>
            ))}
          </ul>
          <SampleNotice className="m-5 mt-0" />
        </>
      )}
    </Card>
  )
}
