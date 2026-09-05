/**
 * generateToken.js
 * ------------------------------------------------------------------
 * Signs a JWT for a given user id. Used by authController after a
 * successful login/register.
 * ------------------------------------------------------------------
 */
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

function generateToken(userId) {
  return jwt.sign({ id: userId }, jwtSecret, { expiresIn: jwtExpiresIn });
}

module.exports = generateToken;
