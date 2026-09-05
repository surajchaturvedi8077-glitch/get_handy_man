/**
 * apiResponse.js
 * ------------------------------------------------------------------
 * Tiny helpers so every controller returns JSON in the same shape:
 * { success: true, data } or { success: true, data, meta }.
 * Keeps the frontend's axios client able to assume one response shape.
 * ------------------------------------------------------------------
 */
const ok = (res, data, meta) =>
  res.status(200).json({ success: true, data, ...(meta ? { meta } : {}) });

const created = (res, data) => res.status(201).json({ success: true, data });

module.exports = { ok, created };
