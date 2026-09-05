/**
 * numberingService.js
 * ------------------------------------------------------------------
 * Generates the next human-facing invoice number, e.g. "GH-0901".
 * Uses the current invoice count so numbers are sequential; fine for
 * a single-business app. For multi-tenant use, scope the count query
 * by business/workspace id.
 * ------------------------------------------------------------------
 */
const Invoice = require('../models/Invoice');

const PREFIX = 'GH-';
const START_AT = 900;

async function nextInvoiceNumber() {
  const count = await Invoice.countDocuments();
  return `${PREFIX}${START_AT + count + 1}`;
}

module.exports = { nextInvoiceNumber };
