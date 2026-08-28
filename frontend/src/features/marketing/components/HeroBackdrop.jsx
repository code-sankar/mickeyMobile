/**
 * The hero's background art.
 *
 * Built as inline SVG rather than a photograph, because the design system this
 * site is built on rules photographs out: "no gradients — colour is always a
 * flat fill", "no blurred shadows", "accents are used as fills, never as
 * tints". A photo behind the hero needs a tint or a scrim to keep the headline
 * legible, and that scrim is exactly what the system forbids. The decorative
 * primitives already in `styles/index.css` — `.grid-paper`, `.halftone`,
 * `.stripe-band` — are the vocabulary this design uses for backgrounds, so
 * this composes in the same one.
 *
 * The composition is dictated by where the content already is. The hero is a
 * dense two-column layout: an oversized headline and four badge rows on the
 * left, the live repair ticket on the right. That leaves three genuinely empty
 * regions — the band above the ticket, the bottom-left corner under the
 * badges, and the strip along the bottom edge — and this uses those and
 * nothing else. Anything placed in the middle collides with type, which is
 * why there is nothing in the middle.
 *
 *   - Solid accent fills and 6px ink outlines, matching the 3px borders the
 *     rest of the site draws at this scale.
 *   - Shapes are cropped by the section bounds. A half-visible disc reads as a
 *     printed sheet trimmed to size — the poster idiom the page is built on.
 *     A fully visible one reads as clip art.
 *   - Texture is low-alpha ink, which is the one tint the system already makes
 *     an exception for: `.grid-paper` renders its own rules at 8%.
 */

const INK = '#141210'
const ACID = '#FFE01F'
const ELECTRIC = '#2B44FF'

export function HeroBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 select-none overflow-hidden"
    >
      {/*
        Top-right: the one confident block of colour, cropped by the corner and
        sitting in the band above the repair ticket. Hidden below `lg`, where
        the columns stack and this space becomes the headline's.
      */}
      <svg
        className="absolute right-0 top-0 hidden h-[21rem] w-[21rem] lg:block"
        viewBox="0 0 300 300"
        fill="none"
      >
        {/* Centre sits on the corner itself, so the arc bulges into the hero
            and both straight edges are the section's own trim. */}
        <path d="M300 0v196A196 196 0 0 0 104 0Z" fill={ACID} />
        <path d="M300 196A196 196 0 0 0 104 0" stroke={INK} strokeWidth="7" />
      </svg>

      {/*
        The same corner at tablet width, smaller. Once the columns stack there
        is no band above the ticket any more, only the strip above the location
        pill — so this is sized to stay inside it. Left off below `sm`, where
        the pill runs the full width and anything behind it peeks out at the
        edges rather than reading as a corner.
      */}
      <svg
        className="absolute right-0 top-0 hidden h-40 w-40 sm:block lg:hidden"
        viewBox="0 0 300 300"
        fill="none"
      >
        <path d="M300 0v196A196 196 0 0 0 104 0Z" fill={ACID} />
        <path d="M300 196A196 196 0 0 0 104 0" stroke={INK} strokeWidth="7" />
      </svg>

      {/*
        Bottom-left: printer's registration mark, cropped by the corner. Sits
        below the badge row at every breakpoint, so it never runs under type.
      */}
      <svg
        className="absolute -bottom-16 -left-14 h-48 w-48 sm:h-56 sm:w-56"
        viewBox="0 0 240 240"
        fill="none"
      >
        <circle cx="120" cy="120" r="104" stroke={INK} strokeWidth="7" />
        <circle cx="120" cy="120" r="66" stroke={INK} strokeWidth="7" />
        <circle cx="120" cy="120" r="26" fill={ELECTRIC} stroke={INK} strokeWidth="7" />
        {/* Cropped to just past the outer ring — a full-bleed crosshair runs up
            through the buttons and reads as a stray rule, not a mark. */}
        <path d="M120 4v232M4 120h232" stroke={INK} strokeWidth="7" />
      </svg>

      {/*
        Halftone panel, mid-left. Pure texture at the same weight as the grid
        beneath it, so it deepens the paper without competing with the copy
        sitting on top of it.
      */}
      <svg
        className="absolute bottom-28 left-0 h-56 w-64 sm:bottom-32 sm:h-64 sm:w-80"
        viewBox="0 0 240 200"
        fill="none"
      >
        <defs>
          <pattern id="hero-halftone" width="13" height="13" patternUnits="userSpaceOnUse">
            <circle cx="6.5" cy="6.5" r="2" fill={INK} fillOpacity="0.14" />
          </pattern>
        </defs>
        <rect width="240" height="200" fill="url(#hero-halftone)" />
      </svg>

      {/*
        Bottom edge: a hazard band echoing `.stripe-band`, which the site
        already uses as a divider. Kept to a thin strip riding the section's
        own bottom border, so it finishes the block rather than filling it.
      */}
      <svg
        className="absolute inset-x-0 bottom-0 hidden h-9 w-full sm:block"
        preserveAspectRatio="none"
        viewBox="0 0 1200 36"
        fill="none"
      >
        <defs>
          <pattern
            id="hero-stripes"
            width="26"
            height="26"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="13" height="26" fill={INK} fillOpacity="0.14" />
          </pattern>
        </defs>
        <rect y="6" width="1200" height="30" fill="url(#hero-stripes)" />
      </svg>
    </div>
  )
}
