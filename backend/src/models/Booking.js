import mongoose from 'mongoose'

const { Schema } = mongoose

/**
 * The quote as it stood when the slot was booked.
 *
 * Snapshotted, not referenced: a price list edit next month must not silently
 * rewrite what a customer was quoted today. The counter honours this object.
 */
const QuoteSnapshotSchema = new Schema(
  {
    brandId: String,
    brandName: String,
    modelId: String,
    modelName: String,
    issueId: String,
    issueName: String,
    issueShort: String,
    gradeId: String,
    gradeLabel: String,
    price: Number,
    low: Number,
    turnaround: String,
    warranty: String,
  },
  { _id: false },
)

/**
 * The four bench stages come straight from `data/process.js`, wrapped in the
 * booking lifecycle either side of them. The frontend's ProcessTimeline can
 * render a live ticket against the same four ids it already knows.
 */
export const BOOKING_STATUSES = [
  'pending', // submitted on the site, not yet confirmed by the shop
  'confirmed', // slot locked, customer told
  'diagnosis', // 01 — free 42-point bench test
  'approval', // 02 — fixed quote sitting with the customer
  'repair', // 03 — on the bench
  'qc', // 04 — full re-test
  'ready', // waiting at the counter
  'collected', // closed, happily
  'cancelled',
  'no-show',
]

/** Stages that mean the ticket is finished — used to keep the queue view honest. */
export const CLOSED_STATUSES = ['collected', 'cancelled', 'no-show']

const BookingSchema = new Schema(
  {
    /** Customer-facing reference, e.g. MM-1042. Unique, allocated by a counter. */
    ticket: { type: String, required: true, unique: true, index: true },

    name: { type: String, required: true, trim: true },
    /** Normalised to 10 digits on the way in, so lookups match regardless of formatting. */
    phone: { type: String, required: true, trim: true, index: true },

    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/, index: true },
    slot: { type: String, required: true, trim: true },
    mode: { type: String, required: true, enum: ['walkin', 'dropoff', 'pickup'] },
    notes: { type: String, default: '', trim: true, maxlength: 1000 },

    quote: { type: QuoteSnapshotSchema, default: null },

    status: { type: String, enum: BOOKING_STATUSES, default: 'pending', index: true },
    statusHistory: {
      type: [
        {
          status: { type: String, enum: BOOKING_STATUSES },
          at: { type: Date, default: Date.now },
          by: { type: String, default: 'system' },
          note: { type: String, default: '' },
        },
      ],
      default: [],
    },

    /** "No work starts without your approval" — recorded, not just claimed. */
    policyAcceptedAt: { type: Date, default: Date.now },

    source: { type: String, default: 'web', enum: ['web', 'whatsapp', 'walkin', 'phone'] },
    /** Kept for abuse triage only; cleared when a ticket closes. */
    submittedIp: { type: String, default: null, select: false },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false, transform: (_d, ret) => { delete ret._id; delete ret.submittedIp; return ret } },
  },
)

BookingSchema.index({ date: 1, slot: 1 })
BookingSchema.index({ status: 1, createdAt: -1 })
BookingSchema.index({ ticket: 1, phone: 1 })

export const Booking = mongoose.model('Booking', BookingSchema)
