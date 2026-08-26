import { PackageSearch } from 'lucide-react'
import { ProductCard } from './ProductCard'
import { Reveal } from '../../../components/ui/Reveal'
import { Button } from '../../../components/ui/Button'
import { WhatsAppButton } from '../../../components/ui/WhatsAppButton'
import { Card } from '../../../components/ui/Card'
import { waMessage } from '../../../lib/whatsapp'

export function CatalogGrid({ products, query, onReset }) {
  if (products.length === 0) {
    return (
      <Card className="flex flex-col items-center px-6 py-16 text-center">
        <span className="grid h-16 w-16 place-items-center border-3 border-ink bg-flare text-paper-50 shadow-brut-sm">
          <PackageSearch className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <p className="mt-6 font-display text-xl uppercase">Nothing matches “{query}”</p>
        <p className="mt-3 max-w-sm text-sm font-medium text-ink-700">
          We stock far more than we list here. Message us the model and we&apos;ll tell you what&apos;s on
          the shelf today.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button onClick={onReset} variant="paper">
            Clear filters
          </Button>
          <WhatsAppButton message={waMessage.stockRequest(query)} variant="primary">
            Ask on WhatsApp
          </WhatsAppButton>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, i) => (
        <Reveal key={product.id} delay={Math.min(i, 7) * 50} className="h-full">
          <ProductCard product={product} />
        </Reveal>
      ))}
    </div>
  )
}
