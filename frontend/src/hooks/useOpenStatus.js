import { useEffect, useState } from 'react'
import { getOpenState } from '../lib/hours'

/** Recomputes the open/closed badge every minute so it never goes stale. */
export function useOpenStatus() {
  const [state, setState] = useState(() => getOpenState())

  useEffect(() => {
    const id = setInterval(() => setState(getOpenState()), 60_000)
    return () => clearInterval(id)
  }, [])

  return state
}
