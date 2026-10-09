const mongoose = require('mongoose');

const jobServiceSchema = new mongoose.Schema({ 
  name: { type: String, required: true }, 
  amt: { type: Number, default: 0 } 
}, { _id: false });

const costItemSchema = new mongoose.Schema({ 
  name: { type: String, required: true }, 
  cost: { type: Number, default: 0 }, 
  photoUrl: { type: String, default: null } 
}, { _id: false });

const jobSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: String,
    email: String,
    address: String,
    when: String,
    exactTime: String,
    scheduledDate: Date,
    service: String,
    services: [jobServiceSchema], 
    labour: { type: Number, default: 0 },
    advancePaid: { type: Number, default: 0 },
    notes: String,
    materials: [costItemSchema],
    extraFields: [{ label: String, value: String }],
    status: { type: String, enum: ['pending', 'accepted', 'confirmed', 'complete'], default: 'accepted' },
    needsDetails: { type: Boolean, default: false },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Job || mongoose.model('Job', jobSchema);