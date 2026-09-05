/**
 * server.js
 * ------------------------------------------------------------------
 * Entry point: connect to MongoDB, then start the HTTP server.
 * Run with: npm run dev  (nodemon)  or  npm start  (node)
 * ------------------------------------------------------------------
 */
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { port } = require('./src/config/env');

connectDB().then(() => {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Get Handyman API listening on port ${port}`);
  });
});
