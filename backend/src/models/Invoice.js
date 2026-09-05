/**
 * Invoice.js
 * ------------------------------------------------------------------
 * A billable document tied to a Job. Two independent things live on
 * an invoice:
 *   1) items/discount/gstIncluded -> what the CUSTOMER is charged
 *      (see services/gstService.calcInvoiceTotals)
 *   2) costs.materials / costs.other -> what the WORKER spent doing
 *      the job, each with an optional receipt photo (internal only,
 *      never shown to the customer). See services/gstService.calcCostTotals.
 *
 * gstIncluded=true  -> "Reported income" (GST charged & owed to ATO)
 * gstIncluded=false -> "Cash Bonus"      (no GST, not reported income)
 *
 * costs.materials feeds the "GST on material" report line (10% of the
 * material total) — see services/reportService.js.
 * ------------------------------------------------------------------
 */
const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema(
  { name: String, qty: { type: Number, default: 1 }, amt: { type: Number, default: 0 } },
  { _id: false }
);

const costItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    cost: { type: Number, default: 0 },
    photoUrl: { type: String, default: null }, // receipt photo, uploaded via /uploads route
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, unique: true }, // e.g. "GH-0123"
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
    customer: { type: String, required: true },
    customerEmail: String,
    customerPhone: String,
    date: { type: Date, default: Date.now },
    terms: { type: String, default: 'Due on receipt' },
    dueDate: Date,

    items: [lineItemSchema],
    paymentMode: { type: String, enum: ['online', 'cash'], default: 'online' },
    status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    gstIncluded: { type: Boolean, default: true },
    discount: {
      type: { type: String, enum: ['amount', 'percent'], default: 'percent' },
      value: { type: Number, default: 0 },
    },

    costs: {
      materials: [costItemSchema],
      other: [costItemSchema], // was "vehicle expenses" — generalised, same shape
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
