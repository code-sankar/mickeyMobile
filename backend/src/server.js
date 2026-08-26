import { createApp } from './app.js'
import { env } from './config/env.js'
import { connectDatabase, disconnectDatabase } from './config/db.js'

/**
 * Boot order matters: connect first, listen second.
 *
 * `bufferCommands` is off, so an instance that starts listening before Mongo
 * is reachable would answer its first requests with errors. Better to fail to
 * start — the platform will retry — than to serve a broken instance.
 */
async function start() {
  await connectDatabase()

  const app = createApp()
  const server = app.listen(env.port, () => {
    console.log(`[api] listening on :${env.port}${env.apiPrefix} (${env.nodeEnv})`)
  })

  /** Finish in-flight requests, then close the pool. */
  const shutdown = async (signal) => {
    console.log(`\n[api] ${signal} — shutting down`)

    const force = setTimeout(() => {
      console.error('[api] forced exit after 10s')
      process.exit(1)
    }, 10_000)
    force.unref()

    server.close(async () => {
      await disconnectDatabase()
      clearTimeout(force)
      console.log('[api] closed cleanly')
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  process.on('unhandledRejection', (reason) => {
    console.error('[api] unhandled rejection:', reason)
  })
}

start().catch((error) => {
  console.error('[api] failed to start:', error)
  process.exit(1)
})
