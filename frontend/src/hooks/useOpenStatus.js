import { useEffect, useState } from 'react'
import { getOpenState } from '../lib/hours'
import { api, isApiConfigured } from '../lib/api'

/**
 * The open/closed badge.
 *
 * Computed locally first, so it renders immediately and keeps working with no
 * API at all. Then, if the API is configured, its answer replaces the local
 * one — the server decides in the shop's own timezone, whereas this browser
 * reads the visitor's clock and would tell someone in London the shop is open
 * at 3am IST.
 *
 * Recomputed every minute either way so it never goes stale mid-visit.
 */
const REFRESH_MS = 60_000

export function useOpenStatus() {
  const [state, setState] = useState(() => getOpenState())

  useEffect(() => {
    const local = () => setState(getOpenState())

    if (!isApiConfigured()) {
      const id = setInterval(local, REFRESH_MS)
      return () => clearInterval(id)
    }

    const controller = new AbortController()

    const sync = async () => {
      const data = await api.openStatus(controller.signal)
      if (controller.signal.aborted) return
      // `null` means the server could not be reached; the local computation is
      // a good enough badge to keep showing.
      if (data) setState(data)
      else local()
    }

    sync()
    const id = setInterval(sync, REFRESH_MS)

    return () => {
      controller.abort()
      clearInterval(id)
    }
  }, [])

  return state
}
