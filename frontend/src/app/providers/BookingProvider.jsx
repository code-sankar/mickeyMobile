import { useCallback, useMemo, useState } from 'react'
import { BookingContext } from './bookingContext'
import { BookingModal } from '../../features/repairs/components/BookingModal'

/**
 * Owns the one booking dialog for the whole app and renders it above every
 * route, so the estimator, the header, the footer and the mobile action bar
 * all drive the same instance.
 */
export function BookingProvider({ children }) {
  const [state, setState] = useState({ open: false, quote: null })

  const openBooking = useCallback((quote = null) => setState({ open: true, quote }), [])
  const closeBooking = useCallback(() => setState((s) => ({ ...s, open: false })), [])

  const value = useMemo(
    () => ({ isOpen: state.open, quote: state.quote, openBooking, closeBooking }),
    [state.open, state.quote, openBooking, closeBooking],
  )

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingModal open={state.open} quote={state.quote} onClose={closeBooking} />
    </BookingContext.Provider>
  )
}
