import mongoose from 'mongoose'
import { env } from './env.js'

/**
 * MongoDB Atlas connection.
 *
 * `bufferCommands: false` makes a query issued before the connection is up
 * fail fast instead of hanging for 10 seconds — a dropped Atlas connection
 * should surface as a 503, not a stalled request.
 */
export async function connectDatabase() {
  mongoose.set('strictQuery', true)
  mongoose.set('bufferCommands', false)

  mongoose.connection.on('connected', () => {
    console.log(`[db] connected to ${env.mongoDbName}`)
  })
  mongoose.connection.on('error', (error) => {
    console.error('[db] connection error:', error.message)
  })
  mongoose.connection.on('disconnected', () => {
    console.warn('[db] disconnected')
  })

  await mongoose.connect(env.mongoUri, {
    dbName: env.mongoDbName,
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    maxPoolSize: 10,
    retryWrites: true,
  })

  return mongoose.connection
}

export async function disconnectDatabase() {
  await mongoose.connection.close()
}

export const isDatabaseReady = () => mongoose.connection.readyState === 1
