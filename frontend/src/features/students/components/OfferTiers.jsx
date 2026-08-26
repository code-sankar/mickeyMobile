import { Check } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { Reveal } from '../../../components/ui/Reveal'
import { discountTiers, eligibility } from '../../../data/students'
import { money } from '../../../lib/utils'

const fills = ['acid', 'lime']

export function OfferTiers() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* ---------- The two bands ---------- */}
      <div className="grid gap-5 sm:grid-cols-2">
        {discountTiers.map((tier, i) => (
          <Reveal key={tier.id} delay={i * 80} className="h-full">
            <Card surface={fills[i % fills.length]} className="flex h-full flex-col p-6">
              <p className="font-display text-5xl leading-none">{tier.percent}%</p>
              <p className="mt-2 font-mono text-2xs font-bold uppercase tracking-[0.16em]">off</p>

              <p className="mt-5 border-t-3 border-ink pt-4 font-display text-sm uppercase">
                {tier.label}
              </p>
              <p className="mt-2 text-xs font-medium leading-relaxed text-ink-800">{tier.blurb}</p>

              <p className="mt-auto pt-5 font-mono text-2xs font-bold uppercase tracking-wider">
                {tier.max
                  ? `${money(tier.min)} – ${money(tier.max)}`
                  : `${money(tier.min)} and above`}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>

      {/* ---------- Who qualifies ---------- */}
      <Reveal delay={160}>
        <Card surface="ink" className="h-full p-6 sm:p-7">
          <h3 className="font-display text-sm uppercase text-paper-50">Who qualifies</h3>
          <ul className="mt-5 space-y-4">
            {eligibility.map((rule) => (
              <li key={rule.id} className="flex gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center border-3 border-paper-100 bg-lime text-ink">
                  <Check className="h-3 w-3" strokeWidth={4} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-paper-50">{rule.title}</span>
                  <span className="mt-1 block text-xs font-medium leading-relaxed text-paper-300">
                    {rule.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </Reveal>
    </div>
  )
}
