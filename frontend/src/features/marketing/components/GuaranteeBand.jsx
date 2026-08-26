import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Reveal } from '../../../components/ui/Reveal'

export function GuaranteeBand() {
  return (
    <Reveal>
      <Card surface="lime" className="flex flex-col items-start gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center border-3 border-ink bg-paper-50">
            <ShieldCheck className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-display text-lg uppercase leading-tight sm:text-xl">
              If it fails again, you don&apos;t pay again.
            </h3>
            <p className="mt-2.5 max-w-xl text-xs font-medium leading-relaxed text-ink-800 sm:text-sm">
              Every repair carries up to 180 days of cover on the part and the labour, honoured at our counter
              the same day you walk back in — no courier, no escalation queue.
            </p>
          </div>
        </div>

        <Button to="/repairs" variant="ink" size="lg" className="w-full shrink-0 lg:w-auto">
          Get your estimate
          <ArrowRight className="h-4 w-4" strokeWidth={3} />
        </Button>
      </Card>
    </Reveal>
  )
}
