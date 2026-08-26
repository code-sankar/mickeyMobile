import { ArrowLeft, Calendar, Check, Clock3, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { WhatsAppButton } from '../../../components/ui/WhatsAppButton'
import { useCountUp } from '../../../hooks/useCountUp'
import { listGrades, priceFor } from '../../../data/selectors'
import { site } from '../../../data/site'
import { waMessage } from '../../../lib/whatsapp'
import { cx, money } from '../../../lib/utils'

/** The final estimator step: the number, what it covers, and how to book it. */
export function QuotePanel({ quote, onGrade, onBack, onReset, onBook }) {
  const animated = useCountUp(quote.price, { duration: 800 })
  const Icon = quote.issue.icon

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
      {/* ---------- Price ---------- */}
      <div>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <span className="eyebrow">Your estimate</span>
            <h3 className="mt-3 font-display text-lg uppercase sm:text-xl">
              {quote.model.name} · {quote.issue.short}
            </h3>
          </div>
          <Button onClick={onBack} variant="outline" size="sm" className="shrink-0">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={3} />
            Back
          </Button>
        </div>

        <div className="border-3 border-ink bg-acid p-6 shadow-brut sm:p-7">
          <div className="flex flex-wrap items-end gap-3">
            <span className="font-display text-5xl tabular leading-none sm:text-6xl">
              {money(Math.round(animated))}
            </span>
            <span className="pb-1.5 font-mono text-2xs font-bold uppercase tracking-wider">
              all inclusive
            </span>
          </div>

          <p className="mt-3 text-xs font-medium text-ink-800 sm:text-sm">
            Typically lands between <span className="font-bold">{money(quote.low)}</span> and{' '}
            <span className="font-bold">{money(quote.price)}</span> after inspection.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Meta icon={Clock3} label="Ready in" value={quote.turnaround} />
            <Meta icon={ShieldCheck} label="Warranty" value={quote.warranty} />
            <Meta icon={Icon} label="Parts" value={quote.gradeLabel} />
          </div>
        </div>

        {/* Grade switch */}
        {quote.issue.gradable && (
          <div className="mt-6">
            <p className="mb-3 flex items-center gap-2 font-mono text-2xs font-bold uppercase tracking-[0.16em]">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={3} />
              Choose your part grade
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {listGrades().map((g) => {
                const selected = g.id === quote.grade.id
                const gradePrice = priceFor(quote.model, quote.issue, g)
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => onGrade(g.id)}
                    aria-pressed={selected}
                    className={cx(
                      'flex flex-col border-3 border-ink p-4 text-left transition-all duration-150 ease-snap',
                      selected
                        ? 'translate-x-[2px] translate-y-[2px] bg-ink text-paper-100 shadow-none'
                        : 'bg-paper-50 shadow-brut-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brut-xs',
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm uppercase">{g.name}</span>
                      <span className="font-display text-sm tabular">{money(gradePrice)}</span>
                    </span>
                    <span
                      className={cx(
                        'mt-2 block text-xs font-medium leading-relaxed',
                        selected ? 'text-paper-300' : 'text-ink-700',
                      )}
                    >
                      {g.note}
                    </span>
                    <span
                      className={cx(
                        'mt-3 block w-fit border-3 border-ink px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
                        selected ? 'bg-lime text-ink' : 'bg-paper-200',
                      )}
                    >
                      {g.warrantyDays}-day warranty
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ---------- What's included + CTAs ---------- */}
      <div className="flex flex-col gap-5 border-3 border-ink bg-paper-200 p-6 shadow-brut">
        <div>
          <span className="eyebrow">What the price covers</span>
          <ul className="mt-4 space-y-3">
            {[...quote.issue.includes, 'Free 42-point diagnostic before any work starts'].map((item) => (
              <li key={item} className="flex gap-2.5 text-xs font-medium sm:text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={4} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto space-y-3 border-t-3 border-ink pt-5">
          <Button onClick={onBook} size="lg" className="w-full">
            <Calendar className="h-4 w-4" strokeWidth={2.5} />
            Book appointment
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <WhatsAppButton message={waMessage.quote(quote)} variant="paper">
              Send quote
            </WhatsAppButton>
            <Button onClick={onReset} variant="outline">
              <RotateCcw className="h-4 w-4" strokeWidth={2.5} />
              Start over
            </Button>
          </div>
          <p className="pt-1 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-ink-500">
            Estimate valid 14 days · confirmed after free inspection
          </p>
        </div>
      </div>
    </div>
  )
}

function Meta({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-3 border-ink bg-paper-50 p-3 sm:block">
      <p className="flex items-center gap-1.5 font-mono text-2xs font-bold uppercase tracking-wider text-ink-500">
        <Icon className="h-3 w-3 shrink-0" strokeWidth={3} />
        {label}
      </p>
      <p className="text-right text-xs font-bold leading-snug sm:mt-1.5 sm:text-left">{value}</p>
    </div>
  )
}
