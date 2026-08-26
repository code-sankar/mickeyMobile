import { Clock3 } from 'lucide-react'
import { hours } from '../../../data/site'
import { Card } from '../../../components/ui/Card'
import { to12h } from '../../../lib/hours'
import { useOpenStatus } from '../../../hooks/useOpenStatus'
import { cx } from '../../../lib/utils'

export function HoursCard() {
  const status = useOpenStatus()
  const todayIndex = new Date().getDay()

  return (
    <Card>
      <div
        className={cx(
          'flex flex-wrap items-center justify-between gap-3 border-b-3 border-ink px-5 py-4',
          status.open ? 'bg-lime' : 'bg-paper-300',
        )}
      >
        <h3 className="flex items-center gap-2 font-display text-sm uppercase">
          <Clock3 className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
          Opening hours
        </h3>
        <span className="inline-flex items-center gap-2 border-3 border-ink bg-paper-50 px-2.5 py-1 font-mono text-2xs font-bold uppercase tracking-wider">
          <span className="relative flex h-2 w-2">
            {status.open && <span className="absolute inline-flex h-full w-full animate-ping-square bg-ink opacity-70" />}
            <span className={cx('relative inline-flex h-2 w-2', status.open ? 'bg-ink' : 'bg-ink-400')} />
          </span>
          {status.label}
        </span>
      </div>

      <p className="border-b-3 border-ink bg-paper-200 px-5 py-2.5 font-mono text-2xs font-bold uppercase tracking-wider">
        {status.detail}
      </p>

      <ul>
        {hours.map((row, i) => {
          const isToday = row.dayIndex === todayIndex
          return (
            <li
              key={row.day}
              className={cx(
                'flex items-center justify-between gap-3 px-5 py-2.5 text-sm',
                i > 0 && 'border-t-3 border-ink',
                isToday ? 'bg-acid font-bold' : 'font-medium',
              )}
            >
              <span className="flex items-center gap-2">
                {row.day}
                {isToday && (
                  <span className="border-3 border-ink bg-paper-50 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider">
                    Today
                  </span>
                )}
              </span>
              <span className="font-mono text-xs font-bold tabular">
                {to12h(row.open)} – {to12h(row.close)}
              </span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
