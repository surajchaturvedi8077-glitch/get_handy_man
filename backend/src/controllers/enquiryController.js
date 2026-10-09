const asyncHandler = require('../middleware/asyncHandler');
const Enquiry = require('../models/Enquiry');
const Job = require('../models/Job');
const Invoice = require('../models/Invoice');
const { nextInvoiceNumber } = require('../services/numberingService');
const { ok, created } = require('../utils/apiResponse');

const listEnquiries = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status && status !== 'all' ? { status } : {};
  const enquiries = await Enquiry.find(filter).sort({ createdAt: -1 });
  ok(res, enquiries);
});

const getEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) { res.status(404); throw new Error('Enquiry not found'); }
  ok(res, enquiry);
});

const createEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.create(req.body);
  created(res, enquiry);
});

const updateEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!enquiry) { res.status(404); throw new Error('Enquiry not found'); }
  ok(res, enquiry);
});

const deleteEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
  if (!enquiry) { res.status(404); throw new Error('Enquiry not found'); }
  ok(res, { deleted: true });
});

const rejectEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
  if (!enquiry) { res.status(404); throw new Error('Enquiry not found'); }
  ok(res, enquiry);
});

const sendQuote = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) { res.status(404); throw new Error('Enquiry not found'); }
  enquiry.quoteItems = req.body.items || [];
  enquiry.status = 'quoted';
  await enquiry.save();
  ok(res, enquiry);
});

const acceptEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) { res.status(404); throw new Error('Enquiry not found'); }
  
  const quoteTotal = enquiry.quoteItems?.reduce((sum, item) => sum + (Number(item.amt) || 0), 0) || enquiry.price || 0;
  
  const job = await Job.create({
    name: enquiry.name || 'Customer',
    phone: enquiry.phone || '',
    email: enquiry.email || '',
    address: [enquiry.address, enquiry.suburb, enquiry.postcode].filter(Boolean).join(', '),
    service: enquiry.service || 'Handyman',
    services: enquiry.quoteItems && enquiry.quoteItems.length > 0 
      ? enquiry.quoteItems.map(i => ({ name: i.name || 'Quote Item', amt: Number(i.amt) || 0 })) 
      : [{ name: enquiry.service || 'Handyman', amt: quoteTotal }],
    labour: quoteTotal, 
    advancePaid: enquiry.advancePaid || 0,
    notes: enquiry.notes || '',
    status: 'accepted'
  });

  enquiry.jobId = job._id;
  enquiry.status = 'accepted';
  await enquiry.save();
  
  ok(res, { enquiry, job });
});

const convertToInvoice = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) { res.status(404); throw new Error('Enquiry not found'); }
  
  const invoice = await Invoice.create({
    number: await nextInvoiceNumber(),
    customer: enquiry.name || 'Customer',
    customerPhone: enquiry.phone || '',
    customerEmail: enquiry.email || '',
    customerAddress: [enquiry.address, enquiry.suburb, enquiry.postcode].filter(Boolean).join(', '),
    advancePaid: enquiry.advancePaid || 0,
    notes: enquiry.notes || '',
    items: enquiry.quoteItems && enquiry.quoteItems.length > 0 
      ? enquiry.quoteItems.map(i => ({ name: i.name || 'Quote Item', amt: Number(i.amt) || 0, qty: 1 }))
      : [{ name: enquiry.service || 'Handyman Service', amt: enquiry.price || 0, qty: 1 }],
  });
  
  enquiry.status = 'accepted';
  enquiry.invoiceId = invoice._id;
  await enquiry.save();
  
  ok(res, { enquiry, invoice });
});

module.exports = {
  listEnquiries,
  getEnquiry,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  rejectEnquiry,
  sendQuote,
  acceptEnquiry,
  convertToInvoice
};