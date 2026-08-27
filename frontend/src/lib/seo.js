/**
 * SEO primitives.
 *
 * The one rule this module exists to enforce: **every route declares its own
 * canonical URL.** `index.html` ships a single `<link rel="canonical">`
 * pointing at the home page, and in a single-page app that document is served
 * for every path — so without per-route canonicals a crawler reading
 * `/repairs` is told, in the page's own markup, that it is a duplicate of `/`.
 * That does not just fail to help; it actively stops the repair, shop and
 * student pages from being indexed as pages in their own right.
 *
 * The same applies to Open Graph. WhatsApp is this shop's counter, so a shared
 * product link showing the home page's title and image is a real cost, not a
 * cosmetic one — and the crawlers behind those previews mostly do not run
 * JavaScript, which is why `scripts/prerender.mjs` bakes these tags into static
 * HTML at build time rather than relying on the client to set them.
 */
import { site } from '../data/site'

/**
 * Absolute origin, no trailing slash.
 *
 * Canonicals and `og:url` have to be absolute, so this needs to be the real
 * production domain. Override per environment with `VITE_SITE_URL` — a preview
 * deployment that claims to be the production URL would have its pages
 * consolidated into the live ones by Google.
 */
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://mickeymobile.in').replace(/\/$/, '')

/** The social card. 1200×630, absolute — relative OG images are ignored. */
export const OG_IMAGE = `${SITE_URL}/og-cover.jpg`

export const DEFAULT_DESCRIPTION =
  'Same-day screen and battery repair with a 90-day warranty, new and certified refurbished phones, and premium accessories at Mickey Mobile, TDA Market, Tinsukia.'

/** `/shop?category=cases` → `https://mickeymobile.in/shop`. */
export function canonicalFor(pathname) {
  // Query strings are dropped on purpose: `?category=cases` and `?sort=price-asc`
  // are the same shelf re-ordered, not separate pages. Letting each filter
  // combination declare itself canonical would split one page's ranking signals
  // across dozens of near-duplicate URLs.
  const path = (pathname || '/').split('?')[0].split('#')[0]
  // A trailing slash and its absence are different URLs to a crawler. Normalise
  // to no-trailing-slash, except for the root.
  const clean = path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path
  return `${SITE_URL}${clean === '/' ? '/' : clean}`
}

export const absoluteUrl = (path = '/') =>
  path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`

/* ------------------------------------------------------------ structured data */

const postalAddress = {
  '@type': 'PostalAddress',
  streetAddress: `${site.address.line1}, ${site.address.line2}`,
  addressLocality: site.address.city,
  addressRegion: site.address.region,
  postalCode: site.address.postal,
  addressCountry: 'IN',
}

/** The node every other schema on the site points at, so they describe one business. */
export const STORE_ID = `${SITE_URL}/#store`

/**
 * Breadcrumbs.
 *
 * Worth having on every page but the home page: Google renders them in place
 * of the raw URL in results, which is both more readable and more clickable.
 */
export function breadcrumbSchema(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

/**
 * A catalogue item.
 *
 * `offers` is what earns the price and in-stock line in search results. The
 * availability values are schema.org's, mapped from the shop's own `stock`.
 */
const AVAILABILITY = {
  in: 'https://schema.org/InStock',
  low: 'https://schema.org/LimitedAvailability',
  out: 'https://schema.org/OutOfStock',
}

export function productSchema(product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.brand} ${product.name}`,
    description: product.blurb,
    sku: product.id,
    brand: { '@type': 'Brand', name: product.brand },
    category: product.category,
    ...(product.warranty ? { warranty: product.warranty } : {}),
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/shop/${product.id}`),
      priceCurrency: 'INR',
      price: product.price,
      availability: AVAILABILITY[product.stock] ?? AVAILABILITY.in,
      itemCondition:
        product.category === 'refurb'
          ? 'https://schema.org/RefurbishedCondition'
          : 'https://schema.org/NewCondition',
      seller: { '@type': 'MobilePhoneStore', name: site.name, '@id': STORE_ID },
    },
  }
}

/**
 * A repair as an offered service, with the price range the estimator quotes.
 *
 * No `aggregateRating` anywhere in this file: Google does not allow a business
 * to mark up its own review scores, and doing it is a manual-action risk rather
 * than a ranking win. Ratings in results come from the Google Business Profile.
 */
export function repairServiceSchema(issues) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Mobile phone repair',
    provider: { '@type': 'MobilePhoneStore', name: site.name, '@id': STORE_ID, address: postalAddress },
    areaServed: { '@type': 'City', name: site.address.city },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Repair services',
      itemListElement: issues.map((issue) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: issue.name,
          description: issue.blurb,
        },
        ...(issue.startingPrice
          ? { priceSpecification: { '@type': 'PriceSpecification', priceCurrency: 'INR', minPrice: issue.startingPrice } }
          : {}),
      })),
    },
  }
}

/**
 * FAQ markup.
 *
 * Answers must be the ones actually visible on the page — marking up content a
 * visitor cannot see is a guidelines violation, so every call site passes copy
 * that is rendered somewhere on that route.
 */
export function faqSchema(entries) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }
}

/** An ItemList tells Google the shelf is a list of products, not prose. */
export function itemListSchema(products, listName) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/shop/${product.id}`),
      name: `${product.brand} ${product.name}`,
    })),
  }
}
