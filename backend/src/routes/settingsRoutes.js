/**
 * settingsRoutes.js — /api/settings
 * ------------------------------------------------------------------
 * All settings routes require a logged-in user.
 * ------------------------------------------------------------------
 */
const express = require('express');
const { getSettings, updateSettings, uploadLogo } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);
router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/logo', upload.single('logo'), uploadLogo);

module.exports = router;
