import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 1. Force notifications to appear on the lock screen and in the notification bar
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (e) {
  console.log("Notification handler initialization skipped.");
}

// 2. Safely get the push token & ask for permissions
export async function getExpoPushToken() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Job Reminders & Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F5821F',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC, 
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '9bc67899-cae6-4259-ba01-5d512cb0fb8e' 
    });
    return tokenData.data;
  } catch (error) {
    return null;
  }
}

// 3. MASTER SYNC: Queues cascading alerts from the "Bell" to the OS
export async function syncLocalNotifications(upcomingJobs, unpaidInvoices) {
  try {
    // Clear old queue to prevent duplicate spam
    await Notifications.cancelAllScheduledNotificationsAsync();

    // A. Schedule Cascading Job Alerts
    upcomingJobs.forEach(async (job) => {
      if (!job.scheduledDate) return;
      const jobTime = new Date(job.scheduledDate).getTime();
      
      const twoHours = jobTime - (2 * 60 * 60 * 1000);
      const oneHour = jobTime - (60 * 60 * 1000);
      const fifteenMins = jobTime - (15 * 60 * 1000);

      // Reminder: 2 Hours Before
      if (twoHours > Date.now()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Job Today 🗓️",
            body: `Upcoming job at ${job.address || 'client'} in 2 hours.`,
            sound: true,
          },
          trigger: { date: new Date(twoHours) },
        });
      }

      // Reminder: 1 Hour Before
      if (oneHour > Date.now()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Leaving Soon ⏳",
            body: `You have a job at ${job.address || 'client'} in 1 hour.`,
            sound: true,
          },
          trigger: { date: new Date(oneHour) },
        });
      }

      // Reminder: 15 Minutes Before (High Priority)
      if (fifteenMins > Date.now()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Job Starting! 🚀",
            body: `You should be arriving at ${job.address || 'client'} in 15 minutes.`,
            sound: true,
          },
          trigger: { date: new Date(fifteenMins) },
        });
      }
    });

    // B. Schedule Unpaid Invoices (Every morning at 9:00 AM)
    if (unpaidInvoices && unpaidInvoices.length > 0) {
      const nineAM = new Date();
      nineAM.setHours(9, 0, 0, 0);
      
      if (Date.now() > nineAM.getTime()) {
        nineAM.setDate(nineAM.getDate() + 1); 
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Pending Invoices 💰",
          body: `You have ${unpaidInvoices.length} unpaid invoices waiting to be collected.`,
          sound: true,
        },
        trigger: { date: nineAM },
      });
    }

  } catch (e) {
    console.log("Could not sync notifications:", e);
  }
}