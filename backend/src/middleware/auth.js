/**
 * auth.js
 * ------------------------------------------------------------------
 * protect: verifies the "Authorization: Bearer <token>" JWT on
 * incoming requests, loads the matching User (minus password), and
 * attaches it to req.user. Use on any route that requires login.
 *
 * requireRole(...roles): use after protect() to restrict a route to
 * specific roles, e.g. requireRole('admin').
 * ------------------------------------------------------------------
 */
const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const User = require('../models/User');
const { jwtSecret } = require('../config/env');

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, user no longer exists');
    }
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized, token invalid or expired');
  }
});

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error('Forbidden: insufficient permissions');
  }
  next();
};

module.exports = { protect, requireRole };
