import { useCallback, useMemo, useState } from 'react'
import { buildQuote, getBrand, getIssue, getModel } from '../../../data/selectors'

export const STEPS = ['Brand', 'Model', 'Issue', 'Estimate']

const EMPTY = { brandId: null, modelId: null, issueId: null, gradeId: 'oem' }

/**
 * The estimator's state machine, kept out of the view.
 *
 * Choosing at any level clears everything downstream, so the selection can
 * never describe a model that belongs to another brand or a price for an
 * issue that was since changed.
 */
export function useEstimator() {
  const [step, setStep] = useState(0)
  const [selection, setSelection] = useState(EMPTY)

  const brand = getBrand(selection.brandId)
  const model = getModel(selection.brandId, selection.modelId)
  const issue = getIssue(selection.issueId)

  const quote = useMemo(() => buildQuote(selection), [selection])

  const chooseBrand = useCallback((brandId) => {
    setSelection((s) => ({ ...s, brandId, modelId: null, issueId: null }))
    setStep(1)
  }, [])

  const chooseModel = useCallback((modelId) => {
    setSelection((s) => ({ ...s, modelId, issueId: null }))
    setStep(2)
  }, [])

  const chooseIssue = useCallback((issueId) => {
    setSelection((s) => ({ ...s, issueId }))
    setStep(3)
  }, [])

  const chooseGrade = useCallback((gradeId) => setSelection((s) => ({ ...s, gradeId })), [])

  const reset = useCallback(() => {
    setSelection(EMPTY)
    setStep(0)
  }, [])

  /** Jump back to a completed step — never forward past a missing choice. */
  const goTo = useCallback(
    (target) => {
      const reachable = [true, Boolean(brand), Boolean(model), Boolean(issue)]
      if (reachable[target]) setStep(target)
    },
    [brand, model, issue],
  )

  return {
    step,
    selection,
    brand,
    model,
    issue,
    quote,
    chooseBrand,
    chooseModel,
    chooseIssue,
    chooseGrade,
    goTo,
    reset,
  }
}
