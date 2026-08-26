import { cx } from '../../lib/utils'

const tones = {
  acid: 'bg-acid text-ink',
  electric: 'bg-electric text-paper-50',
  lime: 'bg-lime text-ink',
  flare: 'bg-flare text-paper-50',
  grape: 'bg-grape text-paper-50',
  blush: 'bg-blush text-ink',
  ink: 'bg-ink text-paper-50',
  paper: 'bg-paper-50 text-ink',
}

export function Badge({ tone = 'paper', icon: Icon, children, className, dot = false }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 border-3 border-ink px-2 py-0.5 font-mono text-2xs font-bold uppercase leading-tight tracking-wider',
        tones[tone],
        className,
      )}
    >
      {dot && (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping-square bg-current opacity-70" />
          <span className="relative inline-flex h-2 w-2 bg-current" />
        </span>
      )}
      {Icon && <Icon className="h-3 w-3 shrink-0" strokeWidth={3} aria-hidden="true" />}
      {children}
    </span>
  )
}
