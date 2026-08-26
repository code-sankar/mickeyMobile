import { forwardRef } from 'react'
import { cx } from '../../lib/utils'

const shadows = {
  sm: 'shadow-brut-sm',
  md: 'shadow-brut',
  lg: 'shadow-brut-lg',
  xl: 'shadow-brut-xl',
  none: '',
}

const surfaces = {
  paper: 'bg-paper-50 text-ink',
  raised: 'bg-white text-ink',
  sunk: 'bg-paper-200 text-ink',
  ink: 'bg-ink text-paper-100',
  acid: 'bg-acid text-ink',
  electric: 'bg-electric text-paper-50',
  lime: 'bg-lime text-ink',
  flare: 'bg-flare text-paper-50',
  grape: 'bg-grape text-paper-50',
}

/**
 * The base surface for the whole site: a thick-bordered slab with a hard
 * offset shadow and no radius. `interactive` adds the press motion — reserve
 * it for slabs that are actually clickable.
 */
export const Card = forwardRef(function Card(
  { as: Tag = 'div', surface = 'paper', shadow = 'md', interactive = false, className, children, ...props },
  ref,
) {
  // Panels on ink need a light shadow to stay visible against the ground.
  const shadowClass =
    surface === 'ink' && shadow !== 'none' ? 'shadow-brut-paper' : shadows[shadow]

  return (
    <Tag
      ref={ref}
      className={cx(
        'relative border-3 border-ink',
        surfaces[surface],
        shadowClass,
        interactive && 'press',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
})
