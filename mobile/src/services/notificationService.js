import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 1. Force notifications to appear as top-level banners even when app is open
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

// 2. Build the high-priority lock screen channel and grab the push token
export async function getExpoPushToken() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alerts-v2', {
      name: 'High Priority Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F5821F',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC, 
    });
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') return null;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '9bc67899-cae6-4259-ba01-5d512cb0fb8e' 
    });
    return tokenData.data;
  } catch (error) {
    console.log("Token error:", error);
    return null;
  }
}

// 3. MASTER SYNC: Queues cascading alerts to the OS
export async function syncLocalNotifications(upcomingJobs, unpaidInvoices) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    // A. Schedule Cascading Job Alerts
    upcomingJobs.forEach(async (job) => {
      if (!job.scheduledDate) return;
      const jobTime = new Date(job.scheduledDate).getTime();
      
      const twoHours = jobTime - (2 * 60 * 60 * 1000);
      const oneHour = jobTime - (60 * 60 * 1000);
      const fifteenMins = jobTime - (15 * 60 * 1000);

      if (twoHours > Date.now()) {
        await Notifications.scheduleNotificationAsync({
          content: { title: "Job Today 🗓️", body: `Upcoming job at ${job.address || 'client'} in 2 hours.`, sound: true, channelId: 'alerts-v2' },
          trigger: { date: new Date(twoHours) },
        });
      }

      if (oneHour > Date.now()) {
        await Notifications.scheduleNotificationAsync({
          content: { title: "Leaving Soon ⏳", body: `You have a job at ${job.address || 'client'} in 1 hour.`, sound: true, channelId: 'alerts-v2' },
          trigger: { date: new Date(oneHour) },
        });
      }

      if (fifteenMins > Date.now()) {
        await Notifications.scheduleNotificationAsync({
          content: { title: "Job Starting! 🚀", body: `You should be arriving at ${job.address || 'client'} in 15 minutes.`, sound: true, channelId: 'alerts-v2' },
          trigger: { date: new Date(fifteenMins) },
        });
      }
    });

    // B. Schedule Unpaid Invoices
    if (unpaidInvoices && unpaidInvoices.length > 0) {
      const nineAM = new Date();
      nineAM.setHours(9, 0, 0, 0);
      if (Date.now() > nineAM.getTime()) nineAM.setDate(nineAM.getDate() + 1); 

      await Notifications.scheduleNotificationAsync({
        content: { title: "Pending Invoices 💰", body: `You have ${unpaidInvoices.length} unpaid invoices waiting to be collected.`, sound: true, channelId: 'alerts-v2' },
        trigger: { date: nineAM },
      });
    }
  } catch (e) {
    console.log("Could not sync notifications:", e);
  }
}