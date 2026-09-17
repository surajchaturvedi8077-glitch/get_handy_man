const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({ name: String, cost: { type: Number, default: 0 } }, { _id: false });

const jobSchema = new mongoose.Schema(
  {
    enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry', default: null },
    name: { type: String, required: true },
    phone: String,
    email: String,
    service: { type: String, required: true },
    when: String,
    scheduledDate: Date,
    address: { type: String, required: true },
    suburb: String, // NEW FIELD
    postcode: String, // NEW FIELD
    attachmentUrl: String, // NEW FIELD
    status: { type: String, enum: ['accepted', 'confirmed', 'complete'], default: 'accepted' },
    needsDetails: { type: Boolean, default: true },
    materials: [materialSchema],
    labour: { type: Number, default: 0 },
    notes: String,
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);