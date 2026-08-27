# Mickey Mobile

A conversion-focused site for a local phone business that does three things under one roof:
**device sales**, **expert repair**, and **premium accessories**.

Neo-brutalist: bone paper, ink borders, hard offset shadows, flat saturated colour and oversized
display type. Multi-page, with an interactive repair-cost estimator, a URL-driven catalogue and live
opening hours — not a static page of placeholder blocks.

---

## Stack

| Concern    | Choice                                                          |
| ---------- | --------------------------------------------------------------- |
| Framework  | React 18 + Vite 5                                                |
| Routing    | React Router 6 (data router, lazy route chunks)                  |
| Styling    | Tailwind CSS 3.4 (custom palette, keyframes, utilities)          |
| Icons      | `lucide-react`                                                   |
| Animation  | CSS keyframes + `IntersectionObserver` + `requestAnimationFrame` |
| Deps       | 4 runtime dependencies. No animation library, no UI kit.         |

Production bundle: **~100 kB gzipped JS** on first load, **~7 kB gzipped CSS**. Every route past the
home page is a separate chunk of **1–5 kB gzipped**, fetched on navigation.

---

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

| Script            | Does                                        |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Vite dev server with HMR                    |
| `npm run build`   | Production build to `dist/`                 |
| `npm run preview` | Serve the built `dist/` locally             |
| `npm run lint`    | ESLint (React + hooks rules), zero-warning  |

Requires Node 18+.

---

## The design system

Five primitives carry the entire look. They are defined once in `src/styles/index.css` and used
everywhere; nothing re-implements them inline.

| Primitive  | What it is                                                                     |
| ---------- | ------------------------------------------------------------------------------ |
| `.slab`    | 3px ink border + hard offset shadow, zero radius — via the `<Card>` component   |
| `.press`   | Hover pushes an element *into* its own shadow instead of lifting it             |
| `.label`   | Mono, uppercase, wide-tracked — every eyebrow, meta line and stat caption       |
| `.rule`    | A 3px divider used as a structural element, not a hairline                      |
| `.sticker` | A rotated tag that deliberately breaks the grid (savings badges, hero callouts) |

**Rules the system holds to.** No border radius. No gradients — colour is always a flat fill. No
blurred shadows — every shadow is a hard offset in ink. One black (`#141210`) for every border, rule
and shadow. Accents are used as fills, never as tints.

### Tokens

`src/styles/index.css` declares semantic CSS variables (`--paper`, `--ink`, `--accent`…) and
`tailwind.config.js` exposes them as utilities:

- **Colours** — `paper` (the warm bone ramp, `paper-100` = `#FBF6E9`), `ink` (`#141210`), and six flat
  accents: `electric` `#2B44FF`, `acid` `#FFE01F`, `flare` `#FF4A1C`, `lime` `#A6F32B`,
  `grape` `#8B3DFF`, `blush` `#FF74B0`
- **Fonts** — `font-display` (Archivo Black), `font-sans` (Space Grotesk), `font-mono`
  (JetBrains Mono), loaded from Google Fonts in `index.html`
- **Shadows** — `shadow-brut-xs` through `shadow-brut-xl`, plus `shadow-brut-acid` /
  `-electric` / `-paper` for panels sitting on ink
- **Borders** — `border-3`, `border-5`, `border-6`

Retheming the site is a change to the token block and the `surfaces` map in `Card.jsx`.

---

## Architecture

### Routes

Real URLs, not anchors. The nav is navigation.

| Route                | Page                                                            |
| -------------------- | --------------------------------------------------------------- |
| `/`                  | Hero, stats, process, featured shelf, accessories, reviews, store |
| `/repairs`           | The estimator, what we fix, the four-stage process, guarantee    |
| `/shop`              | Full catalogue with filters                                      |
| `/shop/:productId`   | Product detail with specs, in-the-box, warranty, related items   |
| `/accessories`       | Cases, power and audio — merchandised, with the counter-fitting pitch |
| `/students`          | The student discount: bands, savings calculator, registration    |
| `/reviews`           | Every review, with the rating breakdown                          |
| `/visit`             | Map, live hours, contact, getting here                           |
| anything else        | 404                                                              |

