import { useEffect } from 'react'
import { site } from '../data/site'

/**
 * Per-route <title> and meta description.
 *
 * A single-page app keeps the document that `index.html` shipped, so without
 * this every route would share the home page's title in the tab, in bookmarks
 * and in the browser history.
 */
export function useDocumentTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | ${site.name}` : site.name

    if (!description) return
    const meta = document.querySelector('meta[name="description"]')
    const previous = meta?.getAttribute('content')
    meta?.setAttribute('content', description)

    return () => {
      if (meta && previous) meta.setAttribute('content', previous)
    }
  }, [title, description])
}
