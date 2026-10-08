const mongoose = require('mongoose');

const quoteItemSchema = new mongoose.Schema({
  name: String,
  qty: { type: Number, default: 1 },
  amt: { type: Number, default: 0 }
}, { _id: false });

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: String,
    email: String,
    address: String,
    suburb: String,
    postcode: String,
    service: String,
    services: [String],
    message: String,
    when: String,
    status: { type: String, enum: ['new', 'quoted', 'accepted', 'rejected'], default: 'new' },
    quoteItems: [quoteItemSchema],
    price: { type: Number, default: 0 },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null }, // FIXED: Permanently links the job
    received: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Enquiry || mongoose.model('Enquiry', enquirySchema);