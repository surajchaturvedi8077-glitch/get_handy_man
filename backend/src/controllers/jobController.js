const asyncHandler = require('../middleware/asyncHandler');
const Job = require('../models/Job');
const Invoice = require('../models/Invoice');
const { nextInvoiceNumber } = require('../services/numberingService');
const { ok, created } = require('../utils/apiResponse');

const listJobs = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status && status !== 'all' ? { status } : {};
  const jobs = await Job.find(filter).sort({ scheduledDate: 1 });
  ok(res, jobs);
});

const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) { res.status(404); throw new Error('Job not found'); }
  ok(res, job);
});

const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create(req.body);
  created(res, job);
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!job) { res.status(404); throw new Error('Job not found'); }
  ok(res, job);
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) { res.status(404); throw new Error('Job not found'); }
  ok(res, { deleted: true });
});

const saveJobDetails = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!job) { res.status(404); throw new Error('Job not found'); }
  
  if (job.invoiceId) {
    const invoice = await Invoice.findById(job.invoiceId);
    if (invoice) {
      if (req.body.address !== undefined) invoice.customerAddress = req.body.address;
      if (req.body.name !== undefined) invoice.customer = req.body.name;
      if (req.body.phone !== undefined) invoice.customerPhone = req.body.phone;
      if (req.body.email !== undefined) invoice.customerEmail = req.body.email;
      if (req.body.advancePaid !== undefined) invoice.advancePaid = req.body.advancePaid;
      if (req.body.notes !== undefined) invoice.notes = req.body.notes;
      await invoice.save();
    }
  }
  ok(res, job);
});

const updateMaterials = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) { res.status(404); throw new Error('Job not found'); }
  job.materials = req.body.materials || [];
  await job.save();
  ok(res, job);
});

const markComplete = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) { res.status(404); throw new Error('Job not found'); }
  job.status = 'complete';
  
  let invoice;
  if (!job.invoiceId) {
    invoice = await Invoice.create({
      number: await nextInvoiceNumber(),
      jobId: job._id,
      customer: job.name,
      customerEmail: job.email,
      customerPhone: job.phone,
      customerAddress: job.address,
      advancePaid: job.advancePaid || 0,
      notes: job.notes || '',
      items: job.services && job.services.length > 0 
        ? job.services.map(s => ({ name: s.name || 'Service', amt: Number(s.amt) || 0, qty: 1 }))
        : [{ name: job.service || 'Handyman Services', amt: job.labour || 0, qty: 1 }],
      costs: { materials: job.materials || [], other: [] }
    });
    job.invoiceId = invoice._id;
  } else {
    invoice = await Invoice.findById(job.invoiceId);
    if (invoice) {
       invoice.customerAddress = job.address;
       invoice.customer = job.name;
       invoice.customerPhone = job.phone;
       invoice.customerEmail = job.email;
       invoice.advancePaid = job.advancePaid || 0;
       invoice.notes = job.notes || '';
       await invoice.save();
    }
  }
  await job.save();
  ok(res, { job, invoice });
});

module.exports = { listJobs, getJob, createJob, updateJob, deleteJob, saveJobDetails, updateMaterials, markComplete };