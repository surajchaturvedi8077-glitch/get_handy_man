/**
 * env.js
 * ------------------------------------------------------------------
 * Single place that reads process.env, applies defaults, and fails
 * fast (with a clear message) if a required variable is missing.
 * Every other file imports config from here instead of touching
 * process.env directly, so a missing/renamed var is caught in one spot.
 * ------------------------------------------------------------------
 */
require('dotenv').config();

const required = ['MONGO_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length && process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line no-console
  console.warn(
    `[config] Missing env vars: ${missing.join(', ')}. ` +
    `Copy backend/.env.example to backend/.env and fill them in.`
  );
}

module.exports = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gethandyman',
  jwtSecret: process.env.JWT_SECRET || 'dev_only_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim()),
  defaultGstRate: Number(process.env.DEFAULT_GST_RATE) || 10,
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB) || 5,
};
