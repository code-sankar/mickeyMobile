import { useMemo } from 'react'
import { ReviewGrid } from '../features/reviews/components/ReviewWall'
import { RatingSummary } from '../features/reviews/components/RatingSummary'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { site } from '../data/site'
import { writeReviewUrl } from '../lib/googlePlaces'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useStructuredData } from '../hooks/useStructuredData'
import { breadcrumbSchema } from '../lib/seo'
import { useGoogleReviews } from '../hooks/useGoogleReviews'

export function ReviewsPage() {
  const { rating, total, source } = useGoogleReviews()

  useDocumentTitle(
    'Customer reviews',
    source === 'google'
      ? `${total} reviews at ${rating} stars — read what customers say about repairs, pricing and turnaround at ${site.name}.`
      : `Read what customers say about repairs, pricing and turnaround at ${site.name}.`,
  )

  const schema = useMemo(() => breadcrumbSchema([{ name: 'Reviews', path: '/reviews' }]), [])

  useStructuredData(schema)

  return (
    <>
      <PageHeader
        eyebrow="Social proof"
        title={
          source === 'google' ? (
            <>
              {total} reviews. {rating} stars.
              <br />
              One counter.
            </>
          ) : (
            <>
              Honest reviews.
              <br />
              One counter.
            </>
          )
        }
        description="We ask every customer for an honest review — including the ones who waited longer than we promised. Nothing here is edited or filtered."
        crumbs={[{ label: 'Reviews' }]}
        tone="grape"
      />

      <div className="container-x section-y">
        <div className="grid gap-6 lg:grid-cols-[20rem_1fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-28">
            <div className="space-y-5">
              <RatingSummary />
              <div className="border-3 border-ink bg-acid p-5 shadow-brut">
                <h2 className="font-display text-sm uppercase leading-tight">Had work done with us?</h2>
                <p className="mt-2.5 text-xs font-medium leading-relaxed text-ink-800">
                  Honest reviews are how a shop without a marketing budget gets found. Two minutes of your time
                  helps more than you&apos;d think.
                </p>
                <Button
                  href={writeReviewUrl(site.google.mapsUrl)}
                  target="_blank"
                  rel="noreferrer"
                  size="md"
                  className="mt-4 w-full"
                >
                  Leave a Google review
                </Button>
              </div>
            </div>
          </Reveal>

          <ReviewGrid />
        </div>
      </div>
    </>
  )
}
