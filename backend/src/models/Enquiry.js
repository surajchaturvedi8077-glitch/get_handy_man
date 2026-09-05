/**
 * Enquiry.js
 * ------------------------------------------------------------------
 * A lead that came in from the public website (gethandyman.com.au).
 * Lifecycle: new -> quoted -> accepted -> (job created) / rejected.
 * When accepted, jobController creates a Job and stores its id back
 * on the enquiry (jobId) so the two stay linked.
 * ------------------------------------------------------------------
 */
const mongoose = require('mongoose');

const quoteItemSchema = new mongoose.Schema(
  { name: String, qty: { type: Number, default: 1 }, amt: { type: Number, default: 0 } },
  { _id: false }
);

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: String,
    email: String,
    service: { type: String, required: true },
    when: String, // customer's preferred date/time, free text from the website form
    address: String,
    suburb: String,
    message: String,
    status: {
      type: String,
      enum: ['new', 'quoted', 'accepted', 'rejected'],
      default: 'new',
    },
    price: { type: Number, default: 0 }, // set once a quote is sent
    quoteItems: [quoteItemSchema], // line items drafted in the quote composer
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
    received: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
