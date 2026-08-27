import { useEffect } from 'react'

/**
 * Injects a JSON-LD block for the current route and removes it on the way out.
 *
 * `index.html` carries the `MobilePhoneStore` node that describes the business
 * itself, which is true on every page and stays there. This is for the schema
 * that is only true of one route — the product on a product page, the repair
 * catalogue on `/repairs`, the breadcrumb trail anywhere below the root.
 *
 * Removing it on unmount is the whole reason this is a hook rather than a
 * one-time append: in a single-page app the document survives navigation, so a
 * left-behind `Product` block would still be claiming a price on `/visit`.
 *
 * `schema` must be memoised by the caller — a fresh object literal on every
 * render would tear the script tag down and rebuild it each time.
 */
export function useStructuredData(schema, id = 'route-schema') {
  useEffect(() => {
    if (!schema) return undefined

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.seoId = id
    script.textContent = JSON.stringify(schema)
    document.head.appendChild(script)

    return () => script.remove()
  }, [schema, id])
}
