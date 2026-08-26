import mongoose from 'mongoose'

const { Schema } = mongoose

/**
 * Per-issue walk-in price for one model, keyed by issue id
 * (`{ screen: 24900, battery: 6500, … }`).
 *
 * A Map keeps the shape the estimator already reads and means adding a
 * seventh repair type does not need a schema migration. `of: Number` still
 * type-checks every value.
 */
const ModelSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    display: { type: String, default: '', trim: true },
    prices: {
      type: Map,
      of: Number,
      required: true,
      default: () => new Map(),
    },
    active: { type: Boolean, default: true },
  },
  { _id: false },
)

/** A serviced manufacturer and every handset of theirs the bench supports. */
const BrandSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    accent: { type: String, default: '#93C5FD', trim: true },
    blurb: { type: String, default: '', trim: true },
    models: { type: [ModelSchema], default: [] },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false, transform: serialize },
    toObject: { versionKey: false, transform: serialize },
  },
)

/** Maps serialise as objects, matching the plain `prices` object the UI reads. */
function serialize(_doc, ret) {
  delete ret._id
  delete ret.createdAt
  delete ret.updatedAt
  if (Array.isArray(ret.models)) {
    ret.models = ret.models.map((m) => ({
      ...m,
      prices: m.prices instanceof Map ? Object.fromEntries(m.prices) : m.prices,
    }))
  }
  return ret
}

export const Brand = mongoose.model('Brand', BrandSchema)
