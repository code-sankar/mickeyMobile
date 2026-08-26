import { Check, Package, PhoneCall, ShieldCheck, Wrench } from 'lucide-react'
import { ProductVisual } from './ProductVisual'
import { ProductCard } from './ProductCard'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { WhatsAppButton } from '../../../components/ui/WhatsAppButton'
import { Reveal } from '../../../components/ui/Reveal'
import { isAccessory, relatedProducts } from '../../../data/selectors'
import { site } from '../../../data/site'
import { waMessage } from '../../../lib/whatsapp'
import { money, discountPct } from '../../../lib/utils'

export function ProductDetail({ product }) {
  const save = discountPct(product.price, product.mrp)
  const lowStock = product.stock === 'low'
  const related = relatedProducts(product)
  // Accessories also get a "will it fit" enquiry alongside the stock enquiry.
  const accessory = isAccessory(product)

  return (
    <>
      <div className="container-x section-y">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          {/* ---------- Visual ---------- */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="group relative border-3 border-ink shadow-brut-lg">
              <ProductVisual
                kind={product.kind}
                tone={product.tone}
                className="aspect-square w-full"
                animate={false}
              />
              <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap gap-2">
                {product.badge && <Badge tone="flare">{product.badge}</Badge>}
                <Badge tone={lowStock ? 'acid' : 'lime'} dot>
                  {product.stockNote}
                </Badge>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <WhatsAppButton message={waMessage.product(product)} variant="primary" size="lg">
                Reserve
              </WhatsAppButton>
              <Button href={site.phoneHref} variant="paper" size="lg">
                <PhoneCall className="h-4 w-4" strokeWidth={2.5} />
                Call store
              </Button>
            </div>

            {accessory && (
              <WhatsAppButton
                message={waMessage.accessoryFit(product)}
                variant="outline"
                size="md"
                className="mt-3 w-full"
              >
                Will this fit my phone?
              </WhatsAppButton>
            )}
          </div>

          {/* ---------- Detail ---------- */}
          <div>
            <span className="eyebrow">{product.brand}</span>

            <h1 className="mt-4 text-balance font-display text-[clamp(2rem,6vw,3.25rem)] uppercase leading-[0.92]">
              {product.name}
            </h1>
            <p className="mt-3 text-base font-bold text-ink-700">{product.subtitle}</p>

            <div className="mt-6 flex flex-wrap items-end gap-4 border-y-3 border-ink py-5">
              <span className="font-display text-4xl tabular leading-none sm:text-5xl">
                {money(product.price)}
              </span>
              {save > 0 && (
                <>
                  <span className="pb-1 font-bold tabular text-ink-500 line-through">
                    {money(product.mrp)}
                  </span>
                  <span className="mb-0.5 rotate-[-3deg] border-3 border-ink bg-acid px-2.5 py-1 font-display text-xs uppercase shadow-brut-xs">
                    Save {save}%
                  </span>
                </>
              )}
            </div>

            <p className="mt-6 text-pretty text-sm font-medium leading-relaxed text-ink-800 sm:text-base">
              {product.blurb}
            </p>

            {/* Specs */}
            <h2 className="mt-10 font-display text-lg uppercase">Specification</h2>
            <dl className="mt-4 border-3 border-ink bg-paper-50 shadow-brut-sm">
              {product.fullSpecs.map((spec, i) => (
                <div
                  key={spec.label}
                  className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4 ${i > 0 ? 'border-t-3 border-ink' : ''}`}
                >
                  <dt className="w-36 shrink-0 font-mono text-2xs font-bold uppercase tracking-wider text-ink-500">
                    {spec.label}
                  </dt>
                  <dd className="text-sm font-bold">{spec.value}</dd>
                </div>
              ))}
            </dl>

            {/* In the box + cover */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="border-3 border-ink bg-paper-50 p-5 shadow-brut-sm">
                <p className="flex items-center gap-2 font-mono text-2xs font-bold uppercase tracking-wider">
                  <Package className="h-3.5 w-3.5" strokeWidth={3} />
                  In the box
                </p>
                <ul className="mt-4 space-y-2.5">
                  {product.inBox.map((item) => (
                    <li key={item} className="flex gap-2 text-xs font-medium">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={4} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-3 border-ink bg-lime p-5 shadow-brut-sm">
                <p className="flex items-center gap-2 font-mono text-2xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="h-3.5 w-3.5" strokeWidth={3} />
                  Cover
                </p>
                <p className="mt-4 font-display text-base uppercase leading-tight">{product.warranty}</p>
                <p className="mt-2.5 text-xs font-medium leading-relaxed text-ink-800">
                  Serviced at our own counter — no courier, no waiting on a brand centre.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-3 border-ink bg-ink p-5 text-paper-100 shadow-brut sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium leading-relaxed">
                Trading in an old handset? We value it at the counter and knock it straight off this price.
              </p>
              <Button to="/repairs" variant="accent" size="md" className="shrink-0">
                <Wrench className="h-4 w-4" strokeWidth={2.5} />
                Get a valuation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Related ---------- */}
      {related.length > 0 && (
        <section className="border-t-3 border-ink bg-paper-200">
          <div className="container-x section-y">
            <h2 className="font-display text-2xl uppercase sm:text-3xl">Also on the shelf</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item, i) => (
                <Reveal key={item.id} delay={i * 60} className="h-full">
                  <ProductCard product={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
