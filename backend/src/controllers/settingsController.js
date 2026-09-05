/**
 * settingsController.js
 * ------------------------------------------------------------------
 * Reads/updates the single business Settings document (branding, GST
 * toggle & default rate) and handles the business logo upload.
 * ------------------------------------------------------------------
 */
const asyncHandler = require('../middleware/asyncHandler');
const Settings = require('../models/Settings');
const { ok } = require('../utils/apiResponse');

// GET /api/settings
const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  ok(res, settings);
});

// PUT /api/settings
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  const { businessName, abn, bizEmail, gstEnabled, gstRate } = req.body;

  if (businessName !== undefined) settings.businessName = businessName;
  if (abn !== undefined) settings.abn = abn;
  if (bizEmail !== undefined) settings.bizEmail = bizEmail;
  if (gstEnabled !== undefined) settings.gstEnabled = gstEnabled;
  if (gstRate !== undefined) settings.gstRate = gstRate;

  await settings.save();
  ok(res, settings);
});

// POST /api/settings/logo  (multipart/form-data, field name "logo")
const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No logo file uploaded');
  }
  const settings = await Settings.getSingleton();
  settings.logoUrl = `/uploads/${req.file.filename}`;
  await settings.save();
  ok(res, settings);
});

module.exports = { getSettings, updateSettings, uploadLogo };
