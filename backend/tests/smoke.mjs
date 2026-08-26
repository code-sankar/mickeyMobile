/**
 * Offline verification.
 *
 * No MongoDB is reachable in this environment, so this covers everything that
 * does not need a live connection: the module graph, the seed data measured
 * against the real Mongoose schemas, the validation schemas, and the HTTP
 * layer's routing and error mapping. Run it with a database available and the
 * db-backed assertions below can be flipped from 503 to 200.
 */
process.env.MONGODB_URI ||= 'mongodb://127.0.0.1:27017'
process.env.JWT_SECRET ||= 'test-secret-'.padEnd(64, 'x')
process.env.NODE_ENV = 'test'

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

let pass = 0
let fail = 0
const ok = (cond, name, extra = '') => {
  if (cond) { pass++; console.log(`  ok   ${name}`) }
  else { fail++; console.log(`  FAIL ${name}${extra ? `\n       ${extra}` : ''}`) }
}
const section = (t) => console.log(`\n${t}`)

/* ------------------------------------------------- 1. the whole graph loads */

section('module graph')
const { createApp } = await import('../src/app.js')
const models = Object.fromEntries(
  await Promise.all(
    ['Product', 'Category', 'Brand', 'Issue', 'PartGrade', 'Booking', 'StudentRegistration',
     'Review', 'Setting', 'AdminUser', 'ErasureRequest', 'Counter'].map(async (n) => [
      n, (await import(`../src/models/${n}.js`))[n],
    ]),
  ),
)
ok(Object.values(models).every(Boolean), `all ${Object.keys(models).length} models compile`)

/* -------------------- 2. seed data actually satisfies the schemas it targets */

section('seed data validates against the schemas')
// Resolved against this file, not the working directory, so `npm test` works
// from anywhere in the project.
const dataDir = join(import.meta.dirname, '../src/seed/data')
const read = (f) => JSON.parse(readFileSync(join(dataDir, f), 'utf8'))

const validateAll = (Model, rows, label) => {
  const errors = []
  rows.forEach((row, i) => {
    const error = new Model({ ...row, order: i }).validateSync()
    if (error) errors.push(`${row.id ?? i}: ${Object.keys(error.errors).join(', ')}`)
  })
  ok(errors.length === 0, `${label} (${rows.length})`, errors.slice(0, 3).join(' | '))
}

const products = read('products.json')
const brands = read('brands.json')
validateAll(models.Product, products, 'products')
validateAll(models.Category, read('categories.json'), 'categories')
validateAll(models.Brand, brands, 'brands')
validateAll(models.Issue, read('issues.json'), 'issues')
validateAll(models.PartGrade, read('partsGrades.json'), 'part grades')
validateAll(models.Review, read('testimonials.json'), 'reviews')

// Referential integrity the schemas alone cannot express: every model's price
// map must cover every issue, or the estimator hits a dead end mid-flow.
const issueIds = read('issues.json').map((i) => i.id)
const gaps = []
for (const b of brands)
  for (const m of b.models)
    for (const id of issueIds)
      if (!Number.isFinite(m.prices?.[id])) gaps.push(`${m.id}.${id}`)
ok(gaps.length === 0, `every model priced for every repair type (${brands.reduce((n, b) => n + b.models.length, 0)} x ${issueIds.length})`, gaps.slice(0, 5).join(', '))

// Product categories must exist, or the shop's filter offers an empty shelf.
const categoryIds = new Set(read('categories.json').map((c) => c.id))
const orphans = products.filter((p) => !categoryIds.has(p.category)).map((p) => p.id)
ok(orphans.length === 0, 'every product sits in a real category', orphans.join(', '))

/* --------------------------------------------- 3. validation schema messages */

section('validation mirrors the frontend forms')
const { bookingCreateSchema, bookingLookupSchema } = await import('../src/modules/bookings/bookings.routes.js')
const { studentRegisterSchema } = await import('../src/modules/students/students.routes.js')

const errorsOf = (schema, input) => {
  const r = schema.safeParse(input)
  if (r.success) return null
  return Object.fromEntries(r.error.issues.map((i) => [i.path.join('.') || '_', i.message]))
}

const bookingBase = { name: 'Ananya Bora', phone: '9876543210', date: '2027-01-04', slot: '10:00 AM' }
ok(bookingCreateSchema.safeParse(bookingBase).success, 'a valid booking passes')
ok(errorsOf(bookingCreateSchema, { ...bookingBase, name: 'A' })?.name === 'Who do we ask for?', 'short name -> "Who do we ask for?"')
ok(errorsOf(bookingCreateSchema, { ...bookingBase, phone: '12345' })?.phone === '10-digit mobile', 'bad phone -> "10-digit mobile"')
ok(errorsOf(bookingCreateSchema, { ...bookingBase, phone: '5876543210' })?.phone === '10-digit mobile', 'phone must open 6-9')
ok(errorsOf(bookingCreateSchema, { ...bookingBase, date: '' })?.date === 'Pick a day', 'missing date -> "Pick a day"')
ok(errorsOf(bookingCreateSchema, { ...bookingBase, slot: '' })?.slot === 'Choose a slot', 'missing slot -> "Choose a slot"')
ok(bookingCreateSchema.parse({ ...bookingBase, phone: '98765 43210' }).phone === '9876543210', 'spaced phone is normalised to 10 digits')
ok(bookingCreateSchema.parse(bookingBase).mode === 'walkin', 'mode defaults to walkin')
ok(bookingCreateSchema.parse(bookingBase).quote === null, 'quote is optional')
ok(errorsOf(bookingCreateSchema, {})?.name && errorsOf(bookingCreateSchema, {})?.phone, 'empty booking reports every field')

