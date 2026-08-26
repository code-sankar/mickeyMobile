import { Outlet, ScrollRestoration } from 'react-router-dom'
import { SiteHeader } from '../components/layout/SiteHeader'
import { SiteFooter } from '../components/layout/SiteFooter'
import { MobileActionBar } from '../components/layout/MobileActionBar'
import { BookingProvider } from './providers/BookingProvider'

/**
 * The shell every route renders inside: fixed header, the route's own content,
 * footer and the mobile action bar. The booking dialog is mounted once here so
 * a CTA on any route drives the same instance.
 */
export function RootLayout() {
  return (
    <BookingProvider>
      <div className="flex min-h-screen flex-col bg-paper-100">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:border-3 focus:border-ink focus:bg-acid focus:px-4 focus:py-2 focus:font-mono focus:text-2xs focus:font-bold focus:uppercase focus:tracking-wider"
        >
          Skip to content
        </a>

        <SiteHeader />

        {/* pt clears the fixed header; pb clears the mobile action bar */}
        <main id="main" className="flex-1 pb-20 pt-16 lg:pb-0 lg:pt-[4.5rem]">
          <Outlet />
        </main>

        <SiteFooter />
        <MobileActionBar />
      </div>

      <ScrollRestoration />
    </BookingProvider>
  )
}