The home page ships in the main bundle; every other route is a lazy chunk, so a visitor who only
wanted the address never downloads the catalogue or the price tables.

`/shop/:productId` resolves its product in a **route loader**. An unknown id throws a 404 response
that the router's `errorElement` renders, rather than a half-empty product page.

### Where state lives

| State                        | Lives in                                   | Why there                                                             |
| ---------------------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| Catalogue filters            | **The URL** (`useCatalogFilters`)          | Shareable, back-button-undoable, survives reload                       |
| The booking dialog           | **`BookingProvider`** at the router root   | Every CTA on every route drives one instance                           |
| Estimator selection          | **`useEstimator`**, local to the estimator | Nothing outside it needs to read a half-made selection                 |
| Everything derived           | Selectors in `src/data/selectors.js`       | Pricing and filtering are defined once, not per component              |

### Layout

```
src/
├── main.jsx                    # RouterProvider
├── styles/index.css            # tokens, the five primitives, reveal, reduced-motion
│
├── app/                        # the shell
│   ├── router.jsx              # route table, lazy chunks, the product loader
│   ├── RootLayout.jsx          # header / <Outlet/> / footer / action bar / scroll restoration
│   └── providers/              # BookingProvider + its context
│
├── routes/                     # one file per URL — composition only, no business logic
│   ├── HomePage.jsx  RepairsPage.jsx  ShopPage.jsx
│   ├── ProductPage.jsx  ReviewsPage.jsx  VisitPage.jsx  ErrorPage.jsx
│
├── features/                   # self-contained slices; routes assemble them
│   ├── repairs/                # Estimator, EstimatorSteps, QuotePanel, BookingModal,
│   │                           # RepairTicket + useEstimator
│   ├── shop/                   # CatalogToolbar, CatalogGrid, ProductCard, ProductVisual,
│   │                           # ProductDetail + useCatalogFilters
│   ├── reviews/                # RatingSummary, ReviewCard, ReviewWall
│   ├── visit/                  # HoursCard, ContactCard, MapPanel, GettingHere
│   └── marketing/              # Hero, StatBand, BrandTicker, ProcessTimeline,
│                               # GuaranteeBand, CtaBand
│
├── components/
│   ├── ui/                     # the design system
│   │   ├── Card.jsx            # the slab — 9 surfaces × 5 shadow depths
│   │   ├── Button.jsx          # 7 variants × 4 sizes; <Link> for `to`, <a> for `href`
│   │   ├── Badge.jsx  Field.jsx  Modal.jsx  Marquee.jsx
│   │   ├── PageHeader.jsx      # the banner + breadcrumb every inner route opens with
│   │   └── SectionHeading.jsx  Reveal.jsx  Counter.jsx  Stars.jsx  Logo.jsx
│   └── layout/                 # SiteHeader, SiteFooter, MobileActionBar
│
├── data/                       # all copy and pricing — edit here, not in components
│   ├── selectors.js            # the query layer: buildQuote, filterProducts, relatedProducts…
│   ├── site.js  repairs.js  products.js  process.js  testimonials.js
│
├── hooks/                      # useReveal, useCountUp, useOpenStatus, useDocumentTitle,
│                               # useLockBodyScroll, usePrefersReducedMotion
└── lib/                        # utils (cx, money), hours (open/closed logic)
```

**Components never read the raw data arrays.** They call `src/data/selectors.js`, so the shape of the
content stays an implementation detail — swapping any of it for a CMS or an API is a change to that
one file.

---

## What's interactive

**Repair estimator** (`/repairs`) — Brand → Model → Issue → live quote. Prices are per-model and
per-issue, not averaged. The quote panel offers a **part-grade toggle** (Genuine OEM vs premium
aftermarket) that re-prices and re-warranties in place, with the figure easing to its new value.
Breadcrumb chips jump back to any completed step, and the panel scrolls itself back into view when a
step changes its height.

**Booking dialog** — validated (name, 10-digit Indian mobile, future date, slot), with time-slot chips,
handling options and a confirmation state that issues a ticket number. Opened from the header, the
mobile action bar or the estimator — all the same instance, carrying the estimator's quote when
there is one. The confirmation hands the whole booking to WhatsApp; see *WhatsApp* below.

