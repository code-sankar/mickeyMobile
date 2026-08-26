import { Link } from 'react-router-dom'
import { ArrowUpRight, Flame, Sparkles } from 'lucide-react'
import { ProductVisual } from './ProductVisual'
import { Badge } from '../../../components/ui/Badge'
import { money, discountPct } from '../../../lib/utils'

const badgeTone = { 'Best Seller': 'flare', 'New Arrival': 'lime' }
const badgeIcon = { 'Best Seller': Flame, 'New Arrival': Sparkles }

/**
 * The whole card is one link to the product route — no hover-only affordance,
 * so it works identically by touch, mouse and keyboard.
 */
export function ProductCard({ product }) {
  const save = discountPct(product.price, product.mrp)
  const BadgeIcon = badgeIcon[product.badge]
  const lowStock = product.stock === 'low'

  return (
    <article className="h-full">
      <Link
        to={`/shop/${product.id}`}
        className="press group flex h-full flex-col border-3 border-ink bg-paper-50 shadow-brut"
      >
        <div className="relative border-b-3 border-ink">
          <ProductVisual kind={product.kind} tone={product.tone} className="aspect-[4/3] w-full" />

          <div className="pointer-events-none absolute inset-x-2 top-2 flex items-start justify-between gap-2">
            {product.badge ? (
              <Badge tone={badgeTone[product.badge] ?? 'electric'} icon={BadgeIcon}>
                {product.badge}
              </Badge>
            ) : (
              <span />
            )}
            <Badge tone={lowStock ? 'flare' : 'lime'} dot>
              {lowStock ? product.stockNote : 'In stock'}
            </Badge>
          </div>

          {save > 0 && (
            <span className="absolute -bottom-4 right-3 z-10 rotate-[-4deg] border-3 border-ink bg-acid px-2.5 py-1 font-display text-xs uppercase shadow-brut-xs">
              Save {save}%
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="label text-ink-500">{product.brand}</p>

          <h3 className="mt-1.5 font-display text-base uppercase leading-tight">{product.name}</h3>
          <p className="mt-1 text-xs font-medium text-ink-700">{product.subtitle}</p>

          <dl className="mt-4 grid grid-cols-3 gap-2 border-y-3 border-ink py-3">
            {product.specs.map((spec) => (
              <div key={spec.label} className="min-w-0">
                <dt className="truncate font-mono text-[10px] font-bold uppercase tracking-wider text-ink-500">
                  {spec.label}
                </dt>
                <dd className="mt-0.5 truncate text-xs font-bold leading-tight">{spec.value}</dd>
              </div>
            ))}
          </dl>

          {/* mt-auto pins the price to the card floor so a whole row lines up */}
          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            <div>
              <p className="font-display text-xl tabular leading-none">{money(product.price)}</p>
              {save > 0 && (
                <p className="mt-1.5 text-xs font-bold tabular text-ink-500 line-through">
                  {money(product.mrp)}
                </p>
              )}
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center border-3 border-ink bg-paper-200 transition-colors duration-150 group-hover:bg-acid">
              <ArrowUpRight className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
