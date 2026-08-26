import { Link } from 'react-router-dom'
import { ArrowRight, BatteryCharging, Headphones, ShieldCheck } from 'lucide-react'
import { Reveal } from '../../../components/ui/Reveal'
import { accessoryGroups } from '../../../data/selectors'
import { money } from '../../../lib/utils'
import { cx } from '../../../lib/utils'

/**
 * Icon and fill per accessory category. Keyed by category id and declared as
 * full literal class strings, the same rule the rest of the shop follows so
 * Tailwind can extract them.
 */
const LOOK = {
  cases: { icon: ShieldCheck, fill: 'bg-blush', blurb: 'Drop-tested shells that still fit in a pocket.' },
  chargers: { icon: BatteryCharging, fill: 'bg-acid', blurb: 'Fast, safe bricks and banks we actually use.' },
  audio: { icon: Headphones, fill: 'bg-lime', blurb: 'Buds worth the battery they borrow.' },
}

/** The three category panels that open the accessories page. */
export function AccessoryGroups() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {accessoryGroups().map((group, i) => {
        const look = LOOK[group.id] ?? LOOK.cases
        const Icon = look.icon

        return (
          <Reveal key={group.id} delay={i * 80} className="h-full">
            <Link
              to={`/shop?category=${group.id}`}
              className="press group flex h-full flex-col border-3 border-ink bg-paper-50 shadow-brut"
            >
              <div
                className={cx(
                  'flex items-center justify-between gap-3 border-b-3 border-ink px-5 py-4',
                  look.fill,
                )}
              >
                <span className="font-display text-2xl uppercase leading-none">{group.label}</span>
                <span className="grid h-11 w-11 shrink-0 place-items-center border-3 border-ink bg-paper-50">
                  <Icon className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-medium leading-relaxed text-ink-800">{look.blurb}</p>

                <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                  <div>
                    <p className="font-mono text-2xs font-bold uppercase tracking-wider text-ink-500">
                      {group.count} in stock · from
                    </p>
                    <p className="mt-1 font-display text-xl tabular">{money(group.from)}</p>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center border-3 border-ink bg-paper-200 transition-colors duration-150 group-hover:bg-acid">
                    <ArrowRight className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        )
      })}
    </div>
  )
}