**Catalogue** (`/shop`) — category tabs with live counts, text search across name/brand/subtitle/blurb,
and price sorting, **all of it in the URL**: `/shop?category=cases&q=magsafe&sort=price-asc` is a link
you can send someone. The empty state routes to WhatsApp, carrying the failed search term.

**Accessories** (`/accessories`) — the cases, power and audio side of the shelf, merchandised rather
than filtered: three category panels with live counts and price floors, the full 12-line grid, the
counter-fitting pitch, and a cross-sell to the repair bench. Adding a fourth accessory category to
`ACCESSORY_CATEGORIES` in `src/data/selectors.js` surfaces it here automatically.

**Hero** — a headline whose closing line rotates on a timer (click it to advance, hover to pause), and
a "live ticket" card that walks itself through the four service stages.

**Visit** (`/visit`) — opening hours compute **Open now / Closing soon / Closed** from the visitor's own
clock and refresh every minute; today's row is highlighted.

---

## WhatsApp

There is no CRM behind this site. WhatsApp is the counter, so every enquiry is built to arrive with
its context already in the message — the customer does not retype what they were looking at, and the
shop does not have to ask.

One number lives in `site.whatsappNumber`. Every link is built from it by `src/lib/whatsapp.js`; no
`wa.me` URL is written by hand anywhere else in the codebase.

| Where | The message carries |
| ----- | ------------------- |
| Product page → *Reserve* | Brand, name, variant, and the price the customer was shown |
| Accessory page → *Will this fit my phone?* | The accessory, plus a blank line for their handset |
| Estimator → *Send quote* | Device, issue, part grade, estimate, turnaround, warranty |
| Booking confirmation → *Send to WhatsApp* | Ticket number, name, phone, date, slot, handling, the full quote, notes |
| Empty search → *Ask on WhatsApp* | The search term that returned nothing |
| Shop footnote → *Get a valuation* | A trade-in template |
| Estimator → *WhatsApp us the model* | An unlisted-model quote template |

The booking form is the important one. With `VITE_API_URL` set it books a real slot through the
API, which allocates a unique ticket number and reprices the quote server-side. Without it — or if
the API is unreachable — it does what it always did: issues a ticket locally and hands the whole
booking to WhatsApp as a prefilled message. For a shop that already runs on WhatsApp that **is** a
submission path, not a stub, which is why it is the fallback rather than an error screen. The
confirmation says which of the two happened, so a customer is never told a slot is booked when it
only reached the chat. `waLink()` only opens the composer — the customer still presses send, so
nothing is transmitted on their behalf.

To change the tone of every message, edit the builders in `src/lib/whatsapp.js`. To add a new CTA,
use `<WhatsAppButton message={…} />`; its `message` prop is required so a new call site cannot
silently fall back to a contextless "hi".

---

## Student discount

Students 18+ get **10–15% off repair bills over ₹1,000**, after registering the handset
they want looked after. `/students` explains the offer, prices it, and takes the
registration.

The whole offer is data. `src/data/students.js` holds the discount bands, the
eligibility rules, what is collected and why, and the consent wording;
`src/lib/studentDiscount.js` holds the maths. Change a band there and the tier
cards, the calculator and the page copy all follow.

**The 10 vs 15 split is an assumption.** The brief said "10–15%" without saying what
decides which, so this splits on bill size — 10% from ₹1,000, 15% from ₹5,000. If
the real rule is different (course length, a partner institution, a promo window),
change `discountTiers` and nothing else needs touching.

### How a registration actually reaches the shop

With `VITE_API_URL` set the registration is recorded through the API, with each
consent stored alongside the exact wording that was shown. Without it, or if the
API is unreachable, it is submitted the way a booking is — as a WhatsApp message
with every field written out, which the student presses send on.

Either way there is a step left, because of the next paragraph.

**The ID card is deliberately never handled by this website.** There is no file
input on the page, and no endpoint on the API that would accept one. The card is
shown at the counter, or attached by the student in the chat — so it goes from
their camera roll into an encrypted conversation and never touches our origin,
our logs, or a third-party form service. Neither a static site nor this API has
anywhere to put an identity document safely, and pretending otherwise would be
worse than not offering the feature.

