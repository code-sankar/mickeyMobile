import { useLoaderData } from 'react-router-dom'
import { ProductDetail } from '../features/shop/components/ProductDetail'
import { PageHeader } from '../components/ui/PageHeader'
import { getCategory } from '../data/selectors'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function ProductPage() {
  const { product } = useLoaderData()
  const category = getCategory(product.category)

  useDocumentTitle(`${product.name} — ${product.subtitle}`, product.blurb)

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
