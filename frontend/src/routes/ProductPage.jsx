import { useMemo } from 'react'
import { useLoaderData } from 'react-router-dom'
import { ProductDetail } from '../features/shop/components/ProductDetail'
import { PageHeader } from '../components/ui/PageHeader'
import { getCategory } from '../data/selectors'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useStructuredData } from '../hooks/useStructuredData'
import { breadcrumbSchema, productSchema } from '../lib/seo'

export function ProductPage() {
  const { product } = useLoaderData()
  const category = getCategory(product.category)

  useDocumentTitle(`${product.name} — ${product.subtitle}`, product.blurb)

  /**
   * `Product` markup is what earns the price and in-stock line under a result,
   * which on a shopping query is most of the reason someone clicks. The
   * breadcrumb is emitted from the same trail the header renders, so the two
   * cannot disagree.
   */
  const schema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        productSchema(product),
        breadcrumbSchema([
          { name: 'Shop', path: '/shop' },
          { name: category?.label ?? 'Product', path: `/shop?category=${product.category}` },
          { name: product.name, path: `/shop/${product.id}` },
        ]),
      ],
    }),
    [product, category],
  )

  useStructuredData(schema)

  return (
    <>
      <PageHeader
        title={product.brand}
        titleAs="p"
        crumbs={[
          { label: 'Shop', to: '/shop' },
          { label: category?.label ?? 'Product', to: `/shop?category=${product.category}` },
          { label: product.name },
        ]}
        tone="lime"
      />

      <ProductDetail product={product} />
    </>
  )
}
