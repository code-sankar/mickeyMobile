import { Link } from 'react-router-dom'
import { cx } from '../../lib/utils'
import { site } from '../../data/site'

export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 64 64" className={cx('h-10 w-10', className)} aria-hidden="true">
      <rect x="2" y="2" width="60" height="60" fill="#FFE01F" stroke="#141210" strokeWidth="4" />
      <rect x="21" y="12" width="22" height="40" fill="#FBF6E9" stroke="#141210" strokeWidth="3.5" />
      <path
        d="M35 20 25 36h7l-2 12 11-17h-7z"
        fill="#2B44FF"
        stroke="#141210"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Logo({ className, compact = false }) {
  return (
    <Link to="/" className={cx('group inline-flex items-center gap-2.5', className)} aria-label={`${site.name} — home`}>
      <LogoMark className="shrink-0 transition-transform duration-150 ease-snap group-hover:-rotate-3" />
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-base uppercase tracking-tight">{site.name}</span>
          <span className="mt-1 block font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-ink-500">
            {site.tagline}
          </span>
        </span>
      )}
    </Link>
  )
}
