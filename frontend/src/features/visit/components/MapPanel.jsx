import { ExternalLink, MapPin } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { site } from '../../../data/site'

/**
 * Stylised map stand-in, drawn to match the rest of the site: flat fills,
 * heavy ink strokes, no gradients. Swap the <svg> for a Google Maps / Mapbox
 * embed — the frame, address card and button all stay as they are.
 */
export function MapPanel({ className, title }) {
  return (
    <Card shadow="lg" className={className}>
      {title && (
        <div className="border-b-3 border-ink px-5 py-4">
          <h2 className="font-display text-sm uppercase">{title}</h2>
          <span className="mt-1.5 block h-1 w-10 bg-acid" aria-hidden="true" />
        </div>
      )}

      <div className="relative aspect-[4/3] w-full border-b-3 border-ink sm:aspect-[16/10]">
        <svg
          viewBox="0 0 400 400"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          aria-label={`Map showing ${site.name} in ${site.address.line2}, ${site.address.city}`}
          role="img"
        >
          <rect x="-100" y="-100" width="600" height="600" fill="#F4EDD9" />

          {/* City blocks */}
          <g fill="#EAE0C4" stroke="#141210" strokeWidth="3">
            <rect x="46" y="60" width="104" height="88" />
            <rect x="46" y="168" width="104" height="56" />
            <rect x="46" y="252" width="104" height="94" />
            <rect x="248" y="60" width="112" height="88" />
            <rect x="248" y="168" width="52" height="56" />
            <rect x="314" y="168" width="46" height="56" />
            <rect x="248" y="252" width="112" height="94" />
          </g>

          {/* River */}
          <path
            d="M-40 336C40 324 90 352 150 348s96-32 156-22 96 20 130 12"
            stroke="#2B44FF"
            strokeWidth="22"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M-40 336C40 324 90 352 150 348s96-32 156-22 96 20 130 12"
            stroke="#141210"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* The main road runs east–west straight past the market entrance */}
          <path d="M-40 200h480" stroke="#141210" strokeWidth="26" strokeLinecap="butt" />
          <path d="M-40 200h480" stroke="#FFE01F" strokeWidth="3" strokeDasharray="14 14" />

          {/* The cross street the entrance sits on */}
          <path d="M200 -40v480" stroke="#141210" strokeWidth="20" strokeLinecap="butt" />
          <path d="M200 -40v480" stroke="#FFE01F" strokeWidth="3" strokeDasharray="14 14" />

          <text x="66" y="192" fill="#141210" fontSize="11" fontFamily="monospace" fontWeight="bold" letterSpacing="2">
            TDA MARKET
          </text>
          <text x="212" y="290" fill="#141210" fontSize="10" fontFamily="monospace" fontWeight="bold" letterSpacing="2">
            TINSUKIA
          </text>

          {/* Store pin, dead centre so it survives any crop */}
          <g transform="translate(200 200)">
            <rect x="-22" y="-22" width="44" height="44" fill="#FF4A1C" stroke="#141210" strokeWidth="4" />
            <rect x="-9" y="-9" width="18" height="18" fill="#FFFDF6" stroke="#141210" strokeWidth="3.5" />
          </g>
        </svg>
      </div>

      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center border-3 border-ink bg-flare text-paper-50">
            <MapPin className="h-4 w-4" strokeWidth={3} />
          </span>
          <address className="not-italic">
            <p className="font-display text-sm uppercase">{site.name}</p>
            <p className="mt-1 text-xs font-medium leading-relaxed text-ink-800">
              {site.address.line1}, {site.address.line2}
              <br />
              {site.address.city}, {site.address.region} {site.address.postal}
            </p>
          </address>
        </div>

        <a
          href={site.directionsHref}
          target="_blank"
          rel="noreferrer"
          className="press inline-flex shrink-0 items-center justify-center gap-2 border-3 border-ink bg-acid px-4 py-2.5 font-sans text-2xs font-bold uppercase tracking-tight shadow-brut-xs"
        >
          Get directions
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={3} />
        </a>
      </div>
    </Card>
  )
}
