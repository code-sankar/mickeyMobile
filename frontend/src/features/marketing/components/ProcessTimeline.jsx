import { Clock3 } from 'lucide-react'
import { Reveal } from '../../../components/ui/Reveal'
import { Card } from '../../../components/ui/Card'
import { processSteps } from '../../../data/process'
import { cx } from '../../../lib/utils'

const fills = ['bg-acid', 'bg-lime', 'bg-blush', 'bg-electric text-paper-50']

export function ProcessTimeline() {
  return (
    <ol className="grid gap-6 lg:grid-cols-4 lg:gap-5">
      {processSteps.map((step, i) => {
        const Icon = step.icon
        return (
          <Reveal key={step.id} delay={i * 100} as="li" className="h-full">
            <Card className="flex h-full flex-col">
              <div
                className={cx(
                  'flex items-center justify-between gap-3 border-b-3 border-ink px-5 py-4',
                  fills[i % fills.length],
                )}
              >
                <span className="font-display text-3xl uppercase leading-none">{step.step}</span>
                <span className="grid h-10 w-10 shrink-0 place-items-center border-3 border-ink bg-paper-50 text-ink">
                  <Icon className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <span className="flex w-fit items-center gap-1.5 border-3 border-ink bg-paper-200 px-2 py-0.5 font-mono text-2xs font-bold uppercase tracking-wider">
                  <Clock3 className="h-3 w-3" strokeWidth={3} />
                  {step.duration}
                </span>

                <h3 className="mt-4 font-display text-base uppercase leading-tight">{step.title}</h3>
                <p className="mt-2.5 text-xs font-medium leading-relaxed text-ink-800">{step.summary}</p>

                <ul className="mt-5 space-y-2 border-t-3 border-ink pt-4">
                  {step.detail.map((d) => (
                    <li key={d} className="flex gap-2 text-xs font-medium leading-relaxed text-ink-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-ink" aria-hidden="true" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </Reveal>
        )
      })}
    </ol>
  )
}
