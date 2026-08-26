import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Hero } from '../features/marketing/components/Hero'
import { StatBand } from '../features/marketing/components/StatBand'
import { BrandTicker } from '../features/marketing/components/BrandTicker'
import { ProcessTimeline } from '../features/marketing/components/ProcessTimeline'
import { GuaranteeBand } from '../features/marketing/components/GuaranteeBand'
import { ReviewMarquee } from '../features/reviews/components/ReviewWall'
import { RatingSummary } from '../features/reviews/components/RatingSummary'
import { ProductCard } from '../features/shop/components/ProductCard'
import { AccessoryGroups } from '../features/shop/components/AccessoryGroups'
import { HoursCard } from '../features/visit/components/HoursCard'
import { MapPanel } from '../features/visit/components/MapPanel'
import { SectionHeading } from '../components/ui/SectionHeading'
import { Button } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { filterProducts } from '../data/selectors'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useGoogleReviews } from '../hooks/useGoogleReviews'

const featured = filterProducts({ category: 'all' }).slice(0, 4)

export function HomePage() {
  const { rating, total, source } = useGoogleReviews()

  useDocumentTitle(
    null,
    'Same-day screen and battery repair with a 90-day warranty, new and certified refurbished phones, and premium accessories at Mickey Mobile, TDA Market, Tinsukia.',
  )

  return (
    <>
      <Hero />
      <StatBand />
      <BrandTicker />

      {/* ---------- How it works ---------- */}
      <section id="process" className="section-y scroll-mt-24 border-b-3 border-ink">
        <div className="container-x">
          <SectionHeading
            eyebrow="How it works"
            title={
              <>
                Four stages.
                <br />
                No black box.
              </>
            }
            description="You see the fault, you approve the price, you watch the bench. The only surprise should be how quickly it's back in your hand."
            align="center"
          />

          <div className="mt-12">
            <ProcessTimeline />
          </div>

          <div className="mt-10">
            <GuaranteeBand />
          </div>
        </div>
      </section>

      {/* ---------- Shelf preview ---------- */}
      <section className="section-y border-b-3 border-ink bg-paper-200">
        <div className="container-x">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="The shop"
              title="Worth the counter space"
              description="Every handset is bench-tested before it goes on the shelf, and every accessory is one we use ourselves. Nothing here is drop-shipped."
              className="max-w-2xl"
            />
            <Reveal delay={140} className="shrink-0">
              <Button to="/shop" variant="ink" size="lg">
                See all 21 items
                <ArrowRight className="h-4 w-4" strokeWidth={3} />
              </Button>
            </Reveal>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product, i) => (
              <Reveal key={product.id} delay={i * 60} className="h-full">
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Accessories ---------- */}
      <section className="section-y border-b-3 border-ink">
        <div className="container-x">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Accessories"
              title="The gear worth putting on it"
              description="Cases, power and audio — fitted and tested against your own handset at the counter, not couriered from a warehouse."
              className="max-w-2xl"
            />
            <Reveal delay={140} className="shrink-0">
              <Button to="/accessories" variant="ink" size="lg">
                All accessories
                <ArrowRight className="h-4 w-4" strokeWidth={3} />
              </Button>
            </Reveal>
          </div>

          <div className="mt-10">
            <AccessoryGroups />
          </div>
        </div>
      </section>

      {/* ---------- Reviews ---------- */}
      <section className="section-y overflow-hidden border-b-3 border-ink">
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <SectionHeading
              eyebrow="Social proof"
              title={
                source === 'google'
                  ? `${total} reviews. ${rating} stars. One counter.`
                  : 'Honest reviews. One counter.'
              }
              description="We ask every customer for an honest review — including the ones who waited longer than we promised. Here's what lands on our Google profile."
            />
            <Reveal delay={120}>
              <RatingSummary className="lg:w-[20rem]" />
            </Reveal>
          </div>
        </div>

        <div className="mt-12">
          <ReviewMarquee />
        </div>

        <div className="container-x mt-10 text-center">
          <Button to="/reviews" variant="paper" size="lg">
            Read all reviews
            <ArrowRight className="h-4 w-4" strokeWidth={3} />
          </Button>
        </div>
      </section>

      {/* ---------- Visit ---------- */}
      <section className="section-y bg-paper-200">
        <div className="container-x">
          <SectionHeading
            eyebrow="Find us"
            title="In TDA Market, open seven days"
            description="Second floor, Shop No 258. Bring the device and a photo ID — that's the whole checklist."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
            <Reveal>
              <MapPanel />
            </Reveal>
            <Reveal delay={120}>
              <div className="flex h-full flex-col gap-5">
                <HoursCard />
                <Link
                  to="/visit"
                  className="press mt-auto flex items-center justify-between gap-3 border-3 border-ink bg-acid px-5 py-4 shadow-brut"
                >
                  <span className="font-display text-sm uppercase">Directions, parking and contact</span>
                  <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={3} aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
