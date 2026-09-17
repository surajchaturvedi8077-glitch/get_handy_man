const asyncHandler = require('../middleware/asyncHandler');
const Settings = require('../models/Settings');
const { ok } = require('../utils/apiResponse');

const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  ok(res, settings);
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  
  // Update every field dynamically if it is provided
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      settings[key] = req.body[key];
    }
  });

  await settings.save();
  ok(res, settings);
});

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