import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from './RootLayout'
import { HomePage } from '../routes/HomePage'
import { ErrorPage } from '../routes/ErrorPage'
import { getProduct } from '../data/selectors'

/**
 * Route table.
 *
 * The home page ships in the main bundle because it is the entry point for
 * almost every visit; every other route is a lazy chunk fetched on navigation,
 * so the catalogue's 21 products and the estimator's price tables are not paid
 * for by someone who only wanted the address.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'repairs',
        lazy: async () => ({ Component: (await import('../routes/RepairsPage')).RepairsPage }),
      },
      {
        path: 'accessories',
        lazy: async () => ({ Component: (await import('../routes/AccessoriesPage')).AccessoriesPage }),
      },
      {
        path: 'shop',
        lazy: async () => ({ Component: (await import('../routes/ShopPage')).ShopPage }),
      },
      {
        path: 'shop/:productId',
        // Resolving the product in a loader means an unknown id renders the
        // 404 page rather than a half-empty product page.
        loader: ({ params }) => {
          const product = getProduct(params.productId)
          if (!product) throw new Response('Product not found', { status: 404 })
          return { product }
        },
        lazy: async () => ({ Component: (await import('../routes/ProductPage')).ProductPage }),
      },
      {
        path: 'students',
        lazy: async () => ({ Component: (await import('../routes/StudentsPage')).StudentsPage }),
      },
      {
        path: 'reviews',
        lazy: async () => ({ Component: (await import('../routes/ReviewsPage')).ReviewsPage }),
      },
      {
        path: 'visit',
        lazy: async () => ({ Component: (await import('../routes/VisitPage')).VisitPage }),
      },
      { path: '*', element: <ErrorPage /> },
    ],
  },
])
