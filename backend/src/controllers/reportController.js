/**
 * reportController.js
 * ------------------------------------------------------------------
 * Serves the business Report (Reported income, Cash Bonus, GST on
 * material, Reportable GST, expenses, profit). All the maths lives in
 * services/reportService.js — this file just wires it to a route.
 * ------------------------------------------------------------------
 */
const asyncHandler = require('../middleware/asyncHandler');
const Settings = require('../models/Settings');
const { buildBusinessReport } = require('../services/reportService');
const { ok } = require('../utils/apiResponse');

// GET /api/report
const getBusinessReport = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  const report = await buildBusinessReport(settings.gstRate);
  ok(res, report);
});

module.exports = { getBusinessReport };
