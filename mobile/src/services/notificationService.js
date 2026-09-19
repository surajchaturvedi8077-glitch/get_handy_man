import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// 1. Set handler safely so it doesn't crash if unsupported
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

// 2. Safely get the push token, bypassing Expo Go restrictions
export async function getExpoPushToken() {
  // Expo Go on Android no longer supports remote push notifications
  // Returning null here prevents the fatal startup crash
  if (Constants.appOwnership === 'expo' && Platform.OS === 'android') {
    console.log("Remote push notifications are not supported in Expo Go on Android. Skipping.");
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Job Reminders & Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F5821F',
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '9bc67899-cae6-4259-ba01-5d512cb0fb8e' 
    });
    
    return tokenData.data;
  } catch (error) {
    console.log("Could not fetch push token:", error);
    return null;
  }
}

// 3. Schedule local reminders safely
export async function scheduleLocalJobReminder(job) {
  if (!job.scheduledDate) return;
  
  // Trigger 1 hour before the scheduled date
  const triggerTime = new Date(job.scheduledDate).getTime() - (60 * 60 * 1000); 
  
  // Don't schedule if the time has already passed
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
  } catch (e) {
    console.log("Could not schedule local notification:", e);
  }
}