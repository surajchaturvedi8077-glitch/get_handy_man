/**
 * authController.js
 * ------------------------------------------------------------------
 * Login/register/me for worker accounts. Registration is deliberately
 * simple (no email verification) since this is an internal worker
 * tool, not a public sign-up flow.
 * ------------------------------------------------------------------
 */
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { ok, created } = require('../utils/apiResponse');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }
  const user = await User.create({ name, email, password, role });
  created(res, {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  ok(res, {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  ok(res, req.user);
});

module.exports = { register, login, getMe };
