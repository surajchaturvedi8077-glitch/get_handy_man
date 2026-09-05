/**
 * Settings.js
 * ------------------------------------------------------------------
 * A single-document collection holding business-wide settings:
 * branding shown on invoice/quote PDFs, and the GST toggle/rate that
 * new invoices default to. getSingleton() always returns the one
 * settings document, creating it with sane defaults on first use.
 * ------------------------------------------------------------------
 */
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: 'Get Handyman' },
    abn: { type: String, default: '' },
    bizEmail: { type: String, default: '' },
    logoUrl: { type: String, default: null },
    gstEnabled: { type: Boolean, default: true },
    gstRate: { type: Number, default: 10 }, // percent
  },
  { timestamps: true }
);

settingsSchema.statics.getSingleton = async function getSingleton() {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.model('Settings', settingsSchema);
