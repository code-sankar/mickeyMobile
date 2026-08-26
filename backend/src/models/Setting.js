import mongoose from 'mongoose'

const { Schema } = mongoose

/**
 * Singleton content documents, keyed by name.
 *
 * The shop's identity, opening hours, the four process steps, the student
 * offer terms and the bookable slots are all editorial content rather than
 * entities — they have exactly one row each and no relationships. A typed
 * collection per singleton would be five models to maintain for five
 * documents, so they share one keyed collection instead.
 *
 * `value` is `Schema.Types.Mixed` on purpose: these shapes are read straight
 * through to the frontend, which already knows them.
 */
const SettingSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      enum: ['site', 'students', 'process', 'booking-options'],
    },
    value: { type: Schema.Types.Mixed, required: true },
    updatedBy: { type: String, default: 'seed' },
  },
  {
    timestamps: true,
    minimize: false,
    toJSON: { versionKey: false, transform: (_d, ret) => { delete ret._id; return ret } },
  },
)

SettingSchema.statics.get = async function get(key) {
  const doc = await this.findOne({ key }).lean()
  return doc?.value ?? null
}

SettingSchema.statics.put = function put(key, value, updatedBy = 'seed') {
  return this.findOneAndUpdate(
    { key },
    { value, updatedBy },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )
}

export const Setting = mongoose.model('Setting', SettingSchema)
