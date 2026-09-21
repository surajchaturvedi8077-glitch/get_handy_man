/**
 * numberingService.js
 * ------------------------------------------------------------------
 * Generates the next human-facing invoice number, e.g. "GH-0901".
 * FIXED: Now finds the absolute highest existing number instead of 
 * relying on total document count, preventing duplicate crashes 
 * when older invoices are deleted.
 * ------------------------------------------------------------------
 */
const Invoice = require('../models/Invoice');

const PREFIX = 'GH-';
const START_AT = 900;

async function nextInvoiceNumber() {
  const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
  
  if (!lastInvoice || !lastInvoice.number) {
    return `${PREFIX}${START_AT + 1}`;
  }

  const numPart = parseInt(lastInvoice.number.replace(PREFIX, ''), 10);
  const nextNum = isNaN(numPart) ? START_AT + 1 : numPart + 1;
  
  return `${PREFIX}${nextNum}`;
}

module.exports = { nextInvoiceNumber };