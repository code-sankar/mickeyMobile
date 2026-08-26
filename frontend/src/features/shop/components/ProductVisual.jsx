import { cx } from '../../../lib/utils'

/**
 * Products ship without photography, so each card gets a drawn silhouette on a
 * flat colour panel instead. Every tone is a full literal class string —
 * Tailwind only extracts what it can see.
 */
export const tones = {
  blue: { panel: 'bg-electric', pattern: 'text-paper-50/25', ink: '#141210', fill: '#FBF6E9', chip: 'bg-electric text-paper-50' },
  emerald: { panel: 'bg-lime', pattern: 'text-ink/15', ink: '#141210', fill: '#FFFDF6', chip: 'bg-lime text-ink' },
  violet: { panel: 'bg-grape', pattern: 'text-paper-50/25', ink: '#141210', fill: '#FBF6E9', chip: 'bg-grape text-paper-50' },
  amber: { panel: 'bg-acid', pattern: 'text-ink/15', ink: '#141210', fill: '#FFFDF6', chip: 'bg-acid text-ink' },
  slate: { panel: 'bg-blush', pattern: 'text-ink/15', ink: '#141210', fill: '#FFFDF6', chip: 'bg-blush text-ink' },
}

/** Heavy outlines, flat fills, no gradients — drawn to match the type. */
function Silhouette({ kind, ink, fill }) {
  const stroke = { stroke: ink, strokeWidth: 5, strokeLinecap: 'round', strokeLinejoin: 'round' }

  if (kind === 'phone') {
    return (
      <g>
        <rect x="68" y="24" width="64" height="152" fill={fill} {...stroke} />
        <rect x="80" y="38" width="40" height="104" fill="none" {...stroke} strokeWidth="3.5" />
        <path d="M88 32h24" {...stroke} strokeWidth="6" />
        <circle cx="100" cy="158" r="8" fill="none" {...stroke} strokeWidth="4" />
        <path d="M62 66v20M62 96v20M138 74v28" {...stroke} strokeWidth="5" />
      </g>
    )
  }

  if (kind === 'case') {
    return (
      <g>
        <rect x="64" y="20" width="72" height="160" fill={fill} {...stroke} />
        <rect x="76" y="32" width="48" height="136" fill="none" {...stroke} strokeWidth="3" />
        <rect x="82" y="40" width="42" height="42" fill="none" {...stroke} strokeWidth="4" />
        <circle cx="94" cy="52" r="7" fill="none" {...stroke} strokeWidth="4" />
        <circle cx="112" cy="70" r="7" fill="none" {...stroke} strokeWidth="4" />
        <circle cx="100" cy="126" r="17" fill="none" {...stroke} strokeWidth="4" strokeDasharray="6 8" />
      </g>
    )
  }

  if (kind === 'charger') {
    return (
      <g>
        <rect x="60" y="52" width="80" height="80" fill={fill} {...stroke} />
        <rect x="86" y="28" width="9" height="24" fill={fill} {...stroke} strokeWidth="4" />
        <rect x="105" y="28" width="9" height="24" fill={fill} {...stroke} strokeWidth="4" />
        <rect x="84" y="132" width="32" height="12" fill={fill} {...stroke} strokeWidth="4" />
        <path d="M106 70 88 96h12l-4 20 18-28h-12z" fill={ink} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
        <path d="M70 158h60" {...stroke} strokeWidth="5" />
      </g>
    )
  }

  // audio — open buds case
  return (
    <g>
      <rect x="54" y="88" width="92" height="66" fill={fill} {...stroke} />
      <path d="M54 110h92" {...stroke} strokeWidth="4" />
      <rect x="88" y="138" width="24" height="7" fill={ink} stroke="none" />
      <g>
        <ellipse cx="78" cy="54" rx="17" ry="18" fill={fill} {...stroke} />
        <path d="M78 72v20" {...stroke} strokeWidth="9" />
        <circle cx="78" cy="52" r="5" fill={ink} stroke="none" />
      </g>
      <g>
        <ellipse cx="122" cy="54" rx="17" ry="18" fill={fill} {...stroke} />
        <path d="M122 72v20" {...stroke} strokeWidth="9" />
        <circle cx="122" cy="52" r="5" fill={ink} stroke="none" />
      </g>
    </g>
  )
}

export function ProductVisual({ kind = 'phone', tone = 'blue', className, animate = true }) {
  const t = tones[tone] ?? tones.blue

  return (
    <div className={cx('relative grid place-items-center overflow-hidden', t.panel, className)}>
      {/* Halftone field behind the device — the print texture of the whole look */}
      <div className={cx('halftone pointer-events-none absolute inset-0', t.pattern)} aria-hidden="true" />

      <svg
        viewBox="0 0 200 200"
        className={cx(
          'relative h-full w-full p-6 transition-transform duration-200 ease-snap',
          animate && 'group-hover:-rotate-3 group-hover:scale-105',
        )}
        aria-hidden="true"
      >
        <Silhouette kind={kind} ink={t.ink} fill={t.fill} />
      </svg>
    </div>
  )
}
