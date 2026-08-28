import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, MapPin, PackageCheck, ShieldCheck, ShoppingBag, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { RepairTicket } from '../../repairs/components/RepairTicket'
import { site } from '../../../data/site'
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion'
import { useGoogleReviews } from '../../../hooks/useGoogleReviews'
import { cx } from '../../../lib/utils'

/** The headline's rotating tail. Cycles on a timer, or on click. */
const ROTATIONS = [
  { text: 'Under One Roof.', tone: 'bg-electric text-paper-50' },
  { text: 'In Under an Hour.', tone: 'bg-flare text-paper-50' },
  { text: 'With Real Warranty.', tone: 'bg-lime text-ink' },
]

const TRUST = [
  { icon: Zap, label: 'Same-day repair', tone: 'acid' },
  { icon: ShieldCheck, label: '90-day warranty', tone: 'lime' },
  { icon: PackageCheck, label: 'Original parts', tone: 'paper' },
]

export function Hero() {
  const reduced = usePrefersReducedMotion()
  const { rating, total, source } = useGoogleReviews()
  const [rotation, setRotation] = useState(0)
  const [paused, setPaused] = useState(false)

  const advance = useCallback(() => setRotation((r) => (r + 1) % ROTATIONS.length), [])

  useEffect(() => {
    if (reduced || paused) return
    const id = setInterval(advance, 3600)
    return () => clearInterval(id)
  }, [advance, reduced, paused])

  const current = ROTATIONS[rotation]

  return (
    <section className="grid-paper relative overflow-hidden border-b-3 border-ink bg-paper-100 pb-14 pt-28 sm:pt-32 lg:pb-20 lg:pt-36">
      <div className="container-x relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* ---------- Copy ---------- */}
          <div className="animate-slam-in">
            <Link
              to="/visit"
              className="press inline-flex items-center gap-2.5 border-3 border-ink bg-paper-50 py-1.5 pl-2 pr-3.5 shadow-brut-xs"
            >
              <span className="grid h-6 w-6 place-items-center border-3 border-ink bg-lime">
                <MapPin className="h-3 w-3" strokeWidth={3} />
              </span>
              <span className="font-mono text-2xs font-bold uppercase tracking-wider">
                Now open in {site.address.line2}, {site.address.city}
                <span className="mx-2">·</span>
                Walk-ins welcome
              </span>
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
            </Link>

            <h1 className="mt-7 text-balance font-display text-[clamp(2.25rem,9vw,3rem)] uppercase leading-[0.88] sm:text-[3.75rem] lg:text-[4.5rem]">
              <span className="block">Fast Device Repair</span>
              <span className="block">&amp; Premium Gear</span>

              {/* Interactive rotator */}
              <button
                type="button"
                onClick={advance}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
                aria-label="Show the next promise"
                className="group mt-3 block w-full text-left"
              >
                <span className="relative block h-[1.15em] overflow-hidden">
                  <span
                    key={rotation}
                    className={cx(
                      'inline-block animate-slide-up-in whitespace-nowrap border-3 border-ink px-3 py-1 text-[0.78em] leading-[1.05] shadow-brut',
                      'transition-transform duration-150 ease-snap group-hover:translate-x-[3px] group-hover:translate-y-[3px] group-hover:shadow-brut-xs',
                      current.tone,
                    )}
                  >
                    {current.text}
                  </span>
                </span>
              </button>
              <span className="sr-only" aria-live="polite">
                {current.text}
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-pretty text-sm font-medium leading-relaxed text-ink-800 sm:text-base">
              Cracked screen at 6pm, fixed by 7. New and certified refurbished handsets on the shelf, and the
              cases, chargers and audio worth putting on them — from one counter in TDA Market.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button to="/repairs" size="lg" className="w-full sm:w-auto">
                Book a repair
                <ArrowRight className="h-4 w-4" strokeWidth={3} />
              </Button>
              <Button to="/shop" variant="paper" size="lg" className="w-full sm:w-auto">
                <ShoppingBag className="h-4 w-4" strokeWidth={2.5} />
                Shop accessories
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap items-center gap-2.5">
              {TRUST.map(({ icon: Icon, label, tone }) => (
                <li key={label}>
                  <Badge tone={tone} icon={Icon} className="px-2.5 py-1.5">
                    {label}
                  </Badge>
                </li>
              ))}
              <li>
                <Badge tone="paper" className="px-2.5 py-1.5">
                  Free diagnostics
                </Badge>
              </li>
            </ul>
          </div>

          {/* ---------- Live ticket ---------- */}
          <div className="relative animate-slam-in [animation-delay:150ms]">
            {/* Only claims a review count once it is coming from Google. */}
            <span
              aria-hidden="true"
              className="absolute -left-4 -top-5 z-10 rotate-[-8deg] border-3 border-ink bg-acid px-3 py-1.5 font-display text-xs uppercase shadow-brut-sm"
            >
              {source === 'google' ? `${rating}★ · ${total} reviews` : 'Free diagnosis'}
            </span>

            <RepairTicket />

            <span
              aria-hidden="true"
              className="absolute -bottom-5 right-2 z-10 rotate-[5deg] border-3 border-ink bg-lime px-3 py-1.5 font-display text-xs uppercase shadow-brut-sm"
            >
              11,400+ repaired
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
