const mongoose = require('mongoose');

const quoteItemSchema = new mongoose.Schema({ name: String, qty: { type: Number, default: 1 }, amt: { type: Number, default: 0 } }, { _id: false });

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: String,
    email: String,
    services: [String], 
    when: String,
    exactTime: String,
    address: String,
    suburb: String,
    postcode: String, 
    message: String,
    attachmentUrl: String, 
    status: { type: String, enum: ['new', 'quoted', 'accepted', 'rejected'], default: 'new' },
    price: { type: Number, default: 0 },
    quoteItems: [quoteItemSchema],
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
    received: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// FIXED: Check if the model already exists in memory before compiling it
module.exports = mongoose.models.Enquiry || mongoose.model('Enquiry', enquirySchema);