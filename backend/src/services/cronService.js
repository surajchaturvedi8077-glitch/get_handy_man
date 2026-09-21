/**
 * cronService.js
 * ------------------------------------------------------------------
 * Automated background tasks. Runs daily to check for unpaid invoices
 * and pushes a lock-screen notification to the worker's device.
 * ------------------------------------------------------------------
 */
const cron = require('node-cron');
const { Expo } = require('expo-server-sdk');
const Invoice = require('../models/Invoice');
const Settings = require('../models/Settings');

function startCronJobs() {
  // Runs every day at 9:00 AM server time
  cron.schedule('** * * *', async () => {
    try {
      const settings = await Settings.getSingleton();
      
      // Stop if push notifications aren't set up yet
      if (!settings.expoPushToken || !Expo.isExpoPushToken(settings.expoPushToken)) {
        return;
      }

      // Find all unpaid invoices
      const unpaidInvoices = await Invoice.find({ status: 'unpaid' });
      
      if (unpaidInvoices.length === 0) {
        return; // Nothing to report
      }

      // Calculate how many are technically "Overdue" (older than 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const overdueCount = unpaidInvoices.filter(inv => new Date(inv.date) < oneWeekAgo).length;

      let message = `You have ${unpaidInvoices.length} unpaid invoice(s) awaiting collection.`;
      if (overdueCount > 0) {
        message = `⚠️ ${overdueCount} invoice(s) are severely overdue! ` + message;
      }

      // Send the remote push notification
      const expo = new Expo();
      await expo.sendPushNotificationsAsync([{
        to: settings.expoPushToken,
        sound: 'default',
        title: 'Daily Invoice Reminder 💰',
        body: message,
      }]);
      
      console.log(`[cron] Sent unpaid invoice reminder for ${unpaidInvoices.length} invoices.`);
    } catch (err) {
      console.error('[cron] Failed to send daily invoice reminders:', err);
    }
  });
  
  console.log('[cron] Automated daily invoice reminders initialized.');
}

module.exports = { startCronJobs };