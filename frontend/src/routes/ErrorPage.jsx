import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { Compass, PhoneCall } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { site } from '../data/site'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

/**
 * Serves both the 404 route and the router's error boundary, so a bad URL and
 * a thrown loader response land on the same page rather than a blank screen.
 */
export function ErrorPage() {
  const error = useRouteError()
  const notFound = !error || (isRouteErrorResponse(error) && error.status === 404)

  useDocumentTitle(notFound ? 'Page not found' : 'Something went wrong')

  return (
    <div className="grid-paper flex min-h-[70vh] items-center border-b-3 border-ink">
      <div className="container-x py-16 text-center">
        <p className="mx-auto w-fit -rotate-2 border-3 border-ink bg-flare px-4 py-1.5 font-display text-sm uppercase text-paper-50 shadow-brut">
          {notFound ? 'Error 404' : 'Error'}
        </p>

        <h1 className="mx-auto mt-8 max-w-3xl text-balance font-display text-[clamp(2.25rem,9vw,4.5rem)] uppercase leading-[0.88]">
          {notFound ? 'This page is not on the shelf' : 'Something broke on our side'}
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-sm font-medium leading-relaxed text-ink-800 sm:text-base">
          {notFound
            ? 'The link is dead or the product has sold out and moved on. The shop, the estimator and the store details are all still where you left them.'
            : 'Reload the page — and if it keeps happening, call the counter and we will sort it out the old-fashioned way.'}
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button to="/" size="lg">
            <Compass className="h-4 w-4" strokeWidth={2.5} />
            Back to the home page
          </Button>
          <Button to="/shop" variant="paper" size="lg">
            Browse the shop
          </Button>
          <Button href={site.phoneHref} variant="outline" size="lg">
            <PhoneCall className="h-4 w-4" strokeWidth={2.5} />
            Call the store
          </Button>
        </div>

        {import.meta.env.DEV && error ? (
          <pre className="mx-auto mt-10 max-w-2xl overflow-x-auto border-3 border-ink bg-paper-50 p-4 text-left font-mono text-2xs">
            {isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : String(error)}
          </pre>
        ) : null}
      </div>
    </div>
  )
}
