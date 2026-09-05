/**
 * authRoutes.js — /api/auth
 * ------------------------------------------------------------------
 * register/login are public; /me requires a valid token.
 * ------------------------------------------------------------------
 */
const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
