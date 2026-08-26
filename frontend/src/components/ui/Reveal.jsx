import { cloneElement } from 'react'
import { useReveal } from '../../hooks/useReveal'
import { cx } from '../../lib/utils'

/** Scroll-triggered fade-up. `delay` staggers grids without an animation library. */
export function Reveal({ children, delay = 0, className, as: Tag = 'div', asChild = false }) {
  const [ref, visible] = useReveal()
  const revealProps = {
    ref,
    style: { '--reveal-delay': `${delay}ms` },
    className: cx('reveal', visible && 'is-visible', className),
  }

  if (asChild) {
    return cloneElement(children, {
      ...revealProps,
      className: cx(revealProps.className, children.props.className),
    })
  }

  return <Tag {...revealProps}>{children}</Tag>
}
