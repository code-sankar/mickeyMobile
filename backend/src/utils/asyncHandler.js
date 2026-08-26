/**
 * Express 5 forwards rejected promises to the error handler on its own, so
 * this exists only to keep intent explicit at the route definition and to
 * stay correct if a handler is ever mounted on an Express 4 router.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)
