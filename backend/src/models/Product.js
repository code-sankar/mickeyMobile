import mongoose from 'mongoose'

const { Schema } = mongoose

const SpecSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false },
)

/**
 * A catalogue item — handsets (new and refurbished) and accessories share one
 * collection because the shop merchandises them together and `kind`
 * distinguishes them where it matters.
 *
 * `tone` maps to a fixed palette in the frontend's ProductCard, so Tailwind
 * can statically extract every class name. It stays an enum for that reason.
 */
const ProductSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    brand: { type: String, required: true, trim: true, index: true },
    category: {
      type: String,
      required: true,
      enum: ['new', 'refurb', 'cases', 'chargers', 'audio'],
      index: true,
    },
    kind: { type: String, required: true, enum: ['phone', 'case', 'charger', 'audio'] },
    tone: {
      type: String,
      required: true,
      enum: ['blue', 'emerald', 'violet', 'amber', 'slate', 'rose', 'lime', 'grape'],
    },

    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0, default: null },
    badge: { type: String, default: null, trim: true },

    stock: { type: String, enum: ['in', 'low', 'out'], default: 'in', index: true },
    stockNote: { type: String, default: '', trim: true },

    blurb: { type: String, default: '', trim: true },
    specs: { type: [SpecSchema], default: [] },
    fullSpecs: { type: [SpecSchema], default: [] },
    inBox: { type: [String], default: [] },
    warranty: { type: String, default: '', trim: true },

    /** Curated position — what `sort=featured` preserves. */
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false, transform: stripInternal },
    toObject: { virtuals: true, versionKey: false, transform: stripInternal },
  },
)

function stripInternal(_doc, ret) {
  delete ret._id
  delete ret.createdAt
  delete ret.updatedAt
  return ret
}

/** Savings off MRP, derived rather than stored so the two can never drift. */
ProductSchema.virtual('savingsPct').get(function savingsPct() {
  if (!this.mrp || this.mrp <= this.price) return 0
  return Math.round(((this.mrp - this.price) / this.mrp) * 100)
})

/** Backs the `q=` free-text filter across name, brand, subtitle and blurb. */
ProductSchema.index(
  { name: 'text', brand: 'text', subtitle: 'text', blurb: 'text' },
  { name: 'product_search', weights: { name: 10, brand: 5, subtitle: 3, blurb: 1 } },
)
ProductSchema.index({ category: 1, price: 1 })

export const Product = mongoose.model('Product', ProductSchema)
