const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({ name: String, cost: { type: Number, default: 0 } }, { _id: false });
const extraFieldSchema = new mongoose.Schema({ label: String, value: String }, { _id: false });

const jobSchema = new mongoose.Schema(
  {
    enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry', default: null },
    name: { type: String, required: true },
    phone: String,
    email: String,
    services: { type: [String], default: [] }, // Array for multiple services
    service: String, // fallback
    when: String,
    exactTime: String,
    scheduledDate: Date,
    address: { type: String, required: true },
    suburb: String,
    postcode: String,
    attachmentUrl: String,
    status: { type: String, enum: ['accepted', 'confirmed', 'complete'], default: 'accepted' },
    needsDetails: { type: Boolean, default: true },
    materials: [materialSchema],
    extraFields: [extraFieldSchema], // Array for extra details
    labour: { type: Number, default: 0 },
    notes: String,
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Job || mongoose.model('Job', jobSchema);