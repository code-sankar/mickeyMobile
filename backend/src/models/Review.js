import mongoose from 'mongoose'

const { Schema } = mongoose

/**
 * A review the shop owns and stores.
 *
 * Only ever the shop's own sample/collected set — Google reviews are proxied
 * live and never written here. The Places terms allow caching a Place ID but
 * not review bodies, ratings or author names, and the reviews service keeps
 * that promise by holding Google responses in memory only.
 */
const ReviewSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    initials: { type: String, default: '', trim: true, maxlength: 3 },
    tone: {
      type: String,
      enum: ['blue', 'emerald', 'violet', 'amber', 'slate'],
      default: 'blue',
    },
    device: { type: String, default: '', trim: true },
    rating: { type: Number, required: true, min: 1, max: 5, index: true },
    /** Human phrasing as shown ("2 weeks ago"), mirroring Google's own field. */
    date: { type: String, default: '', trim: true },
    publishedAt: { type: Date, default: null },
    verified: { type: Boolean, default: false },
    body: { type: String, required: true, trim: true },

    order: { type: Number, default: 0, index: true },
    published: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false, transform: (_d, ret) => { delete ret._id; delete ret.createdAt; delete ret.updatedAt; return ret } },
  },
)

/** Average and 5→1 histogram for the rating summary panel. */
ReviewSchema.statics.summary = async function summary() {
  const [result] = await this.aggregate([
    { $match: { published: true } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        average: { $avg: '$rating' },
        ratings: { $push: '$rating' },
      },
    },
  ])

  if (!result) return { total: 0, average: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const r of result.ratings) distribution[r] = (distribution[r] ?? 0) + 1

  return {
    total: result.total,
    average: Math.round(result.average * 10) / 10,
    distribution,
  }
}

export const Review = mongoose.model('Review', ReviewSchema)
