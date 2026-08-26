import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { cx } from '../../lib/utils'

const base =
  'group relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap ' +
  'border-3 border-ink font-sans font-bold uppercase tracking-tight ' +
  'disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none'

/**
 * Every variant is a flat fill on an ink border. The motion is the `press`:
 * hover pushes the button into its own shadow rather than lifting it.
 */
const variants = {
  primary: 'bg-electric text-paper-50 shadow-brut press',
  accent: 'bg-acid text-ink shadow-brut press',
  ink: 'bg-ink text-paper-50 shadow-brut-paper press',
  paper: 'bg-paper-50 text-ink shadow-brut press',
  danger: 'bg-flare text-paper-50 shadow-brut press',
  outline: 'bg-transparent text-ink hover:bg-ink hover:text-paper-50 transition-colors duration-150',
  ghost: 'border-transparent bg-transparent text-ink hover:bg-ink/10 transition-colors duration-150',
}

const sizes = {
  sm: 'h-9 px-3 text-2xs',
  md: 'h-11 px-5 text-xs',
  lg: 'h-14 px-7 text-sm',
  icon: 'h-11 w-11 px-0',
}

/**
 * One button for the whole site. Renders a router <Link> for `to`, a plain
 * <a> for `href`, and a <button> otherwise — so internal navigation never
 * costs a full page load and external links stay real links.
 */
export const Button = forwardRef(function Button(
  { as, variant = 'primary', size = 'md', className, children, href, to, ...props },
  ref,
) {
  const Tag = as ?? (to ? Link : href ? 'a' : 'button')

  return (
    <Tag
      ref={ref}
      {...(to ? { to } : null)}
      {...(href ? { href } : null)}
      className={cx(base, variants[variant], sizes[size], className)}
      {...(Tag === 'button' && !props.type ? { type: 'button' } : null)}
      {...props}
    >
      {children}
    </Tag>
  )
})
