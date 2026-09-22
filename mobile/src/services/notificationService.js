import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

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
  if (Constants.appOwnership === 'expo' && Platform.OS === 'android') {
    return null;
  }

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
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC, // WAKES UP LOCK SCREEN
        bypassDnd: true, // BYPASSES DO NOT DISTURB
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

export async function scheduleLocalJobReminder(job) {
  if (!job.scheduledDate) return;
  const triggerTime = new Date(job.scheduledDate).getTime() - (60 * 60 * 1000); 
  if (triggerTime <= Date.now()) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Upcoming Job 🛠️",
        body: `You have a job at ${job.address} in 1 hour.`,
        sound: true,
      },
      trigger: { date: new Date(triggerTime) },
    });
  } catch (e) { }
}