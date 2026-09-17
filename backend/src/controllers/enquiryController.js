/**
 * enquiryController.js
 * ------------------------------------------------------------------
 * CRUD for website enquiries plus the enquiry-specific actions:
 * reject, send a quote, and accept (which spins up a Job). Each
 * function is intentionally small and does one thing.
 * ------------------------------------------------------------------
 */
const asyncHandler = require('../middleware/asyncHandler');
const Enquiry = require('../models/Enquiry');
const Job = require('../models/Job');
const { ok, created } = require('../utils/apiResponse');

// GET /api/enquiries?status=new
const listEnquiries = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status && status !== 'all' ? { status } : {};
  const enquiries = await Enquiry.find(filter).sort({ received: -1 });
  ok(res, enquiries);
});

// GET /api/enquiries/:id
const getEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found');
  }
  ok(res, enquiry);
});

// POST /api/enquiries  (public — submitted from the marketing website form)
const createEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.create(req.body);
  created(res, enquiry);
});

// PUT /api/enquiries/:id  (edit details / quote line items while drafting)
const updateEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found');
  }
  ok(res, enquiry);
});

// DELETE /api/enquiries/:id
const deleteEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found');
  }
  ok(res, { deleted: true });
});

// POST /api/enquiries/:id/reject
const rejectEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected' },
    { new: true }
  );
  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found');
  }
  ok(res, enquiry);
});

// POST /api/enquiries/:id/send-quote  { items: [{name, qty, amt}] }
const sendQuote = asyncHandler(async (req, res) => {
  const { items = [] } = req.body;
  const price = items.reduce((sum, it) => sum + (Number(it.qty) || 1) * (Number(it.amt) || 0), 0);

  const enquiry = await Enquiry.findByIdAndUpdate(
    req.params.id,
    { quoteItems: items, price, status: 'quoted' },
    { new: true }
  );
  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found');
  }
  ok(res, enquiry);
});

// POST /api/enquiries/:id/accept  -> creates a Job from this enquiry
// ... existing code above ...
const acceptEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found');
  }

  const job = await Job.create({
    enquiryId: enquiry._id,
    name: enquiry.name,
    phone: enquiry.phone,
    email: enquiry.email,
    service: enquiry.service,
    when: enquiry.when,
    // Safely combine address parts
    address: [enquiry.address, enquiry.suburb, enquiry.postcode].filter(Boolean).join(', '),
    suburb: enquiry.suburb,
    postcode: enquiry.postcode,
    attachmentUrl: enquiry.attachmentUrl, // Transfer the attachment
    status: 'accepted',
    needsDetails: true,
    labour: enquiry.price || 0,
    notes: enquiry.message,
  });

  enquiry.status = 'accepted';
  enquiry.jobId = job._id;
  await enquiry.save();

  created(res, { enquiry, job });
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
};
