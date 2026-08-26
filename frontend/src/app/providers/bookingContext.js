import { createContext, useContext } from 'react'

export const BookingContext = createContext(null)

/**
 * Opens the booking dialog from anywhere in the tree, optionally carrying a
 * quote from the estimator. Any CTA on any route can start a booking without
 * that route having to own the modal.
 */
export function useBooking() {
  const value = useContext(BookingContext)
  if (!value) throw new Error('useBooking must be used inside <BookingProvider>')
  return value
}
