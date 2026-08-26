import mongoose from 'mongoose'

const { Schema } = mongoose

/**
 * The part quality a customer can toggle between on a gradable repair.
 * `multiplier` is applied to the model's OEM rate — 1 for genuine, 0.68 for
 * tier-1 aftermarket — and `warrantyDays` is what the ticket promises.
 */
const PartGradeSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    multiplier: { type: Number, required: true, min: 0, max: 5 },
    warrantyDays: { type: Number, required: true, min: 0 },
    note: { type: String, default: '', trim: true },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false, transform: (_d, ret) => { delete ret._id; delete ret.createdAt; delete ret.updatedAt; return ret } },
  },
)

export const PartGrade = mongoose.model('PartGrade', PartGradeSchema)
