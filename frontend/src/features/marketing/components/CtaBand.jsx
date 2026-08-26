import { ArrowUpRight, PhoneCall } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Reveal } from '../../../components/ui/Reveal'
import { site } from '../../../data/site'

/** The closing pitch, reused by the footer on every route. */
export function CtaBand() {
  return (
    <Reveal>
      <div className="relative overflow-hidden border-3 border-ink bg-electric p-7 text-center text-paper-50 shadow-brut-lg sm:p-12">
        <div className="halftone pointer-events-none absolute inset-0 text-paper-50/20" aria-hidden="true" />

        <div className="relative">
          <span className="inline-block border-3 border-ink bg-acid px-3 py-1 font-mono text-2xs font-bold uppercase tracking-[0.18em] text-ink">
            Ready when you are
          </span>

          <h2 className="mx-auto mt-6 max-w-3xl text-balance font-display text-[clamp(1.75rem,5.5vw,3rem)] uppercase leading-[0.92] text-paper-50">
            Bring it in today, walk out with it working.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-pretty text-sm font-medium leading-relaxed sm:text-base">
            Free diagnosis, a fixed quote before anything is opened, and up to 180 days of warranty on the work.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to="/repairs" variant="accent" size="lg">
              Get a repair estimate
              <ArrowUpRight className="h-4 w-4" strokeWidth={3} />
            </Button>
            <Button href={site.phoneHref} variant="paper" size="lg">
              <PhoneCall className="h-4 w-4" strokeWidth={2.5} />
              {site.phoneDisplay}
            </Button>
          </div>
        </div>
      </div>
    </Reveal>
  )
}
