/**
 * enquiryController.js
 * ------------------------------------------------------------------
 * Handles all website enquiries, PDF quote sending, push notifications,
 * and auto-syncing customer details to linked Jobs and Invoices.
 * ------------------------------------------------------------------
 */
const asyncHandler = require('../middleware/asyncHandler');
const Enquiry = require('../models/Enquiry');
const Job = require('../models/Job');
const Invoice = require('../models/Invoice');
const Settings = require('../models/Settings');
const { Expo } = require('expo-server-sdk');
const { ok, created } = require('../utils/apiResponse');

// GET /api/enquiries
const listEnquiries = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status && status !== 'all' ? { status } : {};
  const enquiries = await Enquiry.find(filter).sort({ createdAt: -1 });
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

// POST /api/enquiries (Website Contact Form)
const createEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.create(req.body);
  
  // FIXED: Beam a high-priority push notification directly to the worker's phone
  try {
    const settings = await Settings.findOne();
    if (settings && settings.expoPushToken) {
      const payload = JSON.stringify({
        to: settings.expoPushToken,
        title: "New Enquiry! 📩",
        body: `You received a new request from ${enquiry.name || 'a customer'}.`,
        sound: "default",
        channelId: "alerts-v2" // Hits the high-priority lock screen channel
      });

      const reqPush = https.request({
        hostname: 'exp.host',
        path: '/--/api/v2/push/send',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      });
      
      reqPush.on('error', (e) => console.error("[Push Error]", e));
      reqPush.write(payload);
      reqPush.end();
    }
  } catch (err) {
    console.log("[Push Notification Failed]", err.message);
  }

  created(res, enquiry);
});
// PUT /api/enquiries/:id (Update Enquiry Details)
const updateEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found');
  }

  // AUTO-SYNC: Cascade name/phone/email/address updates to connected Jobs and Invoices
  try {
    const linkedJobs = await Job.find({ 
      $or: [ { email: enquiry.email }, { phone: enquiry.phone } ] 
    });

    for (let job of linkedJobs) {
      job.name = enquiry.name;
      job.phone = enquiry.phone;
      job.email = enquiry.email;
      job.address = enquiry.address;
      await job.save();

      if (job.invoiceId) {
        await Invoice.findByIdAndUpdate(job.invoiceId, {
          customer: enquiry.name,
          customerPhone: enquiry.phone,
          customerEmail: enquiry.email
        });
      }
    }
  } catch (err) {
    console.log("Silent sync error:", err);
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
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
  ok(res, enquiry);
});

// POST /api/enquiries/:id/send-quote
const sendQuote = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status: 'quoted', quoteItems: items }, { new: true });
  ok(res, enquiry);
});

// POST /api/enquiries/:id/accept
const acceptEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status: 'accepted' }, { new: true });
  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found');
  }

  // Convert Enquiry into a Pending Job
  // FIXED: Status is set to 'accepted' instead of the invalid 'pending' enum
  const job = await Job.create({
    name: enquiry.name || 'New Customer',
    phone: enquiry.phone || '',
    email: enquiry.email || '',
    address: enquiry.address || enquiry.suburb || 'Address not set',
    services: enquiry.services?.length ? enquiry.services : [enquiry.service || 'General Handyman'],
    service: enquiry.service || 'General Handyman',
    when: enquiry.when || 'Not scheduled yet',
    status: 'accepted', 
    needsDetails: true,
    labour: 0,
    enquiryId: enquiry._id
  });

  ok(res, { enquiry, job });
});

module.exports = {
  listEnquiries,
  getEnquiry,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  rejectEnquiry,
  sendQuote,
  acceptEnquiry
};