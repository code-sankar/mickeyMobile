import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { connectDatabase, disconnectDatabase } from '../config/db.js'
import { Product } from '../models/Product.js'
import { Category } from '../models/Category.js'
import { Brand } from '../models/Brand.js'
import { Issue } from '../models/Issue.js'
import { PartGrade } from '../models/PartGrade.js'
import { Review } from '../models/Review.js'
import { Setting } from '../models/Setting.js'

/**
 * Loads the shop's content into MongoDB.
 *
 * The JSON in `./data` was generated from the frontend's own `src/data/*.js`
 * rather than retyped, so prices, copy and ids are identical to what the site
 * renders today — the API is a move of the source of truth, not a rewrite of
 * the content.
 *
 * Idempotent by default: every collection is upserted by its natural id, so
 * re-running after a price change updates rather than duplicates. `--fresh`
 * drops the content collections first. Neither mode touches bookings,
 * registrations or data requests — customer data is never seed data.
 */

const here = dirname(fileURLToPath(import.meta.url))
const read = (file) => JSON.parse(readFileSync(join(here, 'data', file), 'utf8'))

const fresh = process.argv.includes('--fresh')

/** Upsert a list by its `id`, stamping array position as `order`. */
async function upsertAll(Model, rows, label) {
  const ops = rows.map((row, index) => ({
    updateOne: {
      filter: { id: row.id },
      update: { $set: { ...row, order: index, active: row.active ?? true } },
      upsert: true,
    },
  }))

  const result = await Model.bulkWrite(ops, { ordered: false })
  console.log(
    `  ${label.padEnd(14)} ${String(rows.length).padStart(3)} → ` +
      `${result.upsertedCount} new, ${result.modifiedCount} updated`,
  )
}

async function seed() {
  await connectDatabase()

  if (fresh) {
    console.log('\n[seed] --fresh: dropping content collections (customer data untouched)')
    await Promise.all([
      Product.deleteMany({}),
      Category.deleteMany({}),
      Brand.deleteMany({}),
      Issue.deleteMany({}),
      PartGrade.deleteMany({}),
      Review.deleteMany({}),
      Setting.deleteMany({}),
    ])
  }

  console.log('\n[seed] content')

  const site = read('site.json')
  const students = read('students.json')

  await upsertAll(Category, read('categories.json'), 'categories')
  await upsertAll(Product, read('products.json'), 'products')
  await upsertAll(Brand, read('brands.json'), 'brands')
  await upsertAll(Issue, read('issues.json'), 'issues')
  await upsertAll(PartGrade, read('partsGrades.json'), 'part grades')

  await upsertAll(
    Review,
    // The seeded set is the shop's sample wall, and the site labels it as
    // such. `published` is explicit so a review can be pulled without deleting.
    read('testimonials.json').map((r) => ({ ...r, published: true })),
    'reviews',
  )

  console.log('\n[seed] settings')

  await Setting.put('site', {
    site: site.site,
    sampleRating: site.sampleRating,
    stats: site.stats,
    hours: site.hours,
    navLinks: site.navLinks,
    servicedBrands: site.servicedBrands,
  })
  console.log('  site           ✓')

  await Setting.put('students', students)
  console.log('  students       ✓')

  await Setting.put('process', read('processSteps.json'))
  console.log('  process        ✓')

  await Setting.put('booking-options', {
    timeSlots: site.timeSlots,
    serviceModes: site.serviceModes,
    /**
     * Benches that can run in parallel per slot. Not in the frontend data —
     * the browser had no reason to know it — but the availability endpoint
     * needs a number to compare bookings against. Two is a starting guess the
     * shop should set to its actual bench count.
     */
    slotCapacity: 2,
  })
  console.log('  booking-opts   ✓')

  const counts = await Promise.all([
    Product.countDocuments(),
    Brand.countDocuments(),
    Issue.countDocuments(),
    Review.countDocuments(),
  ])

  const models = (await Brand.find()).reduce((n, b) => n + b.models.length, 0)

  console.log(
    `\n[seed] done — ${counts[0]} products, ${counts[1]} brands (${models} models), ` +
      `${counts[2]} repair types, ${counts[3]} reviews\n`,
  )

  await disconnectDatabase()
}

seed().catch(async (error) => {
  console.error('\n[seed] failed:', error)
  await disconnectDatabase().catch(() => {})
  process.exit(1)
})
