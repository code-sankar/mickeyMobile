import { TriangleAlert } from 'lucide-react'
import { site } from '../../../data/site'

/**
 * Shown wherever bundled sample reviews stand in for live Google ones.
 *
 * This is deliberately not dismissible and not dev-only: the sample set reads
 * exactly like real customer feedback, so the one thing the site must never do
 * is present it as a Google rating. Connect the profile (or delete
 * src/data/testimonials.js) and this disappears with it.
 */
export function SampleNotice({ className }) {
  return (
    <p
      className={`flex flex-wrap items-center gap-2 border-3 border-ink bg-flare px-3 py-2 font-mono text-2xs font-bold uppercase tracking-wider text-paper-50 ${className ?? ''}`}
    >
      <TriangleAlert className="h-3.5 w-3.5 shrink-0" strokeWidth={3} aria-hidden="true" />
      Sample reviews — not yet connected to Google
      <a
        href={site.google.mapsUrl}
        target="_blank"
        rel="noreferrer"
        className="underline decoration-3 underline-offset-4 hover:no-underline"
      >
        See the real profile
      </a>
    </p>
  )
}
