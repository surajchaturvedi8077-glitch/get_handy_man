const asyncHandler = require('../middleware/asyncHandler');
const Settings = require('../models/Settings');
const { buildBusinessReport } = require('../services/reportService');
const { ok } = require('../utils/apiResponse');

const getBusinessReport = asyncHandler(async (req, res) => {
  const { start, end } = req.query;
  const settings = await Settings.getSingleton();
  const report = await buildBusinessReport(settings.gstRate, start, end);
  ok(res, report);
});

module.exports = { getBusinessReport };