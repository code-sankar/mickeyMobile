import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/**
 * Eases a number from 0 (or the previous value) to `target` with rAF.
 * Used by the hero stats and the estimator price, so a changed quote reads as a
 * movement rather than a jump cut.
 */
export function useCountUp(target, { duration = 1100, start = true, from } = {}) {
  const reduced = usePrefersReducedMotion()
  const [value, setValue] = useState(from ?? 0)
  const frame = useRef(0)
  const previous = useRef(from ?? 0)

  useEffect(() => {
    if (!start) return

    if (reduced) {
      previous.current = target
      setValue(target)
      return
    }

    const origin = previous.current
    const delta = target - origin
    const began = performance.now()

    const tick = (now) => {
      const t = Math.min((now - began) / duration, 1)
      // easeOutExpo — fast out of the gate, settles softly
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setValue(origin + delta * eased)
      if (t < 1) frame.current = requestAnimationFrame(tick)
      else previous.current = target
    }

    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [target, duration, start, reduced])

  return value
}
