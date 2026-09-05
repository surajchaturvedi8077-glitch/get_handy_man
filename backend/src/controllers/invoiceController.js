/**
 * invoiceController.js
 * ------------------------------------------------------------------
 * CRUD for invoices, plus the small focused actions the invoice
 * screen needs: line items, discount, GST toggle, payment mode/status,
 * and cost items (materials / other expenses) with receipt photos.
 * Totals are always computed on read via gstService — never stored,
 * so they can't go stale if items/discount/GST change.
 * ------------------------------------------------------------------
 */
const asyncHandler = require('../middleware/asyncHandler');
const Invoice = require('../models/Invoice');
const Settings = require('../models/Settings');
const { calcInvoiceTotals, calcCostTotals } = require('../services/gstService');
const { ok, created } = require('../utils/apiResponse');

// Attaches computed .totals and .costTotals to a plain invoice object for API responses.
async function withTotals(invoiceDoc) {
  const settings = await Settings.getSingleton();
  const inv = invoiceDoc.toObject ? invoiceDoc.toObject() : invoiceDoc;
  return {
    ...inv,
    totals: calcInvoiceTotals(inv.items, inv.discount, inv.gstIncluded, settings.gstRate),
    costTotals: calcCostTotals(inv.costs),
  };
}

// GET /api/invoices?status=unpaid
const listInvoices = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status && status !== 'all' ? { status } : {};
  const invoices = await Invoice.find(filter).sort({ date: -1 });
  const settings = await Settings.getSingleton();
  const withCalc = invoices.map((inv) => ({
    ...inv.toObject(),
    totals: calcInvoiceTotals(inv.items, inv.discount, inv.gstIncluded, settings.gstRate),
  }));
  ok(res, withCalc);
});

// GET /api/invoices/:id
const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }
  ok(res, await withTotals(invoice));
});

// POST /api/invoices  (manual invoice creation, without a job)
const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.create(req.body);
  created(res, await withTotals(invoice));
});

// PUT /api/invoices/:id  (generic field update: items, customer, dates...)
const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }
  ok(res, await withTotals(invoice));
});

// DELETE /api/invoices/:id
const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findByIdAndDelete(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }
  ok(res, { deleted: true });
});

// PUT /api/invoices/:id/discount  { type, value }
const setDiscount = asyncHandler(async (req, res) => {
  const invoice = await findInvoiceOr404(res, req.params.id);
  invoice.discount = { type: req.body.type, value: req.body.value };
  await invoice.save();
  ok(res, await withTotals(invoice));
});

// PUT /api/invoices/:id/gst  { gstIncluded: boolean }
const setGstIncluded = asyncHandler(async (req, res) => {
  const invoice = await findInvoiceOr404(res, req.params.id);
  invoice.gstIncluded = !!req.body.gstIncluded;
  await invoice.save();
  ok(res, await withTotals(invoice));
});

// PUT /api/invoices/:id/payment-mode  { paymentMode: 'online'|'cash' }
const setPaymentMode = asyncHandler(async (req, res) => {
  const invoice = await findInvoiceOr404(res, req.params.id);
  invoice.paymentMode = req.body.paymentMode;
  await invoice.save();
  ok(res, await withTotals(invoice));
});

// PUT /api/invoices/:id/status  { status: 'paid'|'unpaid' }
const setStatus = asyncHandler(async (req, res) => {
  const invoice = await findInvoiceOr404(res, req.params.id);
  invoice.status = req.body.status;
  await invoice.save();
  ok(res, await withTotals(invoice));
});

// PUT /api/invoices/:id/cost-items/:kind  { items: [{name, cost, photoUrl}] }
// kind is 'materials' or 'other'. Full-list replace keeps the frontend simple
// (it edits the array locally, then saves).
const setCostItems = asyncHandler(async (req, res) => {
  const { kind } = req.params;
  if (!['materials', 'other'].includes(kind)) {
    res.status(400);
    throw new Error('kind must be "materials" or "other"');
  }
  const invoice = await findInvoiceOr404(res, req.params.id);
  invoice.costs[kind] = req.body.items || [];
  await invoice.save();
  ok(res, await withTotals(invoice));
});

// POST /api/invoices/:id/cost-items/:kind/:index/photo  (multipart, field "photo")
const uploadCostItemPhoto = asyncHandler(async (req, res) => {
  const { kind, index } = req.params;
  if (!['materials', 'other'].includes(kind)) {
    res.status(400);
    throw new Error('kind must be "materials" or "other"');
  }
  if (!req.file) {
    res.status(400);
    throw new Error('No photo uploaded');
  }
  const invoice = await findInvoiceOr404(res, req.params.id);
  const item = invoice.costs[kind][Number(index)];
  if (!item) {
    res.status(404);
    throw new Error('Cost item not found at that index');
  }
  item.photoUrl = `/uploads/${req.file.filename}`;
  await invoice.save();
  ok(res, await withTotals(invoice));
});

// Shared lookup used by the small action endpoints above. Sets the response
// status before throwing so errorHandler.js reports the right code (404),
// instead of falling back to 500.
async function findInvoiceOr404(res, id) {
  const invoice = await Invoice.findById(id);
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }
  return invoice;
}

module.exports = {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  setDiscount,
  setGstIncluded,
  setPaymentMode,
  setStatus,
  setCostItems,
  uploadCostItemPhoto,
};
