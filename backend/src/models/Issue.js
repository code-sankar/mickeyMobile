import mongoose from 'mongoose'

const { Schema } = mongoose

/**
 * A repair type the bench offers.
 *
 * `gradable` is the pivot the quote engine turns on: gradable issues take the
 * part-grade multiplier and the grade's warranty, board-level ones (water
 * damage) take the flat price and the issue's own warranty.
 *
 * `icon` is a lucide-react export name, resolved to a component by the
 * frontend — the API stays framework-agnostic.
 */
const IssueSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    short: { type: String, required: true, trim: true },
    icon: { type: String, default: null, trim: true },
    blurb: { type: String, default: '', trim: true },
    turnaround: { type: String, required: true, trim: true },
    sameDay: { type: Boolean, default: false },
    warranty: { type: String, required: true, trim: true },
    gradable: { type: Boolean, default: true },
    symptoms: { type: [String], default: [] },
    includes: { type: [String], default: [] },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false, transform: (_d, ret) => { delete ret._id; delete ret.createdAt; delete ret.updatedAt; return ret } },
  },
)

export const Issue = mongoose.model('Issue', IssueSchema)
