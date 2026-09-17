const mongoose = require('mongoose');

const quoteItemSchema = new mongoose.Schema({ name: String, qty: { type: Number, default: 1 }, amt: { type: Number, default: 0 } }, { _id: false });

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: String,
    email: String,
    service: { type: String, required: true },
    when: String,
    address: String,
    suburb: String,
    postcode: String, // NEW FIELD
    message: String,
    attachmentUrl: String, // NEW FIELD for the file upload
    status: { type: String, enum: ['new', 'quoted', 'accepted', 'rejected'], default: 'new' },
    price: { type: Number, default: 0 },
    quoteItems: [quoteItemSchema],
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
    received: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);