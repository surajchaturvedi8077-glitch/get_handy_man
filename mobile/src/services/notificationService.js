import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// NEW: Programs the Android OS to ring every morning, completely bypassing the sleeping backend server.

const BRIEFING_KEY = 'gh_briefing_pref';

// Accepts enable toggle and custom 24-hr time string (e.g., "07:30" or "08:15")
export async function scheduleDailyMorningBriefing(enabled = true, timeStr = '07:30') {
  try {
    // 1. Save preferences locally on phone as a fail-safe
    await AsyncStorage.setItem(BRIEFING_KEY, JSON.stringify({ enabled, timeStr }));

    // 2. Clear existing morning briefing alarms to avoid duplicates
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.type === 'morning_briefing') {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    // 3. If turned off in settings, stop here
    if (!enabled) {
      console.log("[DEBUG] Morning briefing disabled by user. Alarm cancelled.");
      return;
    }

    // 4. Parse custom hour & minute
    let hour = 7;
    let minute = 30;
    if (timeStr && timeStr.includes(':')) {
      const parts = timeStr.split(':');
      hour = parseInt(parts[0], 10) || 7;
      minute = parseInt(parts[1], 10) || 30;
    }

    // 5. Schedule repeating daily notification at your exact custom time
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "☀️ Good Morning!",
        body: "Tap to open Get Handyman and check your jobs, route, and alerts for today.",
        sound: 'default',
        data: { type: 'morning_briefing' },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });

    console.log(`[DEBUG] Custom Morning Alarm set for ${hour}:${minute.toString().padStart(2, '0')} daily.`);
  } catch (error) {
    console.log("[DEBUG] Failed to schedule morning briefing alarm:", error);
  }
}

export async function getSavedBriefingPref() {
  try {
    const raw = await AsyncStorage.getItem(BRIEFING_KEY);
    return raw ? JSON.parse(raw) : { enabled: true, timeStr: '07:30' };
  } catch {
    return { enabled: true, timeStr: '07:30' };
  }
}