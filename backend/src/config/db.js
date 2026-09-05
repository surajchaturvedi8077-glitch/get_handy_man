/**
 * db.js
 * ------------------------------------------------------------------
 * Opens the single MongoDB connection for the app via Mongoose.
 * Call connectDB() once from server.js at startup.
 * ------------------------------------------------------------------
 */
const mongoose = require('mongoose');
const { mongoUri } = require('./env');

async function connectDB() {
  mongoose.set('strictQuery', true);
  try {
    const conn = await mongoose.connect(mongoUri);
    // eslint-disable-next-line no-console
    console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[db] MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
