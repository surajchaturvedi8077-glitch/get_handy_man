/**
 * notFound.js
 * ------------------------------------------------------------------
 * Catches any request that didn't match a route and forwards a 404
 * error into errorHandler.js, so unknown routes get a clean JSON
 * response instead of Express's default HTML error page.
 * ------------------------------------------------------------------
 */
function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
}

module.exports = notFound;
