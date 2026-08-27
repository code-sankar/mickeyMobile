/**
 * Turns the built SPA into real static HTML, one file per route.
 *
 * Why this and not client-side meta tags alone:
 *
 *   - Googlebot does run JavaScript, but on a second pass that can lag the
 *     first crawl by days. A brand-new site with no authority does not have
 *     crawl budget to spare on that.
 *   - Nothing else runs JavaScript. The crawlers behind WhatsApp, Facebook,
 *     LinkedIn and Slack link previews read the raw HTML and stop. For a shop
 *     whose counter *is* WhatsApp, a shared product link that previews the home
 *     page's title and image is a real cost, not a technicality.
 *   - `index.html` hardcodes one canonical, one title and one description. Any
 *     crawler that does not execute JS sees eight identical pages that all
 *     declare themselves to be the home page.
 *
 * Output goes to `dist/<route>/index.html`. Vercel checks the filesystem before
 * applying the SPA rewrite, so those files are served directly and the rewrite
 * stays as the fallback for anything not prerendered. The bootstrap script tag
 * survives in the output, so React still mounts and takes over on load.
 */
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { generateSeoFiles } from './generate-seo-files.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const DIST = join(here, '..', 'dist')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
}

/**
 * Serves dist the way Vercel does: filesystem first, then rewrite to
 * index.html. Anything that is not a readable file — a directory, a missing
 * path, a client-side route — falls through to the shell, which is exactly
 * what we are here to snapshot.
 */
function serveDist() {
  return createServer(async (req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname
    const file = join(DIST, pathname)

    try {
      const info = await stat(file)
      if (info.isDirectory()) throw new Error('directory')
      const body = await readFile(file)
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' })
      res.end(body)
    } catch {
      res.writeHead(200, { 'Content-Type': MIME['.html'] })
      res.end(await readFile(join(DIST, 'index.html')))
    }
  })
}

async function main() {
  const { products } = await import('../src/data/products.js')

  const routes = [
    '/',
    '/repairs',
    '/shop',
    '/accessories',
    '/students',
    '/reviews',
    '/visit',
    ...products.map((p) => `/shop/${p.id}`),
  ]

  const server = serveDist()
  const port = await new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve(server.address().port)),
  )
  const origin = `http://127.0.0.1:${port}`

  /**
   * No browser is a degraded build, not a failed one.
   *
   * Prerendering needs a Chromium binary, which a CI image may not have. A
   * deploy that ships the plain SPA — which works, and whose meta tags the
   * client still sets — is strictly better than a deploy that does not happen.
   * The warning is loud because losing this silently would mean quietly
   * shipping the duplicate-canonical problem this script exists to fix.
   */
  let browser
  try {
    browser = await chromium.launch(
      process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
    )
  } catch (error) {
    server.close()
    console.warn(
      `\n[prerender] SKIPPED — could not launch Chromium: ${error.message.split('\n')[0]}\n` +
        '[prerender] The build is still valid, but pages ship without prerendered\n' +
        '[prerender] HTML, so crawlers that do not run JavaScript (WhatsApp,\n' +
        '[prerender] Facebook, Slack link previews) will see the shell only.\n' +
        '[prerender] Fix: run `npx playwright install chromium` before building.\n',
    )
    await generateSeoFiles({ products })
    return
  }

  const context = await browser.newContext()

  /**
   * Block everything off-origin.
   *
   * Two reasons, and the second is the important one:
   *   - Google Fonts would add seconds per page and cannot be inlined anyway.
   *   - If VITE_API_URL is set at build time the app would fetch live reviews
   *     and opening hours here, and those answers would be frozen into static
   *     HTML that then goes stale. Prerendered output must reflect the bundled
   *     data, which is the same thing the client falls back to.
   */
  await context.route('**/*', (route) =>
    route.request().url().startsWith(origin) ? route.continue() : route.abort(),
  )

  const page = await context.newPage()
  const failures = []
  let written = 0

  for (const route of routes) {
    try {
      await page.goto(origin + route, { waitUntil: 'domcontentloaded', timeout: 30_000 })

      // Wait for React to have rendered real content, not the empty shell.
      await page.waitForFunction(
        () => document.querySelector('#root')?.children.length > 0,
        { timeout: 15_000 },
      )
      // …and for the route's own title to have replaced the shell's.
      await page.waitForFunction(() => document.title.length > 0, { timeout: 5_000 })

      const html = await page.evaluate(() => {
        // A crawler should not be told the page is still booting.
        document.documentElement.setAttribute('data-prerendered', 'true')
        return `<!doctype html>\n${document.documentElement.outerHTML}`
      })

      const canonical = await page.evaluate(
        () => document.querySelector('link[rel="canonical"]')?.href ?? null,
      )
      const title = await page.title()

      // `/` is dist/index.html; `/shop` is dist/shop/index.html.
      const outPath =
        route === '/' ? join(DIST, 'index.html') : join(DIST, route, 'index.html')
      await mkdir(dirname(outPath), { recursive: true })
      await writeFile(outPath, html)
      written += 1

      const canonicalPath = canonical ? new URL(canonical).pathname : '(none)'
      const mismatch = canonicalPath !== route ? `  ⚠ canonical=${canonicalPath}` : ''
      console.log(`  ${route.padEnd(34)} ${title.slice(0, 46).padEnd(48)}${mismatch}`)
      if (mismatch) failures.push(`${route}: canonical is ${canonicalPath}`)
    } catch (error) {
      failures.push(`${route}: ${error.message.split('\n')[0]}`)
      console.log(`  ${route.padEnd(34)} FAILED — ${error.message.split('\n')[0]}`)
    }
  }

  await browser.close()
  server.closeAllConnections?.()
  server.close()

  await generateSeoFiles({ products })

  console.log(`\n[prerender] ${written}/${routes.length} routes written to dist/`)

  if (failures.length) {
    console.error(`[prerender] ${failures.length} problem(s):`)
    failures.forEach((f) => console.error(`  - ${f}`))
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('[prerender] failed:', error)
  process.exit(1)
})
