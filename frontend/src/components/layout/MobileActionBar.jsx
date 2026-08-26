import { useEffect, useState } from 'react'
import { CalendarClock, MessageCircle, PhoneCall } from 'lucide-react'
import { site } from '../../data/site'
import { waLink, waMessage } from '../../lib/whatsapp'
import { useBooking } from '../../app/providers/bookingContext'
import { cx } from '../../lib/utils'

/**
 * Thumb-reach conversion bar for phones. Slides in once the visitor has moved
 * past the first screen, so it never covers the opening pitch.
 */
export function MobileActionBar() {
  const [shown, setShown] = useState(false)
  const { openBooking } = useBooking()

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={cx(
        'fixed inset-x-0 bottom-0 z-40 border-t-3 border-ink bg-paper-100 p-2.5 transition-transform duration-200 ease-snap lg:hidden',
        shown ? 'translate-y-0' : 'translate-y-full',
      )}
    >
      <div className="flex items-center gap-2.5">
        <a
          href={site.phoneHref}
          className="grid h-12 w-12 shrink-0 place-items-center border-3 border-ink bg-paper-50 shadow-brut-xs"
          aria-label={`Call ${site.name}`}
        >
          <PhoneCall className="h-4 w-4" strokeWidth={2.5} />
        </a>
        <a
          href={waLink(waMessage.general())}
          target="_blank"
          rel="noreferrer"
          className="grid h-12 w-12 shrink-0 place-items-center border-3 border-ink bg-lime shadow-brut-xs"
          aria-label="Message us on WhatsApp"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
        </a>
        <button
          type="button"
          onClick={() => openBooking()}
          className="flex h-12 flex-1 items-center justify-center gap-2 border-3 border-ink bg-electric font-sans text-xs font-bold uppercase text-paper-50 shadow-brut-xs"
        >
          <CalendarClock className="h-4 w-4" strokeWidth={2.5} />
          Book a repair
        </button>
      </div>
    </div>
  )
}
