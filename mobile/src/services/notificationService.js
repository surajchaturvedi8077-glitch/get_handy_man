import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'Job Reminders & Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F5821F',
    });
  }
}

// Schedule a local notification reminder for an upcoming job
export async function scheduleJobReminder(jobTitle, jobDate) {
  const triggerTime = new Date(jobDate).getTime() - (30 * 60 * 1000); // 30 mins before
  if (triggerTime <= Date.now()) return; // Don't schedule past events

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Upcoming Job Reminder 🔔",
      body: `You have an upcoming job: ${jobTitle} in 30 minutes.`,
      sound: true,
    },
    trigger: { date: new Date(triggerTime) },
  });
}