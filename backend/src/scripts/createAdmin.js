import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { connectDatabase, disconnectDatabase } from '../config/db.js'
import { AdminUser } from '../models/AdminUser.js'

/**
 * Creates a counter login.
 *
 * Interactive rather than seeded, so a password never ends up in the repo, in
 * a shell history file, or in the seed data that gets shared around. Run it
 * once per person who needs access.
 *
 *   npm run create-admin
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

async function main() {
  const rl = createInterface({ input: stdin, output: stdout })

  try {
    await connectDatabase()

    const email = (await rl.question('Email: ')).trim().toLowerCase()
    if (!EMAIL.test(email)) throw new Error('That is not an email address')

    const existing = await AdminUser.findOne({ email })
    if (existing) throw new Error(`${email} already has an account`)

    const name = (await rl.question('Name: ')).trim()
    if (name.length < 2) throw new Error('Name is required')

    const role = (await rl.question('Role [staff/owner] (staff): ')).trim() || 'staff'
    if (!['staff', 'owner'].includes(role)) throw new Error('Role must be staff or owner')

    const password = await rl.question('Password (min 12 chars): ')
    if (password.length < 12) throw new Error('Use at least 12 characters')

    const confirm = await rl.question('Confirm password: ')
    if (password !== confirm) throw new Error('Passwords do not match')

    const user = await AdminUser.create({
      email,
      name,
      role,
      passwordHash: await AdminUser.hashPassword(password),
    })

    console.log(`\n✓ Created ${user.email} (${user.role})\n`)
  } finally {
    rl.close()
    await disconnectDatabase().catch(() => {})
  }
}

main().catch((error) => {
  console.error(`\n✗ ${error.message}\n`)
  process.exit(1)
})
