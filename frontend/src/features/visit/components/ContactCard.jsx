import { Mail, PhoneCall } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { WhatsAppButton } from '../../../components/ui/WhatsAppButton'
import { Card } from '../../../components/ui/Card'
import { site } from '../../../data/site'
import { waMessage } from '../../../lib/whatsapp'

export function ContactCard() {
  return (
    <Card className="p-5 sm:p-6">
      <h3 className="font-display text-sm uppercase leading-tight">
        Talk to a technician, not a call centre
      </h3>
      <p className="mt-2.5 text-xs font-medium leading-relaxed text-ink-800 sm:text-sm">
        Send a photo of the damage and we&apos;ll quote it before you leave the house.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Button href={site.phoneHref} size="lg">
          <PhoneCall className="h-4 w-4" strokeWidth={2.5} />
          Call now
        </Button>
        <WhatsAppButton message={waMessage.visit()} size="lg" />
      </div>

      <dl className="mt-5 border-t-3 border-ink pt-4">
        <div className="flex items-center justify-between gap-4 py-1.5">
          <dt className="flex items-center gap-2 font-mono text-2xs font-bold uppercase tracking-wider text-ink-500">
            <PhoneCall className="h-3 w-3" strokeWidth={3} />
            Phone
          </dt>
          <dd>
            <a
              href={site.phoneHref}
              className="font-mono text-sm font-bold underline decoration-3 underline-offset-4 hover:bg-acid hover:no-underline"
            >
              {site.phoneDisplay}
            </a>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-1.5">
          <dt className="flex items-center gap-2 font-mono text-2xs font-bold uppercase tracking-wider text-ink-500">
            <Mail className="h-3 w-3" strokeWidth={3} />
            Email
          </dt>
          <dd>
            <a
              href={`mailto:${site.email}`}
              className="font-mono text-sm font-bold underline decoration-3 underline-offset-4 hover:bg-acid hover:no-underline"
            >
              {site.email}
            </a>
          </dd>
        </div>
      </dl>
    </Card>
  )
}
