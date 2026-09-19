import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Gets the unique hardware token so the backend can text this specific device
export async function getExpoPushToken() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'Job Reminders & Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F5821F',
    });
  }

  try {
    // Project ID is strictly required for Expo's push service
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '9bc67899-cae6-4259-ba01-5d512cb0fb8e' 
    });
    return tokenData.data;
  } catch (error) {
    console.log("Could not fetch push token", error);
    return null;
  }
}

// Local Job Reminder scheduling
export async function scheduleLocalJobReminder(job) {
  if (!job.scheduledDate) return;
  const triggerTime = new Date(job.scheduledDate).getTime() - (60 * 60 * 1000); // 1 hour before
  
  if (triggerTime <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Upcoming Job 🛠️",
      body: `You have a job at ${job.address} in 1 hour.`,
      sound: true,
    },
    trigger: { date: new Date(triggerTime) },
  });
}