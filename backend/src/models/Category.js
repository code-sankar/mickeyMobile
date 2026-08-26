import mongoose from 'mongoose'

const { Schema } = mongoose

/**
 * Shop categories, including the synthetic `all` bucket the toolbar renders
 * first. Stored rather than hardcoded so adding a fourth accessory shelf is a
 * seed change, not a deploy.
 */
const CategorySchema = new Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    order: { type: Number, default: 0, index: true },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false, transform: (_d, ret) => { delete ret._id; delete ret.createdAt; delete ret.updatedAt; return ret } },
  },
)

export const Category = mongoose.model('Category', CategorySchema)
