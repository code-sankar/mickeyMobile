import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { cx } from '../../lib/utils'

/**
 * Infinite ticker. The list is rendered twice and translated by exactly -50%,
 * so the seam never shows; the duplicate half is hidden from assistive tech.
 *
 * `gap` is a pixel value applied inline rather than a Tailwind class, because
 * the track also needs a trailing gap of the same size — without it the two
 * halves are half a gap short of 50% and the loop visibly stutters. Building
 * that class name at runtime would not survive Tailwind's static extraction.
 *
 * Under reduced motion the track stops and simply scrolls by hand.
 */
export function Marquee({
  items,
  renderItem,
  duration = '34s',
  reverse = false,
  pauseOnHover = false,
  gap = 32,
  className,
  itemClassName,
}) {
  const reduced = usePrefersReducedMotion()

  return (
    <div
      className={cx('group flex overflow-hidden', reduced && 'no-scrollbar overflow-x-auto', className)}
      style={{ '--marquee-duration': duration }}
    >
      <ul
        className={cx(
          'flex w-max shrink-0 items-stretch',
          !reduced && 'animate-marquee',
          !reduced && reverse && '[animation-direction:reverse]',
          !reduced && pauseOnHover && 'group-hover:[animation-play-state:paused]',
        )}
        style={{ gap: `${gap}px`, paddingRight: `${gap}px` }}
      >
        {[...items, ...items].map((item, i) => (
          <li
            key={`${item.id ?? item}-${i}`}
            className={itemClassName}
            aria-hidden={i >= items.length || undefined}
          >
            {renderItem(item, i)}
          </li>
        ))}
      </ul>
    </div>
  )
}
