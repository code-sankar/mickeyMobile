import { useLayoutEffect } from 'react'

/**
 * Freezes the page behind a modal without the layout shifting as the scrollbar
 * disappears — the gap is replaced with equivalent padding.
 */
export function useLockBodyScroll(locked) {
  useLayoutEffect(() => {
    if (!locked) return

    const { body } = document
    const previousOverflow = body.style.overflow
    const previousPadding = body.style.paddingRight
    const scrollbar = window.innerWidth - document.documentElement.clientWidth

    body.style.overflow = 'hidden'
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`

    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPadding
    }
  }, [locked])
}
