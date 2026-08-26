import mongoose from 'mongoose'

const { Schema } = mongoose

/**
 * A consent, recorded as it was actually given.
 *
 * The label text is stored alongside the boolean because "they ticked a box"
 * is not a record — what the box *said* at the time is. If the wording of the
 * offer changes next quarter, every existing registration still carries proof
 * of the terms its owner agreed to.
 */
const ConsentSchema = new Schema(
  {
    granted: { type: Boolean, required: true },
    label: { type: String, required: true },
    at: { type: Date, default: Date.now },
    /** Set when a marketing consent is later withdrawn, never by deleting the record. */
    withdrawnAt: { type: Date, default: null },
  },
  { _id: false },
)

/**
 * A student registered for the repair discount.
 *
 * Note what is *not* here: the student ID card photo. The privacy notice
 * promises "checked and then deleted — never uploaded to this website", so
 * there is no field for it and no endpoint that would accept one. Verification
 * happens at the counter, which is what the page tells the visitor.
 *
 * `dob` is stored rather than a computed age so the 18+ gate can be re-checked
 * rather than trusted, and it is the minimum needed to do that.
 */
const StudentRegistrationSchema = new Schema(
  {
    registrationId: { type: String, required: true, unique: true, index: true },

    name: { type: String, required: true, trim: true },
    dob: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    institution: { type: String, required: true, trim: true },

    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    address: { type: String, required: true, trim: true },

    device: {
      brand: { type: String, required: true, trim: true },
      model: { type: String, required: true, trim: true },
      age: {
        type: String,
        required: true,
        enum: ['under-1', '1-2', '2-3', 'over-3'],
      },
      issue: { type: String, default: '', trim: true, maxlength: 1000 },
    },

    consent: {
      verification: { type: ConsentSchema, required: true },
      marketing: { type: ConsentSchema, default: null },
    },

    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'expired'],
      default: 'pending',
      index: true,
    },
    /** Set at the counter once a physical ID card has been sighted. */
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: String, default: null },
    rejectionReason: { type: String, default: null },

    source: { type: String, default: 'web', enum: ['web', 'whatsapp', 'counter'] },
    submittedIp: { type: String, default: null, select: false },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false, transform: (_d, ret) => { delete ret._id; delete ret.submittedIp; return ret } },
  },
)

/** One live registration per phone number — re-registering updates, not duplicates. */
StudentRegistrationSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'verified'] } } },
)
StudentRegistrationSchema.index({ status: 1, createdAt: -1 })

/** Marketing reach: opted in, still opted in, and verified. */
StudentRegistrationSchema.statics.marketingAudience = function marketingAudience() {
  return this.find({
    status: 'verified',
    'consent.marketing.granted': true,
    'consent.marketing.withdrawnAt': null,
  })
}

export const StudentRegistration = mongoose.model(
  'StudentRegistration',
  StudentRegistrationSchema,
)
