/**
 * cronService.js
 * ------------------------------------------------------------------
 * Automated background tasks. Runs to check for unpaid invoices
 * and pushes a lock-screen notification to the worker's device.
 * ------------------------------------------------------------------
 */
const cron = require('node-cron');
const { Expo } = require('expo-server-sdk');
const Invoice = require('../models/Invoice');
const Settings = require('../models/Settings');

function startCronJobs() {
  cron.schedule('* * * * *', async () => {
    try {
      const settings = await Settings.getSingleton();
      
      if (!settings.expoPushToken || !Expo.isExpoPushToken(settings.expoPushToken)) {
        return;
      }

      const unpaidInvoices = await Invoice.find({ status: 'unpaid' });
      if (unpaidInvoices.length === 0) return;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const overdueCount = unpaidInvoices.filter(inv => new Date(inv.date) < oneWeekAgo).length;

      let message = `You have ${unpaidInvoices.length} unpaid invoice(s) awaiting collection.`;
      if (overdueCount > 0) {
        message = `⚠️ ${overdueCount} invoice(s) are severely overdue! ` + message;
      }

      const expo = new Expo();
      await expo.sendPushNotificationsAsync([{
        to: settings.expoPushToken,
        sound: 'default',
        title: 'Invoice Reminder 💰',
        body: message,
        priority: 'high',      // REQUIRED FOR ANDROID LOCK SCREEN
        channelId: 'default'   // REQUIRED FOR ANDROID LOCK SCREEN
      }]);
      
      console.log(`[cron] Sent unpaid invoice reminder for ${unpaidInvoices.length} invoices.`);
    } catch (err) {
      console.error('[cron] Failed to send daily invoice reminders:', err);
    }
  });
  
  console.log('[cron] Automated hourly invoice reminders (8 AM - 6 PM) initialized.');
}

module.exports = { startCronJobs };