import { useCountUp } from '../../hooks/useCountUp'
import { useReveal } from '../../hooks/useReveal'
import { cx } from '../../lib/utils'

/** Number that eases up from zero the first time it scrolls into view. */
export function Counter({ value, decimals = 0, prefix = '', suffix = '', className, duration = 1200 }) {
  const [ref, visible] = useReveal({ threshold: 0.4 })
  const current = useCountUp(value, { start: visible, duration })

  return (
    <span ref={ref} className={cx('tabular', className)}>
      {prefix}
      {current.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}
