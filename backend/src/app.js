/**
 * app.js
 * ------------------------------------------------------------------
 * Builds and configures the Express app (middleware + routes) but
 * does NOT start listening — that's server.js's job. Splitting these
 * two lets tests import the app without opening a real port.
 * ------------------------------------------------------------------
 */
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { nodeEnv, clientOrigins, uploadDir } = require('./config/env');
const apiRoutes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const { startCronJobs } = require('./src/services/cronService');
const app = express();

app.use(helmet({ crossOriginResourcePolicy: false })); // allow serving /uploads images cross-origin
app.use(cors({ origin: clientOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (nodeEnv !== 'test') app.use(morgan(nodeEnv === 'development' ? 'dev' : 'combined'));

// Serves uploaded receipt/logo photos, e.g. GET /uploads/16999-abc.jpg
app.use('/uploads', express.static(path.join(__dirname, '..', uploadDir)));

app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));
app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
