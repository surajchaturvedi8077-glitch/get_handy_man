import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
    return null;
  }
}

// FIXED: Stripped out all overlapping alarms. ONLY triggers exactly 1 hour before the job.
export async function syncLocalNotifications(upcomingJobs, unpaidInvoices) {
  try {
    // Clear the old queue to prevent ghost alarms
    await Notifications.cancelAllScheduledNotificationsAsync();

    upcomingJobs.forEach(async (job) => {
      if (!job.scheduledDate) return;
      
      const jobTime = new Date(job.scheduledDate).getTime();
      const oneHourBefore = jobTime - (60 * 60 * 1000);

      // Only schedule if the 1-hour mark is still in the future
      if (oneHourBefore > Date.now()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Leaving Soon ⏳",
            body: `You have a job at ${job.address || 'client'} in 1 hour.`,
            sound: true,
            channelId: 'alerts-v2',
          },
          trigger: { date: new Date(oneHourBefore) },
        });
      }
    });

    // NOTE: Unpaid invoices are no longer scheduled locally here, 
    // they are perfectly handled by your Backend Cron Job every morning!

  } catch (e) {
    console.log("Could not sync notifications:", e);
  }
}