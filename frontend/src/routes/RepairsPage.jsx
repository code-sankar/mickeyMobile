import { Estimator } from '../features/repairs/components/Estimator'
import { ProcessTimeline } from '../features/marketing/components/ProcessTimeline'
import { GuaranteeBand } from '../features/marketing/components/GuaranteeBand'
import { BrandTicker } from '../features/marketing/components/BrandTicker'
import { RatingSummary } from '../features/reviews/components/RatingSummary'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionHeading } from '../components/ui/SectionHeading'
import { Reveal } from '../components/ui/Reveal'
import { listIssues, startingPriceFor } from '../data/selectors'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { money } from '../lib/utils'

export function RepairsPage() {
  useDocumentTitle(
    'Repairs & instant estimate',
    'Pick your brand, model and fault for a real repair price — parts, labour and warranty included. Same-day screen and battery work in Tinsukia.',
  )

  return (
    <>
      <PageHeader
        eyebrow="Repair estimator"
        title={
          <>
            Know the price
            <br />
            before you walk in
          </>
        }
        description="Three taps for a real number — the same rate you'd be quoted at the counter, including parts, labour and warranty. No calls, no bait pricing."
        crumbs={[{ label: 'Repairs' }]}
      />

      <section className="section-y border-b-3 border-ink">
        <div className="container-x">
          <Estimator />
        </div>
      </section>

      {/* ---------- What we fix ---------- */}
      <section className="section-y border-b-3 border-ink bg-paper-200">
        <div className="container-x">
          <SectionHeading
            eyebrow="What we fix"
            title="Six faults, one bench"
            description="Anything not on this list still gets a free diagnosis — board-level work included."
          />

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listIssues().map((issue, i) => {
              const Icon = issue.icon
              const from = startingPriceFor(issue.id)
              return (
                <Reveal key={issue.id} delay={i * 60} as="li" className="h-full">
                  <div className="flex h-full flex-col border-3 border-ink bg-paper-50 p-5 shadow-brut">
                    <span className="grid h-11 w-11 place-items-center border-3 border-ink bg-electric text-paper-50">
                      <Icon className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 font-display text-base uppercase leading-tight">{issue.name}</h3>
                    <p className="mt-2.5 text-xs font-medium leading-relaxed text-ink-800">{issue.blurb}</p>

                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {issue.symptoms.map((symptom) => (
                        <li
                          key={symptom}
                          className="border-3 border-ink bg-paper-200 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
                        >
                          {symptom}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto flex items-end justify-between gap-3 border-t-3 border-ink pt-4">
                      <div>
                        <p className="font-mono text-2xs font-bold uppercase tracking-wider text-ink-500">
                          From
                        </p>
                        <p className="mt-1 font-display text-lg tabular">{money(from)}</p>
                      </div>
                      <p className="text-right font-mono text-2xs font-bold uppercase tracking-wider text-ink-500">
                        {issue.turnaround}
                        <br />
                        {issue.warranty} cover
                      </p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </ul>
        </div>
      </section>

      <BrandTicker label="Brands serviced in-house" />

      {/* ---------- Process ---------- */}
      <section id="process" className="section-y scroll-mt-24">
        <div className="container-x">
          <SectionHeading
            eyebrow="How it works"
            title={
              <>
                Four stages.
                <br />
                No black box.
              </>
            }
            description="You see the fault, you approve the price, you watch the bench. The only surprise should be how quickly it's back in your hand."
            align="center"
          />

          <div className="mt-12">
            <ProcessTimeline />
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
            <GuaranteeBand />
            <Reveal delay={100}>
              <RatingSummary />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
