# Mickey Mobile — API

REST API behind the Mickey Mobile site: the catalogue, the repair estimator, bookings, the student
discount and the review wall.

| Concern    | Choice                                       |
| ---------- | -------------------------------------------- |
| Runtime    | Node 18+ (ESM)                                |
| Framework  | Express 5                                     |
| Database   | MongoDB Atlas via Mongoose 9                  |
| Validation | Zod 4                                         |
| Auth       | JWT bearer tokens (staff only)                |

---

## Where this came from

The frontend shipped its content as JavaScript modules in `frontend/src/data/` and did its pricing
maths in `frontend/src/lib/`. This API is those two things moved server-side:

- **Content** — `src/seed/data/*.json` was *generated from* the frontend's own data modules rather
  than retyped, so every price, id and line of copy is identical to what the site renders today.
- **Rules** — `src/domain/` is a port of `selectors.js`, `studentDiscount.js` and `hours.js`. A
  parity harness compared the two implementations across all 204 possible quotes, 13 bill amounts,
  7 age boundaries and a full week of opening hours: 398/398 outputs identical.

Two rules deliberately changed, both because the browser was the wrong place to decide them:

| Rule | Browser did | Server does | Why |
| ---- | ----------- | ----------- | --- |
| Repair price | Computed client-side and shown | Recomputed from the live price list; the client may only send a *selection* | A price in a request body is a price a customer can edit |
| Open/closed | Read the visitor's clock | Answers in `SHOP_TIMEZONE` | A visitor in London was told the shop is open at 3am IST |

---

## Getting started

```bash
cp .env.example .env      # fill in MONGODB_URI at minimum
npm install
npm run seed              # load the catalogue, prices and copy into Atlas
npm run dev               # http://localhost:4000/api/v1
```

| Script                 | Does                                                              |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run dev`          | Server with `--watch` reload                                       |
| `npm start`            | Production server                                                  |
| `npm run seed`         | Upsert content by natural id — safe to re-run after a price change |
| `npm run seed:fresh`   | Drop content collections first (never touches customer data)       |
| `npm run create-admin` | Interactive counter login — keeps passwords out of the repo        |
| `npm test`             | Offline checks: schemas, seed integrity, routing, error mapping    |

### MongoDB Atlas

Create a cluster, add a database user with `readWrite` on the app database only, and allow-list the
API server's IP under **Network Access**. Then set `MONGODB_URI` to the `mongodb+srv://…` string.

---

## Endpoints

Base path is `API_PREFIX` (default `/api/v1`). Every response is
`{ ok: true, data, meta? }` or `{ ok: false, error: { code, message, details? } }`.

### Catalogue — backs `/shop`, `/shop/:id`, `/accessories`

| Method | Path                        | Notes |
| ------ | --------------------------- | ----- |
| GET    | `/catalog/categories`       | With per-category counts, including the synthetic `all` |
| GET    | `/catalog/products`         | `?category=&q=&sort=&page=&limit=` — the same query shape the shop keeps in its URL |
| GET    | `/catalog/products/:id`     | Product plus related items; 404 on an unknown id |
| GET    | `/catalog/accessories`      | Cases / power / audio, each with a count and price floor |

`sort` is `featured` (curated order), `price-asc` or `price-desc`. `q` substring-matches name,
brand, subtitle and blurb.

### Repairs — backs the estimator on `/repairs`

| Method | Path                     | Notes |
| ------ | ------------------------ | ----- |
| GET    | `/repairs/options`       | Brands, issues, grades, slots and service modes in one call |
| GET    | `/repairs/brands`        | Brands with their models and price tables |
| GET    | `/repairs/brands/:id`    | |
| GET    | `/repairs/issues`        | Each with `startingPrice` across the whole catalogue |
| GET    | `/repairs/grades`        | OEM / premium aftermarket, with multipliers |
| GET    | `/repairs/process`       | The four bench stages |
| POST   | `/repairs/quote`         | `{ brandId, modelId, issueId, gradeId }` → priced quote. Writes nothing |

### Bookings

| Method | Path                     | Notes |
| ------ | ------------------------ | ----- |
| POST   | `/bookings`              | Returns a unique `MM-####` ticket |
| GET    | `/bookings/availability` | `?date=YYYY-MM-DD` — which slots are still free |
| POST   | `/bookings/lookup`       | `{ ticket, phone }` — customer status check |

The booking body takes `quote` as a **selection**, not a price:

```jsonc
{
  "name": "Ananya Bora",
  "phone": "9876543210",
  "date": "2027-01-04",
  "slot": "10:00 AM",
  "mode": "walkin",
  "notes": "Touch dead on the left third",
  "quote": { "brandId": "apple", "modelId": "iphone-13", "issueId": "screen", "gradeId": "oem" }
}
```

