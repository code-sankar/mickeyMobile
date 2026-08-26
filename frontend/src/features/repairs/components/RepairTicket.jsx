import { useEffect, useState } from 'react'
import { Activity, Check, Clock3, Cpu, ShieldCheck } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { processSteps } from '../../../data/process'
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion'
import { cx, money } from '../../../lib/utils'

/**
 * The hero's "live" element: a workshop ticket that walks itself through the
 * four service stages, so the process is demonstrated before it is explained.
 */
export function RepairTicket() {
  const reduced = usePrefersReducedMotion()
  const [stage, setStage] = useState(1)

  useEffect(() => {
    if (reduced) {
      setStage(processSteps.length - 1)
      return
    }
    const id = setInterval(() => {
      setStage((s) => (s + 1) % (processSteps.length + 1))
    }, 2600)
    return () => clearInterval(id)
  }, [reduced])

  const done = stage >= processSteps.length
  const progress = Math.min(((stage + 1) / processSteps.length) * 100, 100)

  return (
    <div className="w-full border-3 border-ink bg-paper-50 shadow-brut-xl">
      <div className="flex items-center justify-between gap-4 border-b-3 border-ink bg-ink px-5 py-4 text-paper-100">
        <div>
          <p className="font-mono text-2xs font-bold uppercase tracking-[0.2em] text-paper-400">Live ticket</p>
          <p className="mt-1 font-display text-lg uppercase">MM-4821</p>
        </div>
        <Badge tone={done ? 'lime' : 'acid'} dot>
          {done ? 'Ready for pickup' : 'In progress'}
        </Badge>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3 border-3 border-ink bg-paper-200 p-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center border-3 border-ink bg-electric text-paper-50">
            <Cpu className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-xs uppercase">iPhone 15 Pro · 256 GB</p>
            <p className="mt-1 truncate text-xs font-medium text-ink-700">
              Screen replacement · Genuine OEM panel
            </p>
          </div>
        </div>

        {/* Stage rail */}
        <ol className="mt-5 space-y-2.5">
          {processSteps.map((step, i) => {
            const complete = i < stage
            const current = i === stage
            return (
              <li key={step.id} className="flex items-center gap-3">
                <span
                  className={cx(
                    'grid h-7 w-7 shrink-0 place-items-center border-3 border-ink transition-colors duration-200',
                    complete && 'bg-lime',
                    current && 'bg-acid',
                    !complete && !current && 'bg-paper-200',
                  )}
                >
                  {complete ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={4} />
                  ) : (
                    <span className="font-mono text-[10px] font-bold">{i + 1}</span>
                  )}
                </span>

                <span
                  className={cx(
                    'flex-1 text-xs transition-colors duration-200',
                    current ? 'font-display uppercase' : 'font-medium text-ink-700',
                  )}
                >
                  {step.title}
                </span>

                <span className="font-mono text-2xs font-bold uppercase tracking-wider text-ink-500">
                  {step.duration}
                </span>
              </li>
            )
          })}
        </ol>

        {/* Progress */}
        <div className="mt-5 h-3 border-3 border-ink bg-paper-200">
          <div
            className="h-full bg-electric transition-[width] duration-700 ease-snap"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t-3 border-ink pt-4">
          <Stat icon={Clock3} label="ETA" value="42 min" />
          <Stat icon={ShieldCheck} label="Warranty" value="90 days" />
          <Stat icon={Activity} label="Quoted" value={money(32900)} />
        </div>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 font-mono text-2xs font-bold uppercase tracking-wider text-ink-500">
        <Icon className="h-3 w-3" strokeWidth={3} />
        {label}
      </p>
      <p className="mt-1.5 truncate font-display text-xs uppercase">{value}</p>
    </div>
  )
}
