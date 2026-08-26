import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cx } from '../../lib/utils'

/** Full literal class strings — Tailwind only extracts what it can see. */
const TONES = {
  acid: 'bg-acid',
  electric: 'bg-electric text-paper-50',
  lime: 'bg-lime',
  grape: 'bg-grape text-paper-50',
  blush: 'bg-blush',
  flare: 'bg-flare text-paper-50',
}

/**
 * The banner every inner route opens with. Sits directly under the fixed
 * header, so it also carries the breadcrumb trail back to the home page.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs = [],
  tone = 'acid',
  // Routes whose body already owns the page's <h1> — the product page, whose
  // heading is the product name — pass 'p' so the document keeps one <h1>.
  titleAs: Title = 'h1',
  children,
}) {
  return (
    // An unknown tone falls back to acid rather than resolving to undefined,
    // which would render the banner with no fill at all.
    <header className={cx('border-b-3 border-ink', TONES[tone] ?? TONES.acid)}>
      <div className="container-x py-10 sm:py-14">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 font-mono text-2xs font-bold uppercase tracking-wider">
              <li>
                <Link to="/" className="underline decoration-3 underline-offset-4 hover:no-underline">
                  Home
                </Link>
              </li>
              {crumbs.map((crumb, i) => (
                <li key={crumb.label} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                  {crumb.to && i < crumbs.length - 1 ? (
                    <Link to={crumb.to} className="underline decoration-3 underline-offset-4 hover:no-underline">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="opacity-70">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {eyebrow && (
          <p className="mt-6 inline-block border-3 border-ink bg-paper-50 px-3 py-1 font-mono text-2xs font-bold uppercase tracking-[0.18em] text-ink">
            {eyebrow}
          </p>
        )}

        <Title className="mt-5 max-w-4xl text-balance font-display text-[clamp(2.1rem,7vw,4rem)] uppercase leading-[0.9]">
          {title}
        </Title>

        {description && (
          <p className="mt-5 max-w-2xl text-pretty text-sm font-medium leading-relaxed sm:text-base">
            {description}
          </p>
        )}

        {children && <div className="mt-7">{children}</div>}
      </div>
    </header>
  )
}
