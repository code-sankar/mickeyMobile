import { ArrowRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { site } from '../../../data/site'

/**
 * The Visit page's banner.
 *
 * A one-off rather than the shared <PageHeader> because it carries the shop
 * portrait, and the artwork has to bleed off the bottom edge of the yellow
 * band — which the generic header's padding cannot do.
 *
 * The illustration already contains its own doodles (lightning, dot grid, plus
 * and minus) and a paper backdrop panel, so nothing decorative is drawn here;
 * the file ships with a transparent background so the band shows through.
 */
export function VisitHero() {
  return (
    <header className="relative overflow-hidden border-b-3 border-ink bg-acid">
      <div className="container-x">
        <div className="grid items-end gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-4">
          {/* ---------- Copy ---------- */}
          <div className="pb-10 pt-10 sm:pt-14 lg:pb-16">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 font-mono text-2xs font-bold uppercase tracking-wider">
                <li>
                  <Link to="/" className="underline decoration-3 underline-offset-4 hover:no-underline">
                    Home
                  </Link>
                </li>
                <li className="flex items-center gap-1.5">
                  <span aria-hidden="true">›</span>
                  <span aria-current="page" className="opacity-70">
                    Visit us
                  </span>
                </li>
              </ol>
            </nav>

            <p className="mt-6 inline-flex items-center gap-2 border-3 border-ink bg-paper-50 px-3 py-1.5 font-mono text-2xs font-bold uppercase tracking-[0.18em] shadow-brut-xs">
              <MapPin className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
              Find us
            </p>

            <h1 className="mt-5 max-w-2xl text-balance font-display text-[clamp(2.1rem,7vw,4rem)] uppercase leading-[0.9]">
              In TDA Market,
              <br />
              open seven days
            </h1>

            <p className="mt-5 max-w-xl text-pretty text-sm font-medium leading-relaxed sm:text-base">
              Second floor, Shop No 258. Bring the device and a photo ID — that&apos;s the whole checklist.
            </p>

            {/* Rotated ink sticker + a hand-drawn arrow pointing at the details below */}
            <div className="mt-8 flex items-end gap-3">
              <a
                href={site.directionsHref}
                target="_blank"
                rel="noreferrer"
                className="press inline-flex -rotate-1 items-center gap-2.5 border-3 border-ink bg-ink px-4 py-2.5 font-mono text-2xs font-bold uppercase tracking-wider text-paper-50 shadow-brut-sm"
              >
                <MapPin className="h-3.5 w-3.5 text-lime" strokeWidth={3} aria-hidden="true" />
                Now open in {site.address.line2}, {site.address.city}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
              </a>

              <svg
                viewBox="0 0 64 40"
                className="hidden h-9 w-14 shrink-0 sm:block"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 6c14-4 34-2 46 10 4 4 6 9 4 14"
                  stroke="#141210"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M46 28l8 4 2-9"
                  stroke="#141210"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* ---------- Portrait ---------- */}
          <div className="relative -mb-px flex justify-center lg:justify-end">
            <picture>
              <source srcSet="/mickeydaa.webp" type="image/webp" />
              <img
                src="/mickeydaa.png"
                alt=""
                width="1200"
                height="987"
                className="h-auto w-full max-w-[26rem] select-none lg:max-w-none"
              />
            </picture>
          </div>
        </div>
      </div>
    </header>
  )
}
