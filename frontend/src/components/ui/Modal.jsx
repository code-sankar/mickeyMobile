import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { cx } from '../../lib/utils'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

const widths = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
}

/**
 * Accessible dialog: portalled to <body>, scroll-locked, Escape to close,
 * focus trapped inside and returned to the trigger on close.
 */
export function Modal({ open, onClose, title, description, children, size = 'md', labelledBy }) {
  const panelRef = useRef(null)
  const restoreRef = useRef(null)

  useLockBodyScroll(open)

  const handleKeyDown = useCallback((event) => {
    if (event.key !== 'Tab') return

    const nodes = panelRef.current?.querySelectorAll(FOCUSABLE)
    if (!nodes?.length) return

    const first = nodes[0]
    const last = nodes[nodes.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const onEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    // If focus escapes the panel — which happens the moment a focused control
    // unmounts, e.g. when the form swaps to its confirmation — pull it back.
    const onFocusIn = (event) => {
      const panel = panelRef.current
      if (panel && !panel.contains(event.target)) panel.focus()
    }

    document.addEventListener('keydown', onEscape)
    document.addEventListener('focusin', onFocusIn)
    return () => {
      document.removeEventListener('keydown', onEscape)
      document.removeEventListener('focusin', onFocusIn)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement

    // Focus the panel itself rather than the close button, so screen readers
    // announce the dialog title before any control.
    const id = requestAnimationFrame(() => panelRef.current?.focus())

    return () => {
      cancelAnimationFrame(id)
      if (restoreRef.current instanceof HTMLElement) restoreRef.current.focus()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : title}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="fixed inset-0 animate-fade-in cursor-default bg-ink/70"
        tabIndex={-1}
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className={cx(
          'relative z-10 max-h-[92vh] w-full animate-pop-in overflow-y-auto border-3 border-ink bg-paper-100 outline-none',
          'shadow-brut-xl sm:shadow-brut-lg',
          widths[size],
        )}
      >
        <div className="sticky top-0 z-30 flex items-start justify-between gap-4 border-b-3 border-ink bg-acid px-5 py-4 sm:px-7">
          <div className="min-w-0">
            {title && (
              <h3 id={labelledBy} className="font-display text-lg uppercase leading-none sm:text-xl">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-2 text-xs font-medium leading-relaxed text-ink-800 sm:text-sm">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="press grid h-9 w-9 shrink-0 place-items-center border-3 border-ink bg-paper-50 text-ink shadow-brut-xs"
          >
            <X className="h-4 w-4" strokeWidth={3} />
          </button>
        </div>

        <div className="px-5 py-6 sm:px-7">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
