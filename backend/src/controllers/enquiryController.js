const asyncHandler = require('../middleware/asyncHandler');
const Enquiry = require('../models/Enquiry');
const Job = require('../models/Job');
const Settings = require('../models/Settings');
const { ok, created } = require('../utils/apiResponse');
const { Expo } = require('expo-server-sdk');

const listEnquiries = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status && status !== 'all' ? { status } : {};
  const enquiries = await Enquiry.find(filter).sort({ received: -1 });
  ok(res, enquiries);
});

const getEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) { res.status(404); throw new Error('Enquiry not found'); }
  ok(res, enquiry);
});

const createEnquiry = asyncHandler(async (req, res) => {
  // 1. Existing code: create the enquiry in the database
  const enquiry = await Enquiry.create(req.body);

  // 2. NEW CODE: Fetch the worker's saved push token from Settings
  try {
    const settings = await Settings.getSingleton();
    
    // 3. NEW CODE: If a token exists, send the push notification
    if (settings.expoPushToken && Expo.isExpoPushToken(settings.expoPushToken)) {
      const expo = new Expo();
      await expo.sendPushNotificationsAsync([{
        to: settings.expoPushToken,
        sound: 'default',
        title: 'New Enquiry! 🛠️',
        body: `${enquiry.name} requested a quote for ${req.body.service || 'a job'}.`,
        data: { enquiryId: enquiry._id },
      }]);
    }
  } catch (err) {
    console.error("Push notification failed to send:", err);
    // We catch the error so the enquiry still successfully saves even if the notification fails
  }

  // 4. Existing code: send response to website
  res.status(201).json({ success: true, data: enquiry });
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
  const { items = [] } = req.body;
  const price = items.reduce((sum, it) => sum + (Number(it.qty) || 1) * (Number(it.amt) || 0), 0);
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { quoteItems: items, price, status: 'quoted' }, { new: true });
  if (!enquiry) { res.status(404); throw new Error('Enquiry not found'); }
  ok(res, enquiry);
});

const acceptEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) { res.status(404); throw new Error('Enquiry not found'); }

  const job = await Job.create({
    enquiryId: enquiry._id,
    name: enquiry.name,
    phone: enquiry.phone,
    email: enquiry.email,
    services: enquiry.services && enquiry.services.length > 0 ? enquiry.services : (enquiry.service ? [enquiry.service] : []),
    service: enquiry.service, 
    when: enquiry.when,
    exactTime: enquiry.exactTime,
    address: [enquiry.address, enquiry.suburb, enquiry.postcode].filter(Boolean).join(', '),
    suburb: enquiry.suburb,
    postcode: enquiry.postcode,
    attachmentUrl: enquiry.attachmentUrl, 
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

module.exports = { listEnquiries, getEnquiry, createEnquiry, updateEnquiry, deleteEnquiry, rejectEnquiry, sendQuote, acceptEnquiry };