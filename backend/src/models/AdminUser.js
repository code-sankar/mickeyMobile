import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const { Schema } = mongoose

/**
 * Counter staff who can see bookings and registrations.
 *
 * Small and deliberately boring: a shop with three employees does not need
 * roles beyond "can this person move a ticket" and "can this person delete a
 * customer's data".
 */
const AdminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    /** Never selected by default — a stray `.find()` cannot leak hashes. */
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['staff', 'owner'], default: 'staff' },
    active: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false, transform: (_d, ret) => { delete ret.passwordHash; return ret } },
  },
)

AdminUserSchema.statics.hashPassword = (plain) => bcrypt.hash(plain, 12)

AdminUserSchema.methods.verifyPassword = function verifyPassword(plain) {
  return bcrypt.compare(plain, this.passwordHash)
}

export const AdminUser = mongoose.model('AdminUser', AdminUserSchema)
