/**
 * reportRoutes.js — /api/report
 * ------------------------------------------------------------------
 */
const express = require('express');
const { getBusinessReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.get('/', protect, getBusinessReport);

module.exports = router;
