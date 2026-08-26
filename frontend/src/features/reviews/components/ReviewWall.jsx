import { ReviewCard } from './ReviewCard'
import { SampleNotice } from './SampleNotice'
import { Marquee } from '../../../components/ui/Marquee'
import { Reveal } from '../../../components/ui/Reveal'
import { useGoogleReviews } from '../../../hooks/useGoogleReviews'

/**
 * Two counter-rotating tickers — the home page treatment.
 *
 * Google returns at most five reviews, which is too few to fill two rows, so
 * the wall collapses to a single ticker when it is running on live data.
 */
export function ReviewMarquee() {
  const { reviews, source } = useGoogleReviews()
  const single = reviews.length <= 5

  return (
    <div className="space-y-5">
      {source === 'sample' && (
        <div className="container-x">
          <SampleNotice />
        </div>
      )}

      <Marquee
        items={single ? reviews : reviews.slice(0, 4)}
        duration="56s"
        pauseOnHover
        gap={20}
        itemClassName="w-[21rem] sm:w-[24rem]"
        renderItem={(review) => <ReviewCard review={review} className="h-full" />}
      />

      {!single && (
        <Marquee
          items={reviews.slice(4)}
          duration="68s"
          reverse
          pauseOnHover
          gap={20}
          itemClassName="w-[21rem] sm:w-[24rem]"
          renderItem={(review) => <ReviewCard review={review} className="h-full" />}
        />
      )}
    </div>
  )
}

/** Static grid — the dedicated reviews route. */
export function ReviewGrid() {
  const { reviews } = useGoogleReviews()

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review, i) => (
        <Reveal key={review.id} delay={Math.min(i, 6) * 60} as="li" className="h-full">
          <ReviewCard review={review} className="h-full" />
        </Reveal>
      ))}
    </ul>
  )
}
