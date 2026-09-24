const cron = require('node-cron');
const https = require('https');
const Job = require('../models/Job');
const Invoice = require('../models/Invoice');
const Settings = require('../models/Settings');

const sendPush = (token, title, body) => {
  const payload = JSON.stringify({
    to: token,
    title,
    body,
    sound: "default",
    channelId: "alerts-v2" 
  });

  const req = https.request({
    hostname: 'exp.host',
    path: '/--/api/v2/push/send',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
  });
  
  req.on('error', (e) => console.error("[Cron Push Error]", e));
  req.write(payload);
  req.end();
};

const runMorningBriefing = async () => {
  try {
    const settings = await Settings.findOne();
    if (!settings || !settings.expoPushToken) return;

    const token = settings.expoPushToken;
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);

    // 1. Send Today's Jobs
    const todaysJobs = await Job.find({
      status: { $ne: 'complete' },
      scheduledDate: { $gte: startOfDay,$lte: endOfDay }
    });

    if (todaysJobs.length > 0) {
      sendPush(token, "Today's Schedule 🛠️", `Good morning! You have ${todaysJobs.length} job(s) scheduled for today.`);
    }

    // 2. Send Unpaid Invoices
    const unpaidInvoices = await Invoice.find({ status: 'unpaid' });
    if (unpaidInvoices.length > 0) {
      const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + (inv.totals?.total || 0), 0);
      setTimeout(() => {
        sendPush(token, "Pending Invoices 💰", `You have ${unpaidInvoices.length} unpaid invoices totaling $${totalUnpaid.toFixed(2)}.`);
      }, 5000);
    }
  } catch (err) {
    console.error("[Cron Service Error]", err.message);
  }
};

// FIXED: Strict 8:00 AM trigger locked specifically to Australian Central Standard Time
cron.schedule('0 8 * * *', runMorningBriefing, {
  scheduled: true,
  timezone: "Australia/Adelaide" 
});

module.exports = { runMorningBriefing };