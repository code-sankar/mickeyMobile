import { BadgeCheck, Quote as QuoteIcon } from 'lucide-react'
import { Stars } from '../../../components/ui/Stars'
import { Card } from '../../../components/ui/Card'
import { tones } from '../../shop/components/ProductVisual'
import { cx } from '../../../lib/utils'

export function ReviewCard({ review, className }) {
  const tone = tones[review.tone] ?? tones.blue
  // Sample reviews carry the device they were written about; Google reviews
  // have no such field, so the sub-label falls back to the relative date.
  const subLabel = review.device ?? null

  return (
    <Card as="figure" className={cx('flex h-full flex-col p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <Stars value={review.rating} />
        <QuoteIcon className="h-6 w-6 shrink-0 text-ink/15" strokeWidth={2.5} aria-hidden="true" />
      </div>

      <blockquote className="mt-4 flex-1 text-pretty text-sm font-medium leading-relaxed text-ink-800">
        {review.body}
      </blockquote>

      <figcaption className="mt-5 flex items-center gap-3 border-t-3 border-ink pt-4">
        {review.photo ? (
          <img
            src={review.photo}
            alt=""
            width="40"
            height="40"
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-10 w-10 shrink-0 border-3 border-ink object-cover"
          />
        ) : (
          <span
            className={cx(
              'grid h-10 w-10 shrink-0 place-items-center border-3 border-ink font-display text-xs uppercase',
              tone.chip,
            )}
          >
            {review.initials}
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-display text-xs uppercase">{review.name}</span>
            {review.verified && (
              <BadgeCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-label="Verified customer" />
            )}
          </span>
          {subLabel && (
            <span className="mt-1 block truncate font-mono text-2xs font-bold uppercase tracking-wider text-ink-500">
              {subLabel}
            </span>
          )}
        </span>

        {review.date && (
          <span className="shrink-0 font-mono text-2xs font-bold uppercase text-ink-500">{review.date}</span>
        )}
      </figcaption>
    </Card>
  )
}
