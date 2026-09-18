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

const markComplete = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (job.status === 'complete') {
    res.status(400);
    throw new Error('Job is already marked complete');
  }

  const settings = await Settings.getSingleton();
  const items = job.materials.map((m) => ({ name: m.name, qty: 1, amt: m.cost || 0 }));
  items.push({ name: 'Labour', qty: 1, amt: job.labour || 0 });

  const invoice = await Invoice.create({
    number: await nextInvoiceNumber(),
    jobId: job._id,
    customer: job.name,
    customerEmail: job.email || '',
    customerPhone: job.phone || '',
    terms: 'Due on receipt',
    items,
    paymentMode: 'online',
    status: 'unpaid',
    gstIncluded: settings.gstEnabled,
    discount: { type: 'percent', value: 0 },
    costs: {
      materials: job.materials.map((m) => ({ name: m.name, cost: m.cost || 0, photoUrl: null })),
      other: [],
    },
  });

  job.status = 'complete';
  job.invoiceId = invoice._id;
  await job.save();

  ok(res, { job, invoice });
});

module.exports = { listJobs, getJob, createJob, updateJob, deleteJob, saveJobDetails, updateMaterials, markComplete };