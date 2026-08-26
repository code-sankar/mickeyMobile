import mongoose from 'mongoose'

const { Schema } = mongoose

/**
 * Atomic sequence source.
 *
 * The frontend minted ticket ids with `Math.random()`, which is fine when
 * nothing stores them and a collision is invisible. Once tickets are rows in
 * a database, two customers sharing MM-4821 is a real support problem — so
 * numbers come from a `findOneAndUpdate($inc)`, which is atomic even with
 * several API instances writing at once.
 */
const CounterSchema = new Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { versionKey: false },
)

CounterSchema.statics.next = async function next(name, start = 1000) {
  const doc = await this.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 }, $setOnInsert: {} },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )
  // First allocation lands on `start`; every one after increments from there.
  return start + doc.seq - 1
}

export const Counter = mongoose.model('Counter', CounterSchema)

/** `MM-1000`, `MM-1001`, … — same shape the confirmation screen already prints. */
export async function nextTicketId() {
  const n = await Counter.next('booking-ticket', 1000)
  return `MM-${n}`
}
