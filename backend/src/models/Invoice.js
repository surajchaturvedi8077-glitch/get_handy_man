const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({ name: String, qty: { type: Number, default: 1 }, amt: { type: Number, default: 0 } }, { _id: false });
const costItemSchema = new mongoose.Schema({ name: { type: String, required: true }, cost: { type: Number, default: 0 }, photoUrl: { type: String, default: null } }, { _id: false });

const invoiceSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, unique: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
    customer: { type: String, required: true },
    customerEmail: String,
    customerPhone: String,
    customerAddress: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    terms: { type: String, default: 'Due on receipt' },
    dueDate: Date,

    items: [lineItemSchema],
    paymentMode: { type: String, enum: ['online', 'cash'], default: 'online' },
    status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    gstIncluded: { type: Boolean, default: true },
    discount: { type: { type: String, enum: ['amount', 'percent'], default: 'percent' }, value: { type: Number, default: 0 } },

    notes: { type: String, default: '' }, 
    advancePaid: { type: Number, default: 0 },

    completionPhotoUrl: { type: String, default: null },
    completionPhotos: { type: [String], default: [] },
    
    costs: { materials: [costItemSchema], other: [costItemSchema] },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);