const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: String,
    email: String,
    address: String,
    suburb: String,
    postcode: String,
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.models.Customer || mongoose.model('Customer', customerSchema);