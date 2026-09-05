/**
 * asyncHandler.js
 * ------------------------------------------------------------------
 * Wraps an async Express route handler so any thrown/rejected error
 * is forwarded to next() instead of crashing the process. Avoids
 * repeating try/catch in every controller function.
 * Usage: router.get('/', asyncHandler(controllerFn))
 * ------------------------------------------------------------------
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
