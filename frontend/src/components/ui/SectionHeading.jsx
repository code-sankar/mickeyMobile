import { cx } from '../../lib/utils'
import { Reveal } from './Reveal'

export function SectionHeading({ eyebrow, title, description, align = 'left', className, children }) {
  const centered = align === 'center'

  return (
    <div className={cx('max-w-3xl', centered && 'mx-auto text-center', className)}>
      {eyebrow && (
        <Reveal>
          <span className="eyebrow">{eyebrow}</span>
        </Reveal>
      )}

      <Reveal delay={60}>
        <h2 className="mt-5 text-balance font-display text-[clamp(1.9rem,6vw,3.25rem)] uppercase leading-[0.92]">
          {title}
        </h2>
      </Reveal>

      {description && (
        <Reveal delay={120}>
          <p className="mt-5 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-ink-700 sm:text-base">
            {description}
          </p>
        </Reveal>
      )}

      {children && <Reveal delay={180}>{children}</Reveal>}
    </div>
  )
}