### Consent

Two consents, kept separate, because they are two different purposes:

- **Verification** — required. Without it there is no registration.
- **Monthly stock email** — optional, unticked by default, and explicitly recorded
  either way in the message the shop receives, so there is a record of what was
  agreed to.

Bundling them would make neither freely given. The page also states, at the point
of collection, what each field is for, how long it is kept and how to have it
deleted.

India's DPDP Rules 2025 were notified in November 2025 with obligations phasing in
through to mid-2027, and this shop processes personal data of Indian residents.
The mechanics here — purpose-specific consent, a plain-language notice, an 18+
gate, a stated retention and withdrawal route — are built to fit that shape.
**This is not legal advice**; confirm the specifics against your own obligations
before launch, and put a real contact address behind the deletion request.

### The monthly mailer is not built — and cannot be, here

The registration captures everything the mailer needs (handset brand, model, how
long it has been owned, the email, and the opt-in flag). Sending it needs four
things a static site does not have:

| Needs                | Why                                                            |
| -------------------- | -------------------------------------------------------------- |
| A datastore          | To hold registrations and the opt-in state                      |
| A scheduled job      | Something has to wake up once a month                           |
| An email provider    | With authenticated sending, bounce handling and a real unsubscribe link |
| An admin view        | To check ID photos and approve or reject a registration         |

Until those exist, registrations arrive in WhatsApp and the shop segments by hand.
When they do exist, the seam is `useStudentRegistration` — swap what `submit`
does with the validated values and the rest of the page is unchanged.

Every marketing email must carry a working one-click unsubscribe that actually
clears the flag. The opt-in captured here is only meaningful if it can be
withdrawn.

---

## Google reviews

The site shows **live reviews from the Google Business Profile** when it is
configured, and clearly-labelled sample content when it is not. It never
presents the sample set as a Google rating.

### Why it is fetched, not stored

Reviews are Google's content. The Places API terms allow caching Place IDs but
not review bodies, author names or ratings, so they are fetched on each visit
and rendered straight from the response. Nothing is written into `src/data` or
into the API's database, and there is no scraping of the Maps page — that is
against Google's terms and breaks the moment their markup changes.

There are two ways to fetch them, and the first is preferred:

1. **Through the API** (`VITE_API_URL`). The key lives on the server, so it
   never ships in this bundle and can be restricted by **IP** rather than by
   referrer. One upstream call also serves every visitor instead of one per
   page load.
2. **Direct from the browser** (`VITE_GOOGLE_*`), via `src/lib/googlePlaces.js`.
   Kept so a deployment without the API behaves as it did before there was one.

`useGoogleReviews` tries the API first, then the browser key, then the bundled
sample set — and reports which it used in `source`, so sample content can never
be presented as a Google rating.

**Google returns at most five reviews per place.** There is no supported way to
page past that. If you need the full wall, that is what the paid widgets
(Elfsight, Trustindex, Featurable) exist for — they hold a licence to
redistribute more.

### Setup

Prefer configuring this on the **backend** (`GOOGLE_MAPS_API_KEY` /
`GOOGLE_PLACE_ID` in `backend/.env`) and pointing `VITE_API_URL` at it. The
steps below are for the browser-key fallback.

1. Google Cloud Console → **Credentials** → create an API key.
2. Enable **Maps JavaScript API** and **Places API (New)** on it.
3. Restrict the key by **HTTP referrer** to your domains. The key ships in the
   client bundle — referrer restriction is the thing protecting it, not secrecy.
   (A key given to the backend instead can be restricted by IP, which a page
   cannot forge its way past. That is the reason to prefer it.)
4. Find the **Place ID** (it looks like `ChIJ…`) with Google's
   [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id).
   This is *not* the `cid` in the Maps URL.
5. Copy `.env.example` to `.env` and fill both values.

```bash
cp .env.example .env
```

Restart the dev server after changing `.env` — Vite only reads it at boot.

### What changes once it is connected

