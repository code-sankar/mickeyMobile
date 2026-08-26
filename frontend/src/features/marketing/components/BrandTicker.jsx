import { Marquee } from '../../../components/ui/Marquee'
import { servicedBrands } from '../../../data/site'

/** Black band of brand names — the loudest element on the page, on purpose. */
export function BrandTicker({ label = 'Serviced in-house', duration = '32s' }) {
  return (
    <section aria-label={label} className="border-b-3 border-ink bg-ink py-4 text-paper-100">
      <Marquee
        items={servicedBrands}
        duration={duration}
        gap={32}
        renderItem={(brand) => (
          <span className="flex items-center gap-8 whitespace-nowrap font-display text-lg uppercase sm:text-xl">
            {brand}
            <span className="text-acid" aria-hidden="true">
              ✕
            </span>
          </span>
        )}
      />
    </section>
  )
}
