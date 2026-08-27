/**
 * End-to-end check of the deployed shape of the site.
 *
 * Runs the real production build, served the way Vercel serves it (SPA rewrite
 * to index.html), and drives it in Chromium. The point is to prove the two
 * claims that matter for a deploy:
 *
 *   1. Deep links and refreshes work on every route — the bug that `vercel.json`
 *      fixes and that no unit test would catch.
 *   2. The site never breaks when the API is absent, slow, broken or rejecting.
 *      Each of those is exercised against a stub API rather than described.
 *
 * Usage: node e2e.mjs            (expects `dist/` already built)
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { chromium } from 'playwright'

const DIST = join(import.meta.dirname, 'dist')

let pass = 0
let fail = 0
const ok = (cond, name, extra = '') => {
  if (cond) { pass++; console.log(`  ok   ${name}`) }
  else { fail++; console.log(`  FAIL ${name}${extra ? `\n       ${extra}` : ''}`) }
}
const section = (t) => console.log(`\n${t}`)

/* ------------------------------------------------ static host + SPA rewrite */

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp',
  '.json': 'application/json', '.ico': 'image/x-icon',
}

/**
 * Mirrors how Vercel serves this: filesystem first, then the SPA rewrite.
 *
 * The directory-index step matters once prerendering is on — `/repairs` is a
 * *directory* in dist, and the page lives at `dist/repairs/index.html`.
 * Without resolving that, every prerendered route would fall through to the
 * rewrite and serve the home page, which is both wrong and exactly the bug
 * the SEO assertions are looking for.
 */
async function resolveFile(pathname) {
  const direct = join(DIST, pathname)
  try {
    const info = await stat(direct)
    if (info.isFile()) return direct
    if (info.isDirectory()) {
      const index = join(direct, 'index.html')
      if ((await stat(index)).isFile()) return index
    }
  } catch {
    /* not on disk — fall through to the rewrite */
  }
  return join(DIST, 'index.html')
}

function staticServer() {
  return createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost')
    const file = await resolveFile(url.pathname)
    try {
      const body = await readFile(file)
      res.writeHead(200, {
        'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
        'Content-Length': body.length,
      })
      res.end(body)
    } catch {
      res.writeHead(404).end('not found')
    }
  })
}

/* ---------------------------------------------------------------- stub API */

/** `behaviour` is swapped between tests to simulate each failure mode. */
const apiState = { behaviour: 'ok', hits: [] }

function apiServer() {
  return createServer(async (req, res) => {
    apiState.hits.push(`${req.method} ${req.url}`)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    if (req.method === 'OPTIONS') return res.writeHead(204).end()

    const send = (status, payload) => {
      res.writeHead(status, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(payload))
    }

    if (apiState.behaviour === 'down') {
      req.socket.destroy()
      return undefined
    }
    if (apiState.behaviour === 'error') return send(500, { ok: false, error: { code: 'INTERNAL_ERROR', message: 'boom' } })
    if (apiState.behaviour === 'hang') {
      // Answer long after the client's own timeout has fired. Never answering
      // at all would also stop `networkidle` firing and keep the stub server
      // from shutting down, which tests the harness rather than the site.
      setTimeout(() => send(200, { ok: true, data: {} }), 6000)
      return undefined
    }
    if (apiState.behaviour === 'garbage') {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      return res.end('<html>a proxy error page, not JSON</html>')
    }

    if (req.url.startsWith('/site/status')) {
      return send(200, {
        ok: true,
        data: { open: true, label: 'Open now', detail: 'Closes 8:30 pm', today: null, timeZone: 'Asia/Kolkata' },
      })
    }
    if (req.url.startsWith('/reviews')) {
      return send(200, {
        ok: true,
        data: {
          status: 'ready', source: 'google', rating: 4.7, total: 921, distribution: null,
          profileUrl: 'https://maps.google.com/?cid=2721419290466753029',
          reviews: [{ id: 'g1', name: 'Live Google User', initials: 'LG', rating: 5, date: 'a week ago', body: 'Proxied through the API, not the bundle.', tone: 'blue', verified: true }],
        },
      })
    }
    if (req.url.startsWith('/bookings')) {
      if (apiState.behaviour === 'reject') {
        return send(422, { ok: false, error: { code: 'VALIDATION_FAILED', message: 'Some details need another look', details: { slot: 'That slot just filled up' } } })
      }
      return send(201, { ok: true, data: { ticket: 'MM-2048', status: 'pending' } })
    }
    return send(404, { ok: false, error: { code: 'NOT_FOUND', message: 'no' } })
  })
}

const listen = (server) =>
  new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)))

/* -------------------------------------------------------------------- run */

