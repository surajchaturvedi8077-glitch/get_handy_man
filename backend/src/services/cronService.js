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
  // Valid 5-field cron expression: minute hour day month day-of-week
  // '0 8-18 * * *' = At minute 0 past every hour from 8 through 18.
  cron.schedule('0 8-18 * * *', async () => {
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
        title: 'Invoice Reminder 💰',
        body: message,
      }]);
      
      console.log(`[cron] Sent unpaid invoice reminder for ${unpaidInvoices.length} invoices.`);
    } catch (err) {
      console.error('[cron] Failed to send daily invoice reminders:', err);
    }
  });
  
  console.log('[cron] Automated hourly invoice reminders (8 AM - 6 PM) initialized.');
}

module.exports = { startCronJobs };