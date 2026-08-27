import { Component } from 'react'
import { site } from '../data/site'

/**
 * The last line of defence.
 *
 * React Router's `errorElement` already catches anything thrown inside a
 * route, which is almost everything. This sits above the router and catches
 * the rest: a failure in `RouterProvider` itself, or in a lazy chunk that
 * cannot be fetched after a redeploy replaced the file the open tab was
 * holding a URL for.
 *
 * That last case is the common one in production. A visitor with the page open
 * during a deploy navigates, the old chunk is gone, and without this they get
 * a blank white page. Reloading fixes it — so this says so, and offers the
 * button.
 *
 * Deliberately plain markup and inline styles: whatever broke may have been
 * the stylesheet or the design system itself, and a fallback that depends on
 * the thing that failed is not a fallback.
 */
export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[app] unrecoverable render error:', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    // A missing chunk is a stale tab against a new deploy, not a broken app.
    const isStaleChunk = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
      this.state.error?.message ?? '',
    )

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '2rem 1.25rem',
          background: '#FBF6E9',
          color: '#141210',
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
        }}
      >
        <div style={{ maxWidth: '32rem', textAlign: 'center' }}>
          <p
            style={{
              display: 'inline-block',
              border: '3px solid #141210',
              background: '#FF4A1C',
              color: '#FBF6E9',
              padding: '0.35rem 0.9rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontSize: '0.8rem',
            }}
          >
            {isStaleChunk ? 'New version available' : 'Something broke'}
          </p>

          <h1
            style={{
              margin: '1.5rem 0 0',
              fontSize: 'clamp(1.75rem, 6vw, 2.75rem)',
              lineHeight: 1.05,
              textTransform: 'uppercase',
              fontWeight: 900,
            }}
          >
            {isStaleChunk ? 'Reload to continue' : 'This page did not load'}
          </h1>

          <p style={{ margin: '1.25rem 0 0', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {isStaleChunk
              ? 'We shipped an update while you had this open. A reload picks it up — nothing is wrong with your device.'
              : `Reload the page. If it keeps happening, call the counter on ${site.phoneDisplay} and we will sort it out the old-fashioned way.`}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              border: '3px solid #141210',
              background: '#2B44FF',
              color: '#FBF6E9',
              padding: '0.9rem 1.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '4px 4px 0 #141210',
            }}
          >
            Reload the page
          </button>
        </div>
      </div>
    )
  }
}
