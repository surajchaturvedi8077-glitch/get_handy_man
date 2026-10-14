import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true }),
  });
} catch (e) { console.log("Notification handler skipped."); }

export async function getExpoPushToken() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alerts-v2', {
      name: 'High Priority Alerts', importance: Notifications.AndroidImportance.MAX, vibrationPattern: [0, 250, 250, 250], lightColor: '#F5821F', lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC, 
    });
  }
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') { const { status } = await Notifications.requestPermissionsAsync(); finalStatus = status; }
    if (finalStatus !== 'granted') return null;
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: '9bc67899-cae6-4259-ba01-5d512cb0fb8e' });
    return tokenData.data;
  } catch (error) { return null; }
}

export async function syncLocalNotifications(upcomingJobs) {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.identifier.startsWith('job-remind-')) await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
    upcomingJobs.forEach(async (job) => {
      if (!job.scheduledDate) return;
      const jobTime = new Date(job.scheduledDate).getTime();
      const oneHourBefore = jobTime - (60 * 60 * 1000);
      if (oneHourBefore > Date.now()) {
        await Notifications.scheduleNotificationAsync({
          identifier: `job-remind-${job._id}`,
          content: { title: "Leaving Soon ⏳", body: `You have a job at ${job.address || 'client'} in 1 hour.`, sound: true, channelId: 'alerts-v2' },
          trigger: { date: new Date(oneHourBefore) },
        });
      }
    });
  } catch (e) {}
}

const BRIEFING_KEY = 'gh_briefing_pref';

// DEEP FIX: Schedules 7 days of DYNAMIC summaries based on your actual jobs array
export async function scheduleDailyMorningBriefing(enabled = true, timeStr = '07:30', allJobs = []) {
  try {
    await AsyncStorage.setItem(BRIEFING_KEY, JSON.stringify({ enabled, timeStr }));

    // 1. Wipe old briefings
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.identifier.startsWith('briefing-') || notif.identifier === 'morning-briefing') {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    if (!enabled) return;

    let hour = 7, minute = 30;
    if (timeStr && timeStr.includes(':')) {
      const parts = timeStr.split(':');
      hour = parseInt(parts[0], 10) || 7;
      minute = parseInt(parts[1], 10) || 30;
    }

    // 2. Loop through the next 7 days and dynamically inject the exact job count
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + i);
      targetDate.setHours(hour, minute, 0, 0);

      if (targetDate.getTime() <= Date.now()) continue;

      const jobsThisDay = allJobs.filter(j => {
        if (!j.scheduledDate || j.status === 'complete') return false;
        const jd = new Date(j.scheduledDate);
        return jd.getFullYear() === targetDate.getFullYear() && jd.getMonth() === targetDate.getMonth() && jd.getDate() === targetDate.getDate();
      });

      const count = jobsThisDay.length;
      const bodyText = count > 0 
        ? `You have ${count} job${count > 1 ? 's' : ''} assigned for today. Tap to view your route.` 
        : `Your schedule is clear for today!`;

      await Notifications.scheduleNotificationAsync({
        identifier: `briefing-${i}`,
        content: { title: "☀️ Morning Summary", body: bodyText, sound: 'default', data: { type: 'morning_briefing' } },
        trigger: { date: targetDate },
      });
    }
  } catch (error) { console.log("Failed briefing", error); }
}

export async function getSavedBriefingPref() {
  try {
    const raw = await AsyncStorage.getItem(BRIEFING_KEY);
    return raw ? JSON.parse(raw) : { enabled: true, timeStr: '07:30' };
  } catch { return { enabled: true, timeStr: '07:30' }; }
}