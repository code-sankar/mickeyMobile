# Deploying Mickey Mobile

Two independent pieces. **The frontend deploys and works on its own** — do that
first, confirm the site is live, then add the API when you have a database.

| Piece      | Root directory | Needs                          |
| ---------- | -------------- | ------------------------------ |
| `frontend` | `frontend`     | Nothing                        |
| `backend`  | `backend`      | A MongoDB Atlas connection string |

---

## 1. Frontend

A static Vite build. On Vercel, create a project from this repo and set:

- **Root Directory**: `frontend`
- Framework preset, build command and output directory are read from
  `frontend/vercel.json`; leave them on the defaults.

Environment variables are all optional — see `frontend/.env.example`. With none
set, the site renders entirely from the data bundled in `src/data/`, and the
booking and student forms submit through WhatsApp.

> **The Root Directory setting is not optional.** A Vercel project pointed at
> the repo root will fail: there is no `package.json` there. If a project is
> failing with "no package.json found", this is why.

### Why `frontend/vercel.json` matters

The site uses `createBrowserRouter`, so `/shop` and `/repairs` are client-side
routes with no file behind them. Without the SPA rewrite in that file, a
visitor who deep-links to `/shop`, refreshes on `/repairs`, or follows a shared
link gets a hard 404 from the static host — the home page works and everything
else appears broken. The rewrite sends unmatched paths to `index.html` so the
router can resolve them.

Vercel checks the filesystem *before* applying rewrites, so real files
(`/assets/*`, `/favicon.svg`, the images in `public/`) are still served
directly.

---

## 2. Backend

Needs MongoDB Atlas. Create a cluster, add a database user with `readWrite` on
the app database, and allow-list your server's IP under **Network Access**.

Set the environment variables from `backend/.env.example`. Only `MONGODB_URI`
is required; `JWT_SECRET` is required for the staff routes to mount at all.

Then seed the content once:

```bash
cd backend
npm install
npm run seed
```

### Option A — Vercel (no extra infrastructure)

Create a second Vercel project from the same repo with **Root Directory** set
to `backend`. `backend/vercel.json` routes every request into
`backend/api/index.js`, which exports the Express app as a serverless handler.

Two caveats worth knowing before you pick this:

- **Rate limiting is per-container.** `express-rate-limit` keeps its counters in
  memory, and serverless containers are created and destroyed freely, so the
  limits are far weaker than the configured numbers suggest. For a shop this
  size that is usually acceptable; if it is not, put a real rate limiter in
  front (Vercel's own, or Cloudflare) rather than trusting the app's.
- **Cold starts** add a second or two to the first request. The frontend's
  10-second timeout absorbs this, and falls back rather than hanging.

### Option B — Render, Railway or Fly (a long-lived process)

Better suited to Express + Mongoose: one persistent connection, working
in-memory rate limits, no cold starts.

- **Build**: `npm install`
- **Start**: `npm start`
- **Health check path**: `/api/v1/health` — it returns 503 while the database is
  unreachable, so the platform drains a bad instance instead of serving errors.

Set `TRUST_PROXY=1` behind a single reverse proxy (all three of these), or `0`
if the app is exposed directly. Getting it wrong breaks rate limiting: every
visitor is counted as the proxy's IP.

---

## 3. Connecting the two

Once the API is live, set on the **frontend** project:

```
VITE_API_URL=https://your-api-host/api/v1
```

and on the **backend** project:

```
CORS_ORIGINS=https://your-frontend-domain,https://www.your-frontend-domain
```

Redeploy the frontend — `VITE_*` variables are baked in at build time, so
setting one without rebuilding changes nothing.

### What changes when they are connected

| | Without `VITE_API_URL` | With it |
| --- | --- | --- |
| Catalogue, estimator, prices | Bundled data | Bundled data (unchanged) |
| Bookings | Local ticket → WhatsApp | Real ticket on the system, server-priced |
| Student registrations | WhatsApp only | Recorded, with consent stored |
| Reviews | Bundled sample set | Server-proxied Google, key never in the bundle |
| Open/closed badge | Visitor's clock | Shop's timezone |

The frontend treats the API as an enhancement, not a dependency. If it is
unreachable, slow, or returns something that is not JSON, every one of these
falls back to the left-hand column rather than showing an error. The booking
confirmation says which path it took, so a customer is never told a slot is
booked when it only reached WhatsApp.

---

## Verifying a deploy

```bash
# Frontend: deep links must work, not just the home page.
curl -sI https://your-site/repairs | head -1     # expect 200, not 404
curl -sI https://your-site/shop/iphone-15-128 | head -1

# Backend
curl -s https://your-api-host/api/v1/health
curl -s https://your-api-host/api/v1/catalog/products?limit=1
```

`health` reports `database: "connected"` when Atlas is reachable. If it says
`disconnected`, check the Atlas IP allow-list first — it is the usual cause.

To run the browser checks locally:

```bash
cd frontend
npm run build
node e2e.mjs          # deep links, 404s, offline booking flow
```
