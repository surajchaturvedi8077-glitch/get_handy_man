/**
 * routes/index.js
 * ------------------------------------------------------------------
 * Mounts every resource's router under /api/<resource>. server.js
 * only needs to know about this one file.
 * ------------------------------------------------------------------
 */
const express = require('express');

const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/settings', require('./settingsRoutes'));
router.use('/enquiries', require('./enquiryRoutes'));
router.use('/jobs', require('./jobRoutes'));
router.use('/invoices', require('./invoiceRoutes'));
router.use('/report', require('./reportRoutes'));
router.use('/customers', require('./customerRoutes'));

module.exports = router;