const API_PORT = 4599
const api = apiServer()
await new Promise((r) => api.listen(API_PORT, '127.0.0.1', r))

/** Phase 2 runs against a build that has VITE_API_URL baked in. */
const WITH_API = process.argv.includes('--api')
const site = staticServer()
const sitePort = await listen(site)
const origin = `http://127.0.0.1:${sitePort}`

const browser = await chromium.launch(
  // Normally Playwright resolves its own browser (`npx playwright install
  // chromium`). CHROMIUM_PATH is an escape hatch for environments that ship a
  // Chromium already and cannot download one.
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
)
const context = await browser.newContext()

/**
 * Uncaught JS errors are always a bug. Failed *network* requests are only a bug
 * when they are ours: this sandbox blocks outbound egress, so the Google Fonts
 * link in index.html resets, and that must not be read as the site breaking.
 */
const pageErrors = []
const failedRequests = []
context.on('weberror', (e) => pageErrors.push(e.error().message))

const page = await context.newPage()
page.on('pageerror', (e) => pageErrors.push(e.message))
page.on('requestfailed', (r) => failedRequests.push(r.url()))
page.on('console', (m) => {
  const text = m.text()
  // "Failed to load resource" duplicates requestfailed, which carries the URL.
  if (m.type() === 'error' && !/Failed to load resource/i.test(text)) pageErrors.push(text)
})

const isExternal = (url) => !url.startsWith(origin) && !url.startsWith(`http://127.0.0.1:${API_PORT}`)

/**
 * Cut off every third-party request.
 *
 * index.html links Google Fonts. In a sandboxed or offline CI runner those
 * requests do not fail fast — they hang until the network gives up, adding ten
 * seconds to every single navigation and making the suite look like the site
 * is slow. Aborting them up front keeps the run honest and quick, and the site
 * is designed to render on its fallback font stack anyway.
 */
await context.route('**/*', (route) => {
  const url = route.request().url()
  if (isExternal(url)) return route.abort()
  return route.continue()
})

const ROUTES = ['/', '/repairs', '/shop', '/accessories', '/students', '/reviews', '/visit', '/shop/iphone-15-128']

section(`deep links and refreshes (the bug vercel.json fixes)`)
for (const route of ROUTES) {
  const response = await page.goto(origin + route, { waitUntil: 'networkidle' })
  const heading = await page.locator('h1').first().textContent().catch(() => null)
  const is404 = (heading ?? '').includes('not on the shelf')
  ok(response.status() === 200 && heading && !is404, `${route} loads directly`, `status=${response.status()} h1=${JSON.stringify(heading)}`)
}

await page.goto(origin + '/repairs', { waitUntil: 'networkidle' })
await page.reload({ waitUntil: 'networkidle' })
ok(!(await page.locator('h1').first().textContent()).includes('not on the shelf'), 'refresh on a nested route survives')

section('unknown route still reaches the 404 page, not a blank screen')
await page.goto(origin + '/definitely-not-a-page', { waitUntil: 'networkidle' })
ok((await page.locator('h1').first().textContent()).includes('not on the shelf'), 'unknown URL renders the 404 page')
await page.goto(origin + '/shop/no-such-product', { waitUntil: 'networkidle' })
ok((await page.locator('h1').first().textContent()).includes('not on the shelf'), 'unknown product renders the 404 page')

