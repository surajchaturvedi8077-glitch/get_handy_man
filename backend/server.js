/**
 * server.js
 * ------------------------------------------------------------------
 * Entry point: start HTTP server immediately, then connect to MongoDB.
 * ------------------------------------------------------------------
 */
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { port } = require('./src/config/env');
const { startCronJobs } = require('./src/services/cronService');

// 1. Connect to DB in the background
connectDB().catch(err => {
  console.error('[server] MongoDB connection error:', err);
});

startCronJobs();
// 2. Start listening IMMEDIATELY so Hostinger is happy
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] Get Handyman API listening on port ${port}`);
});