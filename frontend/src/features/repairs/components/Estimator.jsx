import { useEffect, useRef } from 'react'
import { BrandStep, IssueStep, ModelStep, StepRail } from './EstimatorSteps'
import { QuotePanel } from './QuotePanel'
import { Card } from '../../../components/ui/Card'
import { useEstimator } from '../hooks/useEstimator'
import { useBooking } from '../../../app/providers/bookingContext'

/**
 * Brand → model → issue → live quote.
 *
 * The state machine lives in `useEstimator` and the pricing in
 * `data/selectors` — this component only decides which step to show.
 */
export function Estimator({ id = 'estimator' }) {
  const { step, brand, model, issue, quote, chooseBrand, chooseModel, chooseIssue, chooseGrade, goTo, reset } =
    useEstimator()
  const { openBooking } = useBooking()
  const panelRef = useRef(null)

  // Each step changes the panel's height, which can push its header off-screen.
  // Nudge it back only when it has actually drifted out of a comfortable range.
  useEffect(() => {
    const el = panelRef.current
    if (!el || step === 0) return

    const { top } = el.getBoundingClientRect()
    if (top > 88 && top < window.innerHeight * 0.55) return

    window.scrollTo({ top: window.scrollY + top - 96, behavior: 'smooth' })
  }, [step])

  return (
    <Card ref={panelRef} id={id} shadow="lg" className="scroll-mt-28">
      <StepRail step={step} brand={brand} model={model} issue={issue} onGoTo={goTo} />

      <div key={step} className="animate-pop-in p-5 sm:p-7">
        {step === 0 && <BrandStep onChoose={chooseBrand} />}

        {step === 1 && brand && (
          <ModelStep
            brand={brand}
            selectedId={model?.id}
            onChoose={chooseModel}
            onBack={() => goTo(0)}
          />
        )}

        {step === 2 && model && (
          <IssueStep model={model} onChoose={chooseIssue} onBack={() => goTo(1)} />
        )}

        {step === 3 && quote && (
          <QuotePanel
            quote={quote}
            onGrade={chooseGrade}
            onBack={() => goTo(2)}
            onReset={reset}
            onBook={() => openBooking(quote)}
          />
        )}
      </div>
    </Card>
  )
}