The server rebuilds the quote from the live price list and snapshots it onto the ticket, so a later
price edit cannot rewrite what a customer was quoted.

Ticket numbers come from an atomic counter, not `Math.random()` — once tickets are rows in a
database, two customers sharing `MM-4821` is a real support problem.

### Students

| Method | Path                          | Notes |
| ------ | ----------------------------- | ----- |
| GET    | `/students/offer`             | Tiers, minimums, eligibility, consent wording, retention policy |
| GET    | `/students/savings?amount=`   | What a given bill is worth |
| POST   | `/students/register`          | Flat body — post the form's `values` object as-is |
| POST   | `/students/marketing/withdraw`| Unsubscribe without deleting the registration |
| POST   | `/students/data-request`      | Access, correction or erasure request |

### Reviews, site

| Method | Path            | Notes |
| ------ | --------------- | ----- |
| GET    | `/reviews`      | Google when configured, the shop's own set otherwise — see `source` |
| GET    | `/site`         | Identity, hours, nav, serviced brands |
| GET    | `/site/status`  | Live open/closed in the shop's timezone |
| GET    | `/site/hours`   | |
| GET    | `/site/stats`   | The hero stat band, with the rating filled from live reviews |
| GET    | `/health`       | 503 while the database is down, so probes drain a bad instance |

### Admin (`Authorization: Bearer …`)

Not mounted at all unless `JWT_SECRET` is set.

`POST /admin/login` · `GET /admin/me` · `GET /admin/queue` ·
`GET|PATCH /admin/bookings…` · `GET|PATCH /admin/students…` ·
`GET /admin/students/marketing-audience` · `GET /admin/data-requests` ·
`POST /admin/data-requests/:ref/execute` *(owner only)*

---

## Privacy decisions baked into the schema

The students page makes specific promises. These are the parts of the code that keep them:

- **No student ID upload exists.** The page says the card is "checked and then deleted — never
  uploaded to this website", so there is no field for it, no endpoint that accepts one, and a test
  asserts an `idCard` key is stripped rather than stored.
- **Consent is stored with its wording.** "They ticked a box" is not a record; what the box *said*
  is. Change the offer next quarter and existing registrations still carry the terms they agreed to.
- **Verification and marketing are separate.** Only verification gates registration. Marketing
  defaults to off and can be withdrawn without deleting anything.
- **Erasure has a mechanism, not just a sentence.** `/students/data-request` logs it; an owner
  executes it after checking identity at the counter. The log outlives the erasure it records, and
  holds counts rather than content.
- **Google reviews are never persisted.** The Places terms allow caching a Place ID but not review
  bodies, ratings or author names. Responses are held in process for `GOOGLE_CACHE_TTL_SECONDS`
  and the endpoint sends `Cache-Control: no-store` when serving them.

---

## Error shape

Validation failures come back keyed to the field, using the same message the form already renders:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Some details need another look",
    "details": { "phone": "10-digit mobile", "name": "Who do we ask for?" }
  }
}
```

That is the shape `useStudentRegistration` and `BookingModal` already hold in their `errors` state,
so a 422 can be passed to `setErrors` with no mapping layer.

| Status | When |
| ------ | ---- |
| 400 | Malformed JSON, bad identifier |
| 401 | Missing, invalid or expired bearer token |
| 403 | Authenticated but not an owner |
| 404 | Unknown route or record |
| 409 | Duplicate registration, redundant status change |
| 422 | Validation — always with `details` |
| 429 | Rate limited |
| 503 | Database unreachable |

---

## Wiring the frontend

The frontend still reads `src/data/` directly and is unchanged by this work. To move it onto the
API, replace the bodies of `src/data/selectors.js` with fetches — that file exists precisely so
"swapping any of it for a CMS or an API later is a change to this one file rather than to every
component that reads it".

Roughly:

| Frontend | Becomes |
| -------- | ------- |
| `filterProducts()` | `GET /catalog/products` |
| `getProduct()` / `relatedProducts()` | `GET /catalog/products/:id` |
| `accessoryGroups()` | `GET /catalog/accessories` |
| `buildQuote()` | `POST /repairs/quote` |
| `BookingModal` submit | `POST /bookings` |
| `useStudentRegistration` submit | `POST /students/register` |
| `useGoogleReviews` | `GET /reviews` (drops `VITE_GOOGLE_MAPS_API_KEY` from the bundle) |

Set `VITE_API_URL` to this server and add that origin to `CORS_ORIGINS` here.
