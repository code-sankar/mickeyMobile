import { Star } from 'lucide-react'
import { cx } from '../../lib/utils'

export function Stars({ value = 5, size = 'sm', className, showValue = false }) {
  const px = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'

  return (
    <div className={cx('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cx(px, i < Math.round(value) ? 'fill-ink text-ink' : 'fill-none text-ink/30')}
            strokeWidth={2.5}
            aria-hidden="true"
          />
        ))}
      </div>
      {showValue && <span className="ml-1 font-display text-sm tabular">{value.toFixed(1)}</span>}
    </div>
  )
}
