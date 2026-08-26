import { useState } from 'react'
import { Calculator } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { TextInput } from '../../../components/ui/Field'
import { savingsFor } from '../../../lib/studentDiscount'
import { MINIMUM_SPEND } from '../../../data/students'
import { money } from '../../../lib/utils'
import { cx } from '../../../lib/utils'

const PRESETS = [1200, 3500, 6500, 12000]

/**
 * Turns the offer from a percentage into a rupee figure.
 *
 * Runs entirely on the typed amount — nothing here is sent anywhere, so a
 * student can check what a repair would cost them before deciding whether to
 * hand over any details at all.
 */
export function SavingsCalculator() {
  const [amount, setAmount] = useState(3500)
  const result = savingsFor(Number(amount))

  return (
    <Card shadow="lg" className="overflow-hidden">
      <div className="flex items-center gap-2.5 border-b-3 border-ink bg-electric px-5 py-4 text-paper-50">
        <Calculator className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
        <h3 className="font-display text-sm uppercase">What would you save?</h3>
      </div>

      <div className="p-5 sm:p-6">
        <label htmlFor="bill" className="mb-2 block font-mono text-2xs font-bold uppercase tracking-[0.16em]">
          Your repair bill
        </label>
        <div className="flex items-center gap-2">
          <span className="font-display text-2xl">₹</span>
          <TextInput
            id="bill"
            type="number"
            inputMode="numeric"
            min="0"
            step="100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset)}
              className={cx(
                'border-3 border-ink px-3 py-1.5 font-mono text-2xs font-bold uppercase tracking-wider transition-all duration-150 ease-snap',
                Number(amount) === preset
                  ? 'translate-x-[2px] translate-y-[2px] bg-ink text-paper-50 shadow-none'
                  : 'bg-paper-50 shadow-brut-xs hover:bg-acid',
              )}
            >
              {money(preset)}
            </button>
          ))}
        </div>

        {/* aria-live so the result is announced as the amount changes */}
        <div aria-live="polite" className="mt-6">
          {result.eligible ? (
            <div className="border-3 border-ink bg-acid p-5">
              <p className="font-mono text-2xs font-bold uppercase tracking-wider">
                {result.percent}% off · {result.tier.label}
              </p>
              <p className="mt-2 font-display text-4xl leading-none">You save {money(result.saved)}</p>
              <p className="mt-3 border-t-3 border-ink pt-3 text-sm font-bold">
                You pay {money(result.payable)} instead of {money(Number(amount) || 0)}
              </p>
            </div>
          ) : (
            <div className="border-3 border-ink bg-paper-200 p-5">
              <p className="font-display text-sm uppercase">Not eligible yet</p>
              <p className="mt-2 text-xs font-medium leading-relaxed text-ink-800">
                The student discount starts on repair bills over {money(MINIMUM_SPEND)}. Below that the
                counter price already applies — no registration needed.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