| Surface                | Not configured                        | Connected                              |
| ---------------------- | ------------------------------------- | -------------------------------------- |
| `/reviews` headline    | "Honest reviews. One counter."        | "N reviews. R stars. One counter."     |
| Rating card            | Sample distribution + a warning strip | Live rating and count, linked to Google |
| Home review wall       | Two tickers of sample reviews         | One ticker of the live five             |
| Hero sticker           | "Free diagnosis"                      | "R★ · N reviews"                       |
| Stat band rating tile  | "Average rating (sample)"             | "N Google reviews"                     |

`useGoogleReviews()` is the single source: it returns `{ status, source, rating,
total, reviews, profileUrl }`, and every one of those surfaces branches on
`source`. If the fetch fails, it falls back to the sample set rather than
rendering an empty page.

### Before launch

Delete `src/data/testimonials.js`, the `sampleRating` block in `src/data/site.js`
and `features/reviews/components/SampleNotice.jsx` once the profile is
connected. The sample reviews read like real customer feedback and should not
ship on a live business site.

**No `aggregateRating` is emitted in the JSON-LD.** Google does not allow a
business to mark up its own review scores, and the rating shown in search
results comes from the Business Profile itself, not from the page.

---

## Going live

See [`../DEPLOYMENT.md`](../DEPLOYMENT.md) for hosting both halves. Everything below is content or
configuration still to replace.

1. **Business details** — `src/data/site.js`. The name and postal address already match the Google
   listing. Still to replace: the phone number (`+91 98765 43210` is a documentation placeholder),
   `whatsappNumber` (same placeholder, and it drives *every* WhatsApp link on the site), and the map
   `geo` coordinates (currently Tinsukia town centre, not TDA Market's exact rooftop). Mirror the same
   values in the `LocalBusiness` JSON-LD block in `index.html`. The Google listing is already wired:
   `site.google.cid` points at the real profile and drives directions and the review links.
2. **Booking and registration submissions** — live either way: through the API when `VITE_API_URL`
   is set, and through WhatsApp when it is not or when the API cannot be reached. Nothing left to
   stub out.
3. **Map** — `src/features/visit/components/MapPanel.jsx` draws an SVG stand-in. Swap the `<svg>` for a
   Google Maps or Mapbox embed; the frame, address card and directions button stay as they are.
4. **Google reviews** — see the section above. Prefer configuring the key on the backend.
5. **Product photography** — `ProductVisual.jsx` draws silhouettes. Replace it with `<img>` and add an
   `image` field to each entry in `src/data/products.js`.
6. **Currency** — `CURRENCY` in `src/lib/utils.js` drives every price format. Change the locale and
   symbol there, then re-price `products.js` and `repairs.js`.
7. **Social links** — the `socials` array in `src/components/layout/SiteFooter.jsx`.

---

## Accessibility & performance notes

- Every animation is disabled under `prefers-reduced-motion: reduce` — including the tickers, the
  headline rotator and the count-ups, which check the query in JS rather than just being CSS-muted.
  The brand and review marquees become plain horizontal scrollers instead of freezing mid-slide.
- The modal is portalled, scroll-locked without layout shift, closes on Escape from anywhere, traps
  Tab, pulls focus back if it escapes the panel, and restores focus to the trigger on close.
- Focus is a hard 3px ink ring — the same language as the borders, not a soft glow.
- Product cards are a single link, so the catalogue works identically by touch, mouse and keyboard.
- Each route sets its own `<title>` and meta description (`useDocumentTitle`), and every inner route
  carries a breadcrumb trail. Exactly one `<h1>` per page.
- Skip-to-content link, `aria-pressed` on every toggle, `aria-live` on the rotating headline,
  labelled icon-only buttons, and semantic `figure`/`blockquote` for reviews.
- Scroll listeners are passive; scroll position is restored by the router on back navigation.
- `LocalBusiness` structured data, Open Graph tags and a canonical URL ship in `index.html` for local
  SEO.

---

## Content

Product names, specs, prices and repair rates are realistic figures for the Indian market. There is
no Lorem Ipsum and no "Item 1" anywhere in the project. Treat the numbers as a starting point and
reconcile them against your actual shelf before launch.

The bundled reviews in `src/data/testimonials.js` are **written samples, not real customers.** They
exist so the layout has something to hold before the Google profile is connected, and the UI marks
them as sample data wherever they appear. Connect Google and delete them — see *Google reviews*
above.
