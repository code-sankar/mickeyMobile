import { Check } from 'lucide-react'
import { cx } from '../../lib/utils'

const control =
  'w-full border-3 border-ink bg-paper-50 px-3.5 py-3 font-sans text-sm font-medium text-ink ' +
  'placeholder:font-normal placeholder:text-ink-400 focus:outline-none focus:ring-0 ' +
  'focus:border-electric focus:bg-white transition-colors duration-150'

const invalid = 'border-flare bg-flare/10 focus:border-flare'

export function Field({ label, error, icon: Icon, htmlFor, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 font-mono text-2xs font-bold uppercase tracking-[0.16em]">
          {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />}
          {label}
        </span>
        {error && <FieldError>{error}</FieldError>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-2xs font-medium text-ink-500">{hint}</p>}
    </div>
  )
}

export function FieldError({ children }) {
  return (
    <span role="alert" className="border-3 border-ink bg-flare px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-paper-50">
      {children}
    </span>
  )
}

export function TextInput({ error, className, ...props }) {
  return <input className={cx(control, error && invalid, className)} {...props} />
}

export function TextArea({ error, className, ...props }) {
  return <textarea className={cx(control, 'resize-none', error && invalid, className)} {...props} />
}

/**
 * A real checkbox, styled to match. The native input stays in the DOM and only
 * its appearance is replaced, so it keeps keyboard focus, the space key and
 * screen-reader semantics that a div-with-onClick would throw away.
 */
export function Checkbox({ label, detail, error, className, ...props }) {
  return (
    <label
      className={cx(
        'flex cursor-pointer gap-3 border-3 border-ink p-4 transition-colors duration-150',
        error ? 'border-flare bg-flare/10' : 'bg-paper-50 hover:bg-acid/30',
        className,
      )}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
      {/* The tick lives inside this span, so it is a descendant of the peer's
          sibling rather than a sibling itself — hence the child selector. */}
      <span
        aria-hidden="true"
        className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center border-3 border-ink bg-paper-50 peer-checked:bg-electric peer-checked:[&>svg]:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2"
      >
        <Check className="h-3 w-3 text-paper-50 opacity-0" strokeWidth={5} />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-bold leading-relaxed sm:text-sm">{label}</span>
        {detail && <span className="mt-1.5 block text-2xs font-medium leading-relaxed text-ink-700">{detail}</span>}
      </span>
    </label>
  )
}

/** Native select, matched to the text inputs. */
export function SelectInput({ error, className, children, ...props }) {
  return (
    <select className={cx(control, 'appearance-none pr-10', error && invalid, className)} {...props}>
      {children}
    </select>
  )
}

/** Square selectable chip — the site's checkbox/radio stand-in. */
export function Chip({ selected, className, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx(
        'border-3 border-ink px-3.5 py-2 font-mono text-2xs font-bold uppercase tracking-wider transition-all duration-150 ease-snap',
        selected
          ? 'translate-x-[2px] translate-y-[2px] bg-electric text-paper-50 shadow-none'
          : 'bg-paper-50 text-ink shadow-brut-xs hover:bg-acid',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