section('SEO: what a crawler that does not run JavaScript sees')
{
  // Read the raw bytes off the wire, with no browser involved — this is what
  // a WhatsApp/Facebook/Slack link preview and a first-pass crawl actually get.
  const raw = async (path) => {
    const res = await fetch(origin + path)
    return res.text()
  }
  const attr = (html, re) => html.match(re)?.[1] ?? null

  const canonicals = new Map()
  for (const route of ['/', '/repairs', '/shop', '/students', '/visit', '/shop/iphone-15-128']) {
    const html = await raw(route)
    const canonical = attr(html, /<link rel="canonical" href="([^"]+)"/)
    const title = attr(html, /<title>([^<]*)<\/title>/)
    const desc = attr(html, /<meta name="description" content="([^"]*)"/)
    canonicals.set(route, canonical)

    const path = canonical ? new URL(canonical).pathname : null
    ok(path === route, `${route} declares its own canonical`, `got ${path}`)
    ok(Boolean(title && desc), `${route} has a title and description in raw HTML`)
  }

  // The bug this whole thing exists to fix: every route claiming to be `/`.
  const distinct = new Set([...canonicals.values()])
  ok(distinct.size === canonicals.size,
     'no two routes share a canonical URL',
     `${canonicals.size} routes -> ${distinct.size} distinct canonicals`)

  // Titles must differ too, or results all look like the same page.
  const titles = await Promise.all(
    ['/repairs', '/shop', '/students', '/visit'].map(async (r) => attr(await raw(r), /<title>([^<]*)<\/title>/)),
  )
  ok(new Set(titles).size === titles.length, 'every route has a distinct <title>')

  const productHtml = await raw('/shop/iphone-15-128')
  ok(/"@type"\s*:\s*"Product"/.test(productHtml), 'product page ships Product schema without JS')
  ok(/"availability"/.test(productHtml) && /"price"\s*:\s*66900/.test(productHtml),
     'Product schema carries price and availability')
  ok(/"@type"\s*:\s*"BreadcrumbList"/.test(productHtml), 'product page ships breadcrumbs')
  ok(/iPhone 15/.test(productHtml) && productHtml.length > 20000,
     `product copy is in the raw HTML (${(productHtml.length / 1024).toFixed(0)} kB)`)

  const repairsHtml = await raw('/repairs')
  ok(/"@type"\s*:\s*"FAQPage"/.test(repairsHtml), 'repairs page ships FAQ schema')
  ok(/"@type"\s*:\s*"Service"/.test(repairsHtml), 'repairs page ships Service schema')

  const homeHtml = await raw('/')
  ok(/"@type"\s*:\s*"MobilePhoneStore"/.test(homeHtml), 'LocalBusiness schema on the home page')
  ok(!/"aggregateRating"/.test(homeHtml),
     'no self-serving aggregateRating markup (a Google guidelines violation)')

  // Social previews: the reason a shared product link must not show the home page.
  const ogTitle = attr(productHtml, /<meta property="og:title" content="([^"]*)"/)
  const ogImage = attr(productHtml, /<meta property="og:image" content="([^"]*)"/)
  ok(ogTitle && /iPhone 15/.test(ogTitle), `product og:title is the product (${ogTitle})`)
  ok(Boolean(ogImage && ogImage.startsWith('http')), 'og:image is an absolute URL')

  const ogRes = await fetch(origin + '/og-cover.jpg')
  const ogBytes = (await ogRes.arrayBuffer()).byteLength
  ok(ogRes.status === 200 && ogBytes > 10000,
     `og-cover.jpg exists and is a real image (${(ogBytes / 1024).toFixed(0)} kB)`)

  const sitemap = await raw('/sitemap.xml')
  const urlCount = (sitemap.match(/<loc>/g) ?? []).length
  ok(urlCount >= 28, `sitemap lists every page (${urlCount} URLs)`)
  ok(!/127\.0\.0\.1|localhost/.test(sitemap), 'sitemap uses the production origin, not localhost')

  const robots = await raw('/robots.txt')
  ok(/Sitemap:\s*https?:\/\//.test(robots), 'robots.txt points at the sitemap')
  ok(!/^Disallow:\s*\/\s*$/m.test(robots), 'robots.txt does not block the whole site')
}

section('core content renders from bundled data')
await page.goto(origin + '/shop', { waitUntil: 'networkidle' })
const cards = await page.locator('a[href^="/shop/"]').count()
ok(cards >= 20, `shop lists the catalogue (${cards} product links)`)
if (!WITH_API) {
  // With an API configured the wall is expected to show the API's reviews
  // instead; that case is asserted in phase 2.
  await page.goto(origin + '/reviews', { waitUntil: 'networkidle' })
  ok((await page.getByText(/Ananya Bora|Rohit Deka/).count()) > 0, 'review wall renders the bundled set')
}

section(WITH_API ? 'the booking flow works end to end' : 'the booking flow works end to end with no API at all')
await page.goto(origin + '/repairs', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /Apple/i }).first().click()
await page.getByRole('button', { name: /iPhone 13/i }).first().click()
await page.getByRole('button', { name: /screen/i }).first().click()
const quoteShown = await page.getByText(/₹/).count()
ok(quoteShown > 0, 'estimator prices a repair from bundled data')

await page.getByRole('button', { name: /book/i }).first().click()
await page.waitForSelector('#bk-name', { timeout: 5000 })
await page.fill('#bk-name', 'Ananya Bora')
await page.fill('#bk-phone', '9876543210')
const future = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10)
await page.fill('#bk-date', future)
await page.getByRole('button', { name: '10:00 AM' }).click()
await page.getByRole('button', { name: /Confirm booking/i }).click()
await page.waitForSelector('text=/MM-\\d+/', { timeout: 5000 })
const ticket = await page.locator('text=/MM-\\d+/').first().textContent()
ok(/MM-\d+/.test(ticket), `booking issues a ticket (${ticket.trim()})`)
if (!WITH_API) {
  ok((await page.getByText(/WhatsApp is how this booking gets to us/i).count()) > 0,
     'offline booking tells the truth about how it reaches the shop')
}

