const asyncHandler = require('../middleware/asyncHandler');
const Job = require('../models/Job');
const Invoice = require('../models/Invoice');
const Settings = require('../models/Settings');
const { ok, created } = require('../utils/apiResponse');
const { nextInvoiceNumber } = require('../services/numberingService');

const listJobs = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status && status !== 'all' ? { status } : {};
  // FIXED: Sort by scheduledDate so jobs appear in proper chronological order
  const jobs = await Job.find(filter).sort({ scheduledDate: 1, createdAt: -1 });
  ok(res, jobs);
});

const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  ok(res, job);
});

const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create(req.body);
  created(res, job);
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  ok(res, job);
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  ok(res, { deleted: true });
});

const saveJobDetails = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  Object.assign(job, req.body, { needsDetails: false });
  if (job.status === 'accepted') job.status = 'confirmed';
  await job.save();
  ok(res, job);
});

const updateMaterials = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { materials: req.body.materials || [] },
    { new: true, runValidators: true }
  );
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  ok(res, job);
});

// POST /api/jobs/:id/complete
const markComplete = asyncHandler(async (req, res) => {
  console.log(`[DEBUG] Marking Job ${req.params.id} as complete...`);
  
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // FORCE the status to complete in the database
  job.status = 'complete';
  
  const Invoice = require('../models/Invoice');
  const { nextInvoiceNumber } = require('../services/numberingService');

  let invoice;
  if (!job.invoiceId) {
    console.log(`[DEBUG] Generating new Invoice for Job ${req.params.id}`);
    invoice = await Invoice.create({
      number: await nextInvoiceNumber(),
      jobId: job._id,
      customer: job.name,
      customerEmail: job.email,
      customerPhone: job.phone,
      customerAddress: job.address, // FIXED: Address passes seamlessly to the invoice
      items: [{ name: job.service || 'Handyman Services', amt: job.labour || 0, qty: 1 }],
      costs: { materials: job.materials || [], other: [] }
    });
    job.invoiceId = invoice._id;
  } else {
    invoice = await Invoice.findById(job.invoiceId);
  }

  await job.save();
  console.log(`[DEBUG] Job successfully marked complete!`);
  
  ok(res, { job, invoice });
});

module.exports = { listJobs, getJob, createJob, updateJob, deleteJob, saveJobDetails, updateMaterials, markComplete };