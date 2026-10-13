import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let morningBriefingTimer = null;

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
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F5821F',
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (error) {
    return null;
  }
}

export async function scheduleLocalJobReminder(job) {
  if (!job.scheduledDate || job.status === 'complete') return;
  const jobTime = new Date(job.scheduledDate).getTime();
  const reminderTime = jobTime - 60 * 60 * 1000; // 1 hour prior

  if (reminderTime > Date.now()) {
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: `job-remind-${job._id}`,
        content: {
          title: "⏳ Job Starting Soon",
          body: `Job with ${job.name} at ${job.address} starts in 1 hour.`,
          sound: 'default',
        },
        trigger: { date: new Date(reminderTime) },
      });
    } catch (e) {}
  }
}

// FIXED: Crash-proof timeout scheduling
export function setupMorningBriefingTimeout(briefingEnabled, briefingTimeStr, getJobCountFn) {
  if (morningBriefingTimer) {
    clearTimeout(morningBriefingTimer);
    morningBriefingTimer = null;
  }

  if (briefingEnabled === false) return;

  // Safe defaults to prevent NaN crash
  let h = 7, m = 30; 
  if (briefingTimeStr && typeof briefingTimeStr === 'string' && briefingTimeStr.includes(':')) {
    const parts = briefingTimeStr.split(':').map(Number);
    if (!isNaN(parts[0]) && !isNaN(parts[1])) {
      h = parts[0];
      m = parts[1];
    }
  }

  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);

  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1); // Push to next morning
  }

  // Enforce a minimum delay of 1 minute so it NEVER infinite-loops on launch
  const delay = Math.max(target.getTime() - now.getTime(), 60000);

  morningBriefingTimer = setTimeout(async () => {
    try {
      const count = typeof getJobCountFn === 'function' ? getJobCountFn() : 0;
      const todayStr = new Date().toDateString();
      const lastRan = await AsyncStorage.getItem('last_briefing_date');
      
      if (lastRan !== todayStr) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "☀️ Morning Briefing",
            body: `Good morning! You have ${count} job${count === 1 ? '' : 's'} scheduled for today.`,
            sound: 'default',
          },
          trigger: null,
        });
        await AsyncStorage.setItem('last_briefing_date', todayStr);
      }
    } catch (e) {}
    
    // Recur for following day safely
    setupMorningBriefingTimeout(briefingEnabled, briefingTimeStr, getJobCountFn);
  }, delay);

  return morningBriefingTimer;
}