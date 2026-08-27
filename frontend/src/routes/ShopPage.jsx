import { useMemo } from 'react'
import { CatalogToolbar } from '../features/shop/components/CatalogToolbar'
import { CatalogGrid } from '../features/shop/components/CatalogGrid'
import { useCatalogFilters } from '../features/shop/hooks/useCatalogFilters'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { waLink, waMessage } from '../lib/whatsapp'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useStructuredData } from '../hooks/useStructuredData'
import { breadcrumbSchema, itemListSchema } from '../lib/seo'

export function ShopPage() {
  const { category, query, sort, results, update, reset, isFiltered } = useCatalogFilters()

  useDocumentTitle(
    'Shop phones & accessories',
    'New and certified refurbished handsets, cases, chargers and audio — bench-tested before they reach the shelf at Mickey Mobile, Tinsukia.',
  )

  /**
   * The catalogue as a list, so a crawler reads the shelf as products rather
   * than prose. Built from the filtered results, which is what is on screen.
   */
  const schema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        itemListSchema(results, 'Phones and accessories at Mickey Mobile'),
        breadcrumbSchema([{ name: 'Shop', path: '/shop' }]),
      ],
    }),
    [results],
  )

  useStructuredData(schema)

  return (
    <>
      <PageHeader
        eyebrow="The shop"
        title={
          <>
            Devices and gear worth
            <br />
            the counter space
          </>
        }
        description="Every handset is bench-tested before it goes on the shelf, and every accessory is one we use ourselves. Nothing here is drop-shipped."
        crumbs={[{ label: 'Shop' }]}
        tone="electric"
      >
        {isFiltered && (
          <Button onClick={reset} variant="paper" size="sm">
            Clear all filters
          </Button>
        )}
      </PageHeader>

      <div className="container-x section-y">
        <CatalogToolbar
          category={category}
          query={query}
          sort={sort}
          onChange={update}
          resultCount={results.length}
        />

        <div className="mt-8">
          <CatalogGrid products={results} query={query} onReset={reset} />
        </div>

        <p className="mt-10 text-center text-sm font-medium text-ink-700">
          Prices include GST. Exchange your old handset against any purchase —{' '}
          <a
            href={waLink(waMessage.valuation())}
            target="_blank"
            rel="noreferrer"
            className="font-bold underline decoration-3 underline-offset-4 hover:bg-acid hover:no-underline"
          >
            get a valuation in 5 minutes
          </a>
          .
        </p>
      </div>
    </>
  )
}
