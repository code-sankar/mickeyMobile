/**
 * Generates `robots.txt` and `sitemap.xml` into `dist/` after a build.
 *
 * Generated rather than committed so the sitemap can never drift from the
 * route table or the catalogue — adding a product to `src/data/products.js`
 * puts it in the sitemap on the next build, with no second place to remember.
 *
 * The site URL comes from `VITE_SITE_URL` so a preview deployment does not
 * publish a sitemap full of production URLs.
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const DIST = join(here, '..', 'dist')

const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://mickeymobile.in').replace(/\/$/, '')

/**
 * Static routes, with the relative weight the shop would give them.
 *
 * `priority` and `changefreq` are hints Google largely ignores now, but Bing
 * and smaller crawlers still read them and they cost nothing. `lastmod` is the
 * one that still matters, and it is the build date because that is the last
 * time the content could actually have changed.
 */
const ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/repairs', priority: '0.9', changefreq: 'weekly' },
  { path: '/shop', priority: '0.9', changefreq: 'daily' },
  { path: '/accessories', priority: '0.8', changefreq: 'weekly' },
  { path: '/students', priority: '0.7', changefreq: 'monthly' },
  { path: '/reviews', priority: '0.6', changefreq: 'weekly' },
  { path: '/visit', priority: '0.7', changefreq: 'monthly' },
]

const escapeXml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export async function generateSeoFiles({ products = [], quiet = false } = {}) {
  const lastmod = new Date().toISOString().slice(0, 10)

  const entries = [
    ...ROUTES,
    // Product pages are real, indexable pages with their own copy and price —
    // exactly what a "buy <phone> in Tinsukia" query should land on.
    ...products.map((product) => ({
      path: `/shop/${product.id}`,
      priority: '0.6',
      changefreq: 'weekly',
    })),
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    ({ path, priority, changefreq }) => `  <url>
    <loc>${escapeXml(SITE_URL + path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

  /**
   * Everything is crawlable. The one disallow is the estimator's query-string
   * shelves: `/shop?category=…&sort=…` is one page re-ordered, not dozens of
   * pages, and letting a crawler spend its budget on every combination is how
   * a small site gets its real pages crawled less often.
   */
  const robots = `# ${SITE_URL}
User-agent: *
Allow: /
Disallow: /*?*sort=
Disallow: /*?*q=

Sitemap: ${SITE_URL}/sitemap.xml
`

  await mkdir(DIST, { recursive: true })
  await Promise.all([
    writeFile(join(DIST, 'sitemap.xml'), sitemap),
    writeFile(join(DIST, 'robots.txt'), robots),
  ])

  if (!quiet) {
    console.log(`[seo] sitemap.xml — ${entries.length} URLs (${products.length} products)`)
    console.log(`[seo] robots.txt — pointing at ${SITE_URL}/sitemap.xml`)
  }

  return { urls: entries.length }
}

// Run directly: `node scripts/generate-seo-files.mjs`
if (import.meta.url === `file://${process.argv[1]}`) {
  const { products } = await import('../src/data/products.js')
  await generateSeoFiles({ products })
}
