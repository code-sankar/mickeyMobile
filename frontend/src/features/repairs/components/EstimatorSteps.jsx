import { ArrowLeft, ArrowRight, ChevronRight, Clock3, Zap } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { STEPS } from '../hooks/useEstimator'
import { listBrands, listIssues } from '../../../data/selectors'
import { waLink, waMessage } from '../../../lib/whatsapp'
import { cx } from '../../../lib/utils'

/** Numbered rail across the top, plus a breadcrumb of what's been chosen. */
export function StepRail({ step, brand, model, issue, onGoTo }) {
  const chips = [
    brand && { label: brand.name, target: 0 },
    model && { label: model.name, target: 1 },
    issue && { label: issue.short, target: 2 },
  ].filter(Boolean)

  return (
    <div className="border-b-3 border-ink bg-paper-200 px-4 py-4 sm:px-6">
      <ol className="flex items-center gap-2 sm:gap-3">
        {STEPS.map((label, i) => {
          const done = i < step
          const current = i === step
          return (
            <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => onGoTo(i)}
                disabled={i > step}
                className={cx(
                  'flex items-center gap-2 transition-opacity',
                  i > step && 'cursor-not-allowed opacity-40',
                )}
              >
                <span
                  className={cx(
                    'grid h-8 w-8 shrink-0 place-items-center border-3 border-ink font-mono text-xs font-bold transition-colors duration-150',
                    done && 'bg-lime text-ink',
                    current && 'bg-electric text-paper-50',
                    !done && !current && 'bg-paper-50 text-ink-500',
                  )}
                >
                  {i + 1}
                </span>
                <span
                  className={cx(
                    'hidden font-mono text-2xs font-bold uppercase tracking-wider sm:block',
                    current ? 'text-ink' : 'text-ink-500',
                  )}
                >
                  {label}
                </span>
              </button>

              {i < STEPS.length - 1 && (
                <span className="h-[3px] flex-1 bg-ink/20">
                  <span
                    className={cx(
                      'block h-full bg-ink transition-all duration-300 ease-snap',
                      done ? 'w-full' : 'w-0',
                    )}
                  />
                </span>
              )}
            </li>
          )
        })}
      </ol>

      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {chips.map((chip, i) => (
            <span key={chip.label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onGoTo(chip.target)}
                className="border-3 border-ink bg-paper-50 px-2.5 py-1 font-mono text-2xs font-bold uppercase tracking-wider shadow-brut-xs transition-colors hover:bg-acid"
              >
                {chip.label}
              </button>
              {i < chips.length - 1 && <ChevronRight className="h-3 w-3" strokeWidth={3} aria-hidden="true" />}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function StepShell({ title, hint, onBack, children }) {
  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg uppercase sm:text-xl">{title}</h3>
          {hint && <p className="mt-1.5 text-xs font-medium text-ink-700 sm:text-sm">{hint}</p>}
        </div>
        {onBack && (
          <Button onClick={onBack} variant="outline" size="sm" className="shrink-0">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={3} />
            Back
          </Button>
        )}
      </div>
      {children}
    </div>
  )
}

export function BrandStep({ onChoose }) {
  return (
    <StepShell title="Which brand is your device?" hint="We service 40+ models in-house.">
      <div className="grid gap-4 sm:grid-cols-3">
        {listBrands().map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onChoose(b.id)}
            className="press group relative flex flex-col overflow-hidden border-3 border-ink bg-paper-50 p-5 text-left shadow-brut"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-7 right-1 font-display text-[6rem] uppercase leading-none text-ink/[0.07] transition-colors duration-150 group-hover:text-ink/[0.14]"
            >
              {b.name[0]}
            </span>
            <span className="relative flex items-start justify-between gap-2">
              <span className="font-display text-xl uppercase">{b.name}</span>
              <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={3} aria-hidden="true" />
            </span>
            <span className="relative mt-2 block text-xs font-medium text-ink-700">{b.blurb}</span>
            <span className="relative mt-4 block font-mono text-2xs font-bold uppercase tracking-wider text-ink-500">
              {b.models.length} models supported
            </span>
          </button>
        ))}
      </div>

      <p className="mt-6 text-xs font-medium text-ink-700 sm:text-sm">
        Running a OnePlus, Nothing, Xiaomi or Vivo?{' '}
        <a
          href={waLink(waMessage.unlistedModel())}
          target="_blank"
          rel="noreferrer"
          className="font-bold underline decoration-3 underline-offset-4 hover:bg-acid hover:no-underline"
        >
          WhatsApp us the model
        </a>{' '}
        and we&apos;ll quote it within the hour.
      </p>
    </StepShell>
  )
}

export function ModelStep({ brand, selectedId, onChoose, onBack }) {
  return (
    <StepShell
      title={`Pick your ${brand.name} model`}
      hint="Prices are model-specific — no averages."
      onBack={onBack}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {brand.models.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChoose(m.id)}
            className={cx(
              'flex items-center justify-between gap-3 border-3 border-ink p-4 text-left transition-all duration-150 ease-snap',
              selectedId === m.id
                ? 'translate-x-[2px] translate-y-[2px] bg-electric text-paper-50 shadow-none'
                : 'bg-paper-50 shadow-brut-xs hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-acid hover:shadow-none',
            )}
          >
            <span className="min-w-0">
              <span className="block truncate font-display text-sm uppercase">{m.name}</span>
              <span className="mt-1 block truncate font-mono text-2xs font-bold uppercase tracking-wider opacity-70">
                {m.year} · {m.display}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={3} aria-hidden="true" />
          </button>
        ))}
      </div>
    </StepShell>
  )
}

export function IssueStep({ model, onChoose, onBack }) {
  return (
    <StepShell
      title="What's wrong with it?"
      hint={`${model.name} · pick the closest match — diagnosis is free either way.`}
      onBack={onBack}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listIssues().map((it) => {
          const Icon = it.icon
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onChoose(it.id)}
              className="press group flex flex-col border-3 border-ink bg-paper-50 p-5 text-left shadow-brut"
            >
              <span className="flex items-start justify-between gap-2">
                <span className="grid h-11 w-11 shrink-0 place-items-center border-3 border-ink bg-electric text-paper-50">
                  <Icon className="h-5 w-5" strokeWidth={2.5} />
                </span>
                {it.sameDay && (
                  <Badge tone="lime" icon={Zap}>
                    Same day
                  </Badge>
                )}
              </span>
              <span className="mt-4 block font-display text-sm uppercase leading-tight">{it.name}</span>
              <span className="mt-2 block text-xs font-medium leading-relaxed text-ink-700">{it.blurb}</span>
              <span className="mt-4 flex items-center gap-1.5 font-mono text-2xs font-bold uppercase tracking-wider text-ink-500">
                <Clock3 className="h-3 w-3" strokeWidth={3} />
                {it.turnaround}
              </span>
            </button>
          )
        })}
      </div>
    </StepShell>
  )
}
