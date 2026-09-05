/**
 * errorHandler.js
 * ------------------------------------------------------------------
 * Central Express error handler (4-arg middleware). Mount this LAST,
 * after all routes. Normalizes Mongoose validation/cast errors and
 * returns a consistent { success:false, message, errors? } body.
 * ------------------------------------------------------------------
 */
const { nodeEnv } = require('../config/env');

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Server error';
  let errors;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => e.message);
    message = 'Validation failed';
  }
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  if (err.code === 11000) {
    statusCode = 409;
    message = `Duplicate value for ${Object.keys(err.keyValue).join(', ')}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(nodeEnv === 'development' ? { stack: err.stack } : {}),
  });
}

module.exports = errorHandler;