ok(pageErrors.length === 0, 'no uncaught JS errors in the no-API run', pageErrors.slice(0, 3).join(' | '))
const ourFailures = failedRequests.filter((u) => !isExternal(u))
ok(ourFailures.length === 0, 'no failed same-origin requests', ourFailures.slice(0, 3).join(' | '))
if (failedRequests.some(isExternal)) {
  console.log(`       (ignored ${failedRequests.filter(isExternal).length} blocked external request(s): Google Fonts — sandbox egress, not a site fault)`)
}

/* ------------------------------------------------- phase 2: API configured */

if (WITH_API) {
  section('with the API reachable, writes go to the server')
  pageErrors.length = 0
  failedRequests.length = 0
  apiState.behaviour = 'ok'
  apiState.hits.length = 0

  await page.goto(origin + '/reviews', { waitUntil: 'networkidle' })
  ok(apiState.hits.some((h) => h.includes('/reviews')), 'reviews are fetched from the API')
  ok((await page.getByText('Live Google User').count()) > 0, 'API reviews replace the bundled set')

  const bookThroughApi = async () => {
    // Not `networkidle`: a deliberately slow API request would never let it
    // settle. The router renders on DOM ready regardless.
    await page.goto(origin + '/repairs', { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /Apple/i }).first().click()
    await page.getByRole('button', { name: /iPhone 13/i }).first().click()
    await page.getByRole('button', { name: /screen/i }).first().click()
    await page.getByRole('button', { name: /book/i }).first().click()
    await page.waitForSelector('#bk-name', { timeout: 5000 })
    await page.fill('#bk-name', 'Ananya Bora')
    await page.fill('#bk-phone', '9876543210')
    await page.fill('#bk-date', new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10))
    await page.getByRole('button', { name: '10:00 AM' }).click()
    await page.getByRole('button', { name: /Confirm booking|Booking/i }).click()
  }

  await bookThroughApi()
  await page.waitForSelector('text=MM-2048', { timeout: 5000 })
  ok(true, 'booking uses the server-issued ticket (MM-2048), not a local one')
  ok((await page.getByText(/Booked on our system/i).count()) > 0,
     'confirmation says the booking is on the system')

  section('a server rejection is shown on the form, not booked around')
  apiState.behaviour = 'reject'
  await bookThroughApi()
  await page.waitForSelector('text=That slot just filled up', { timeout: 5000 })
  ok(true, "a 422 renders the server's message under the right field")
  ok((await page.locator('text=/MM-\\d+/').count()) === 0, 'a rejected booking issues no ticket')

  section('every API failure mode falls back instead of breaking')
  for (const [behaviour, label] of [
    ['down', 'connection refused'],
    ['error', 'a 500 from the server'],
    ['garbage', 'a proxy HTML error page instead of JSON'],
    ['hang', 'a server that never responds (client timeout)'],
  ]) {
    apiState.behaviour = behaviour
    await bookThroughApi()
    await page.waitForSelector('text=/MM-\\d+/', { timeout: 15000 })
    const t = (await page.locator('text=/MM-\\d+/').first().textContent()).trim()
    const fellBack = (await page.getByText(/WhatsApp is how this booking gets to us/i).count()) > 0
    ok(fellBack && t !== 'MM-2048', `${label} -> local ticket + WhatsApp (${t})`)
  }

  // The site still has to render with a dead API, not just the booking form.
  apiState.behaviour = 'down'
  await page.goto(origin + '/reviews', { waitUntil: 'domcontentloaded' })
  // `domcontentloaded` fires before React has mounted, so wait for the wall
  // itself rather than racing the first paint.
  const bundledReview = page.getByText(/Ananya Bora|Rohit Deka/).first()
  await bundledReview.waitFor({ timeout: 10000 }).catch(() => {})
  ok(await bundledReview.isVisible().catch(() => false),
     'reviews fall back to the bundled set when the API is dead')
  await page.goto(origin + '/shop', { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('a[href^="/shop/"]', { timeout: 10000 })
  ok((await page.locator('a[href^="/shop/"]').count()) >= 20,
     'the catalogue is unaffected by a dead API')

  ok(pageErrors.length === 0, 'no uncaught JS errors across every failure mode',
     pageErrors.slice(0, 3).join(' | '))
}

await browser.close()
api.closeAllConnections?.()
site.closeAllConnections?.()
site.close()
api.close()

console.log(`\n${fail === 0 ? 'E2E OK' : 'E2E FAILURES'} — ${pass} passed, ${fail} failed\n`)
process.exit(fail === 0 ? 0 : 1)
