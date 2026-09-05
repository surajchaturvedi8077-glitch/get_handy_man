/**
 * Job.js
 * ------------------------------------------------------------------
 * A confirmed piece of work for a customer, usually created from an
 * accepted Enquiry. Tracks status, on-site materials used (which
 * later seed the invoice's material cost items), and scheduling.
 * ------------------------------------------------------------------
 */
const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  { name: String, cost: { type: Number, default: 0 } },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry', default: null },
    name: { type: String, required: true }, // customer name
    phone: String,
    email: String,
    service: { type: String, required: true },
    when: String, // display string, e.g. "Fri 4 Sep · 9:00 AM"
    scheduledDate: Date,
    address: { type: String, required: true },
    status: {
      type: String,
      enum: ['accepted', 'confirmed', 'complete'],
      default: 'accepted',
    },
    needsDetails: { type: Boolean, default: true }, // true until the worker fills in job specifics
    materials: [materialSchema],
    labour: { type: Number, default: 0 },
    notes: String,
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
