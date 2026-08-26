import { ArrowRight, Check, Wrench } from 'lucide-react'
import { AccessoryGroups } from '../features/shop/components/AccessoryGroups'
import { ProductCard } from '../features/shop/components/ProductCard'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionHeading } from '../components/ui/SectionHeading'
import { Button } from '../components/ui/Button'
import { WhatsAppButton } from '../components/ui/WhatsAppButton'
import { Card } from '../components/ui/Card'
import { Reveal } from '../components/ui/Reveal'
import { listAccessories } from '../data/selectors'
import { waMessage } from '../lib/whatsapp'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { money } from '../lib/utils'

/**
 * What the counter does that a marketplace cannot — the reason to buy the case
 * here rather than have it couriered.
 */
const COUNTER_SERVICE = [
  'Screen protectors fitted free, bubble-free, while you wait',
  'Cases tried on your actual phone before you pay',
  'Chargers tested against your device’s fast-charge handshake',
  'Buds paired and fitted for size at the counter',
]

const accessories = listAccessories()
const fromPrice = Math.min(...accessories.map((p) => p.price))

export function AccessoriesPage() {
  useDocumentTitle(
    'Phone accessories',
    'Cases, fast chargers, power banks and wireless audio — fitted and tested at the counter in TDA Market, Tinsukia. Nothing drop-shipped.',
  )

  return (
    <>
      <PageHeader
        eyebrow="Accessories"
        title={
          <>
            The gear worth
            <br />
            putting on it
          </>
        }
        description={`Cases, power and audio for the phone you already own — ${accessories.length} lines on the shelf from ${money(fromPrice)}, every one of them fitted and tested before you leave.`}
        crumbs={[{ label: 'Accessories' }]}
        tone="blush"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button to="/shop" variant="ink" size="lg">
            Browse everything
            <ArrowRight className="h-4 w-4" strokeWidth={3} />
          </Button>
          <WhatsAppButton message={waMessage.stockRequest('')} variant="paper" size="lg">
            Ask for something else
          </WhatsAppButton>
        </div>
      </PageHeader>

      {/* ---------- Category panels ---------- */}
      <section className="section-y border-b-3 border-ink">
        <div className="container-x">
          <AccessoryGroups />
        </div>
      </section>

      {/* ---------- Fitted at the counter ---------- */}
      <section className="section-y border-b-3 border-ink bg-paper-200">
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12">
            <SectionHeading
              eyebrow="Why buy it here"
              title="Fitted at the counter, not couriered"
              description="An accessory that does not fit is worse than no accessory. Everything here is tried against your own handset before money changes hands — and if it does not fit, it goes back on the shelf."
            />

            <Reveal delay={120}>
              <Card surface="ink" className="p-6 sm:p-8">
                <ul className="space-y-4">
                  {COUNTER_SERVICE.map((item) => (
                    <li key={item} className="flex gap-3 text-sm font-medium leading-relaxed">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center border-3 border-paper-100 bg-lime text-ink">
                        <Check className="h-3 w-3" strokeWidth={4} aria-hidden="true" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Full shelf ---------- */}
      <section className="section-y border-b-3 border-ink">
        <div className="container-x">
          <SectionHeading
            eyebrow="The full shelf"
            title="Everything in accessories"
            description="Prices include GST. Anything out of stock we can usually get in within 48 hours — ask."
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {accessories.map((product, i) => (
              <Reveal key={product.id} delay={Math.min(i, 7) * 50} className="h-full">
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Cross-sell to the bench ---------- */}
      <section className="section-y">
        <div className="container-x">
          <Reveal>
            <Card
              surface="electric"
              shadow="lg"
              className="flex flex-col items-start gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center border-3 border-ink bg-acid text-ink">
                  <Wrench className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-lg uppercase leading-tight text-paper-50 sm:text-xl">
                    Cracked screen under that new case?
                  </h2>
                  <p className="mt-2.5 max-w-xl text-xs font-medium leading-relaxed sm:text-sm">
                    Get it fixed first and we will fit the case and protector free once the panel is cured.
                    Free diagnosis either way.
                  </p>
                </div>
              </div>

              <Button to="/repairs" variant="accent" size="lg" className="w-full shrink-0 lg:w-auto">
                Get a repair estimate
                <ArrowRight className="h-4 w-4" strokeWidth={3} />
              </Button>
            </Card>
          </Reveal>
        </div>
      </section>
    </>
  )
}
