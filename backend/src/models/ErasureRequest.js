import mongoose from 'mongoose'

const { Schema } = mongoose

/**
 * A request to see, correct or delete what the shop holds.
 *
 * The students page states this right in plain words ("Message or email the
 * shop at any time to see, correct or delete what is held"). A promise with no
 * mechanism behind it is just copy, so this is the mechanism: the request is
 * logged, worked and closed, and the log survives the erasure it records.
 *
 * Only the contact details needed to find and answer the request are kept —
 * erasing the subject's data must not require keeping a copy of it.
 */
const ErasureRequestSchema = new Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    kind: { type: String, enum: ['access', 'correction', 'erasure'], required: true },

    /** How the subject identified themselves; matched against registrations/bookings. */
    phone: { type: String, default: null, trim: true, index: true },
    email: { type: String, default: null, trim: true, lowercase: true, index: true },
    note: { type: String, default: '', trim: true, maxlength: 1000 },

    status: {
      type: String,
      enum: ['open', 'in-progress', 'completed', 'rejected'],
      default: 'open',
      index: true,
    },
    /** What was actually done, for the audit trail — counts, never content. */
    outcome: {
      registrationsAffected: { type: Number, default: 0 },
      bookingsAffected: { type: Number, default: 0 },
      note: { type: String, default: '' },
    },
    completedAt: { type: Date, default: null },
    handledBy: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false, transform: (_d, ret) => { delete ret._id; return ret } },
  },
)

export const ErasureRequest = mongoose.model('ErasureRequest', ErasureRequestSchema)
