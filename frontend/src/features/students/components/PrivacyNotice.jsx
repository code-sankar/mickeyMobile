import { ShieldCheck } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { collectedData, retentionPolicy } from '../../../data/students'
import { site } from '../../../data/site'

/**
 * What is collected, why, and how to get rid of it.
 *
 * Shown next to the form rather than buried behind a link, because consent
 * only counts as informed if the purposes are readable at the moment someone
 * is filling the fields in.
 */
export function PrivacyNotice() {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2.5 border-b-3 border-ink bg-lime px-5 py-4">
        <ShieldCheck className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
        <h3 className="font-display text-sm uppercase">What we ask for, and why</h3>
      </div>

      <dl className="divide-y-3 divide-ink">
        {collectedData.map((item) => (
          <div key={item.id} className="px-5 py-4">
            <dt className="font-mono text-2xs font-bold uppercase tracking-wider">{item.field}</dt>
            <dd className="mt-1.5 text-xs font-medium leading-relaxed text-ink-800">{item.purpose}</dd>
          </div>
        ))}
      </dl>

      <div className="border-t-3 border-ink bg-paper-200 px-5 py-4">
        <ul className="space-y-2.5">
          <li className="text-xs font-medium leading-relaxed text-ink-800">{retentionPolicy.idCard}</li>
          <li className="text-xs font-medium leading-relaxed text-ink-800">
            {retentionPolicy.registration}
          </li>
          <li className="text-xs font-medium leading-relaxed text-ink-800">
            To see, correct or delete what we hold, message us or email{' '}
            <a
              href={`mailto:${site.email}`}
              className="font-bold underline decoration-3 underline-offset-4 hover:bg-acid hover:no-underline"
            >
              {site.email}
            </a>
            .
          </li>
        </ul>
      </div>
    </Card>
  )
}