const studentBase = {
  name: 'Ananya Bora', dob: '2000-05-05', institution: 'Tinsukia College', phone: '9876543210',
  email: 'ananya@example.com', address: '2nd Floor, Shop No 258, TDA Market, Tinsukia',
  deviceBrand: 'Apple', deviceModel: 'iPhone 13', deviceAge: '1-2', verification: true,
}
ok(studentRegisterSchema.safeParse(studentBase).success, 'a valid registration passes')
ok(errorsOf(studentRegisterSchema, { ...studentBase, verification: false })?.verification === 'Required to register', 'verification consent is mandatory')
ok(studentRegisterSchema.parse(studentBase).marketing === false, 'marketing consent defaults to off')
ok(studentRegisterSchema.safeParse({ ...studentBase, marketing: true }).success, 'marketing consent is accepted when given')
ok(errorsOf(studentRegisterSchema, { ...studentBase, deviceAge: 'ancient' })?.deviceAge === 'Pick one', 'bad device age -> "Pick one"')
ok(errorsOf(studentRegisterSchema, { ...studentBase, address: 'short' })?.address === 'Full address', 'short address -> "Full address"')
ok(errorsOf(studentRegisterSchema, { ...studentBase, email: 'nope' })?.email === 'Check this', 'bad email -> "Check this"')
ok(errorsOf(studentRegisterSchema, { ...studentBase, dob: 'yesterday' })?.dob === 'Not a date', 'bad dob -> "Not a date"')
ok(studentRegisterSchema.parse({ ...studentBase, email: 'ANANYA@Example.COM ' }).email === 'ananya@example.com', 'email is lowercased and trimmed')
// The ID-card promise: no field for it exists, so one cannot be smuggled in.
ok(!('idCard' in studentRegisterSchema.parse({ ...studentBase, idCard: 'data:image/png;base64,AAAA' })), 'a student ID upload is stripped, never stored')

ok(errorsOf(bookingLookupSchema, { ticket: 'nope', phone: '9876543210' })?.ticket === 'Not a ticket number', 'ticket format is enforced')
ok(bookingLookupSchema.parse({ ticket: 'mm-1042', phone: '9876543210' }).ticket === 'MM-1042', 'ticket lookup is case-insensitive')

/* ---------------------------------------------------------- 4. HTTP surface */

section('http layer')
const app = createApp()
const server = app.listen(0)
await new Promise((r) => server.once('listening', r))
const base = `http://127.0.0.1:${server.address().port}`

async function req(name, method, path, { body, raw, expect, want } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: body || raw ? { 'content-type': 'application/json' } : {},
    body: raw ?? (body ? JSON.stringify(body) : undefined),
  })
  const json = await res.json().catch(() => ({}))
  let bodyOk = true
  try { bodyOk = want ? Boolean(want(json)) : true } catch { bodyOk = false }
  ok(res.status === expect && bodyOk, `${name} -> ${res.status}`,
     res.status !== expect || !bodyOk ? `want ${expect}; got ${JSON.stringify(json).slice(0, 200)}` : '')
}

await req('GET /', 'GET', '/', { expect: 200, want: (j) => j.data.name === 'Mickey Mobile API' })
await req('GET /health while db is down', 'GET', '/api/v1/health', {
  expect: 503, want: (j) => j.data.database === 'disconnected' && j.data.integrations.admin === 'enabled',
})
await req('unknown route still 404s when db is down', 'GET', '/api/v1/nope', {
  expect: 404, want: (j) => j.error.code === 'NOT_FOUND',
})
await req('malformed JSON', 'POST', '/api/v1/bookings', {
  expect: 400, raw: '{"name": ', want: (j) => j.error.code === 'MALFORMED_JSON',
})
await req('db route degrades to 503 not 500', 'GET', '/api/v1/catalog/products', {
  expect: 503, want: (j) => j.error.code === 'UNAVAILABLE',
})
await req('site route degrades to 503', 'GET', '/api/v1/site', { expect: 503 })
await req('admin without a token', 'GET', '/api/v1/admin/bookings', {
  expect: 401, want: (j) => j.error.code === 'UNAUTHORIZED',
})
await req('admin with a junk token', 'GET', '/api/v1/admin/me', { expect: 401 })

const cors = await fetch(base + '/api/v1/health', { headers: { Origin: 'http://localhost:5173' } })
ok(cors.headers.get('access-control-allow-origin') === 'http://localhost:5173', 'allowed origin is echoed')
const blocked = await fetch(base + '/api/v1/health', { headers: { Origin: 'https://evil.example' } })
ok(!blocked.headers.get('access-control-allow-origin'), 'unlisted origin gets no CORS header')

const headers = await fetch(base + '/api/v1/health')
ok(!headers.headers.get('x-powered-by'), 'x-powered-by is off')
ok(Boolean(headers.headers.get('ratelimit')), 'rate-limit headers are present')

server.close()
console.log(`\n${fail === 0 ? 'ALL OK' : 'FAILURES'} — ${pass} passed, ${fail} failed\n`)
process.exit(fail === 0 ? 0 : 1)
