import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { site } from '../data/site'
import { canonicalFor, OG_IMAGE, DEFAULT_DESCRIPTION } from '../lib/seo'

/**
 * Per-route head tags: title, description, canonical and the social card.
 *
 * A single-page app keeps the document that `index.html` shipped, so without
 * this every route would share the home page's title in the tab, in bookmarks
 * and in the browser history.
 *
 * The canonical is the part that matters for search. `index.html` hardcodes
 * `<link rel="canonical" href="https://mickeymobile.in/">`, and that same file
 * is served for `/repairs`, `/shop` and every other path — so a crawler is
 * told by the page itself that all of them are the home page. Deriving it from
 * the current location instead is what lets those pages be indexed separately.
 *
 * The signature is unchanged, so every existing call site gained canonical and
 * Open Graph handling without being edited.
 */
export function useDocumentTitle(title, description) {
  const { pathname } = useLocation()

  useEffect(() => {
    const fullTitle = title ? `${title} | ${site.name}` : `${site.name} — ${site.tagline}`
    const text = description || DEFAULT_DESCRIPTION
    const canonical = canonicalFor(pathname)

    document.title = fullTitle

    const restore = [
      setMeta('name', 'description', text),
      setMeta('property', 'og:title', fullTitle),
      setMeta('property', 'og:description', text),
      setMeta('property', 'og:url', canonical),
      setMeta('property', 'og:image', OG_IMAGE),
      setMeta('property', 'og:type', pathname.startsWith('/shop/') ? 'product' : 'website'),
      setMeta('name', 'twitter:title', fullTitle),
      setMeta('name', 'twitter:description', text),
      setMeta('name', 'twitter:image', OG_IMAGE),
      setLink('canonical', canonical),
    ]

    // Restore on unmount so a route that sets nothing cannot inherit the
    // previous route's description — stale metadata is worse than the default.
    return () => restore.forEach((undo) => undo())
  }, [title, description, pathname])
}

/**
 * Sets one meta tag, creating it if `index.html` did not ship it, and returns
 * the undo. Attribute varies: Open Graph uses `property`, the rest use `name`.
 */
function setMeta(attribute, key, value) {
  if (typeof document === 'undefined') return () => {}

  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`)
  const created = !tag

  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, key)
    document.head.appendChild(tag)
  }

  const previous = tag.getAttribute('content')
  tag.setAttribute('content', value)

  return () => {
    if (created) tag.remove()
    else if (previous !== null) tag.setAttribute('content', previous)
  }
}

function setLink(rel, href) {
  if (typeof document === 'undefined') return () => {}

  let tag = document.head.querySelector(`link[rel="${rel}"]`)
  const created = !tag

  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', rel)
    document.head.appendChild(tag)
  }

  const previous = tag.getAttribute('href')
  tag.setAttribute('href', href)

  return () => {
    if (created) tag.remove()
    else if (previous !== null) tag.setAttribute('href', previous)
  }
}
