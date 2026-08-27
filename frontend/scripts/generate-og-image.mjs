/**
 * Renders `public/og-cover.jpg` — the 1200×630 card every share preview uses.
 *
 * `index.html` has always pointed `og:image` at `/og-cover.jpg`, but the file
 * did not exist: every link shared to WhatsApp, Facebook or Slack showed a
 * broken image. For a shop whose counter is WhatsApp that is the most-seen
 * asset on the site, so it is generated here rather than left as a TODO.
 *
 * A script rather than a committed binary so it stays in sync with the brand
 * tokens and the shop's own details — change `src/data/site.js` and re-run.
 *
 *   node scripts/generate-og-image.mjs
 *
 * Fonts: deliberately a system stack. The site's Archivo Black comes from
 * Google Fonts, which a build machine may not be able to reach, and a card
 * that renders in a fallback font is better than a build that fails. Replace
 * this with a photo-led card from the shop's own photography when there is
 * one — this is a good default, not a substitute for a designer.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const here = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(here, '..', 'public')

const TOKENS = {
  paper: '#FBF6E9',
  ink: '#141210',
  acid: '#FFE01F',
  electric: '#2B44FF',
  lime: '#A6F32B',
}

async function main() {
  const { site } = await import('../src/data/site.js')

  // Inlined as a data URI: the render has no network, by design.
  const photo = await readFile(join(PUBLIC, 'mickeydaa.png'))
    .then((b) => `data:image/png;base64,${b.toString('base64')}`)
    .catch(() => null)

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; display: flex;
    background: ${TOKENS.paper}; color: ${TOKENS.ink};
    font-family: "Liberation Sans", "DejaVu Sans", Arial, sans-serif;
    overflow: hidden;
  }
  .left { flex: 1 1 58%; padding: 58px 48px 48px 58px; display: flex; flex-direction: column; }
  .eyebrow {
    align-self: flex-start; background: ${TOKENS.acid}; border: 5px solid ${TOKENS.ink};
    padding: 9px 18px; font-size: 20px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .14em; box-shadow: 8px 8px 0 ${TOKENS.ink};
  }
  h1 {
    margin-top: 40px; font-size: 92px; line-height: .89; font-weight: 700;
    text-transform: uppercase; letter-spacing: -.025em;
  }
  h1 em { font-style: normal; display: block; color: ${TOKENS.electric}; }
  .tag { margin-top: 24px; font-size: 26px; font-weight: 600; line-height: 1.32; max-width: 26ch; }
  .points { margin-top: auto; display: flex; gap: 10px; flex-wrap: wrap; }
  .point {
    border: 4px solid ${TOKENS.ink}; background: #fff; padding: 8px 14px;
    font-size: 17px; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; white-space: nowrap;
  }
  .point.hi { background: ${TOKENS.lime}; }
  .addr {
    margin-top: 22px; font-size: 21px; font-weight: 700;
    text-transform: uppercase; letter-spacing: .05em; color: #4a463f;
  }
  .right { flex: 1 1 42%; position: relative; border-left: 6px solid ${TOKENS.ink}; }
  .right img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .right .fallback {
    width: 100%; height: 100%; background: ${TOKENS.electric};
    display: grid; place-items: center; color: ${TOKENS.paper};
    font-size: 150px; font-weight: 700;
  }
  .stripe {
    position: absolute; left: 0; right: 0; bottom: 0; height: 22px;
    background: repeating-linear-gradient(
      45deg, ${TOKENS.ink} 0 18px, ${TOKENS.acid} 18px 36px
    );
    border-top: 5px solid ${TOKENS.ink};
  }
</style></head>
<body>
  <div class="left">
    <span class="eyebrow">${site.tagline}</span>
    <h1>${site.name.split(' ')[0]}<em>${site.name.split(' ').slice(1).join(' ')}</em></h1>
    <p class="tag">Same-day repair, honest prices, a real warranty.</p>
    <div class="points">
      <span class="point hi">Free diagnosis</span>
      <span class="point">90-day warranty</span>
      <span class="point">45-min screens</span>
    </div>
    <p class="addr">${site.address.line2} · ${site.address.city} · ${site.address.region}</p>
  </div>
  <div class="right">
    ${photo ? `<img src="${photo}" alt="">` : '<div class="fallback">MM</div>'}
    <div class="stripe"></div>
  </div>
</body></html>`

  const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  )
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  await page.setContent(html, { waitUntil: 'load' })

  const jpeg = await page.screenshot({ type: 'jpeg', quality: 88 })
  await writeFile(join(PUBLIC, 'og-cover.jpg'), jpeg)

  await browser.close()

  console.log(`[og] public/og-cover.jpg — 1200x630, ${(jpeg.length / 1024).toFixed(0)} kB`)
}

main().catch((error) => {
  console.error('[og] failed:', error)
  process.exit(1)
})
