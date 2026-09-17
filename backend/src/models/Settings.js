const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: 'Get Handyman' },
    abn: { type: String, default: '' },
    bizEmail: { type: String, default: '' },
    bizPhone: { type: String, default: '' },
    bizAddress: { type: String, default: '' },
    bizCityState: { type: String, default: '' },
    website: { type: String, default: '' },
    logoUrl: { type: String, default: null },
    gstEnabled: { type: Boolean, default: true },
    gstRate: { type: Number, default: 10 },
    invoicePrefix: { type: String, default: 'GH-' },
    paymentTerms: { type: String, default: 'Due on receipt' },
    bankName: { type: String, default: '' },
    bsb: { type: String, default: '' },
    account: { type: String, default: '' },
    accountName: { type: String, default: '' },
    quoteMessage: { type: String, default: 'Thanks for your enquiry — here is your quote below. Let me know if you would like to go ahead.' },
    notifJobReminders: { type: Boolean, default: true },
    notifUnpaidReminders: { type: Boolean, default: true },
    notifNewEnquiry: { type: Boolean, default: true },
    defaultServiceRadius: { type: String, default: '25 km' },
    workingHours: { type: String, default: 'Mon-Fri, 7:00 AM-5:00 PM' }
  },
  { timestamps: true }
);

settingsSchema.statics.getSingleton = async function getSingleton() {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);