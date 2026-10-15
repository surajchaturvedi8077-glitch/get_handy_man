import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHANNEL_ID = 'alerts-v2';
const BRIEFING_KEY = 'gh_briefing_pref';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (e) {
  console.log('Notification handler skipped.');
}

export async function ensureNotificationSetup() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'High Priority Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F5821F',
      sound: 'default',
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function getExpoPushToken() {
  try {
    const granted = await ensureNotificationSetup();
    if (!granted) return null;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '9bc67899-cae6-4259-ba01-5d512cb0fb8e',
    });
    return tokenData.data;
  } catch (error) {
    return null;
  }
}

function buildDateTrigger(targetDate) {
  const dateObj = new Date(targetDate);
  if (Notifications.SchedulableTriggerInputTypes?.DATE) {
    return {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: dateObj,
      channelId: CHANNEL_ID,
    };
  }
  return { date: dateObj, channelId: CHANNEL_ID };
}

function buildDailyTrigger(hour, minute) {
  if (Notifications.SchedulableTriggerInputTypes?.DAILY) {
    return {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: CHANNEL_ID,
    };
  }
  return { hour, minute, repeats: true, channelId: CHANNEL_ID };
}

export async function syncLocalNotifications(allJobs = []) {
  try {
    const granted = await ensureNotificationSetup();
    if (!granted) return;

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.identifier.startsWith('job-remind-')) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    for (const job of allJobs) {
      if (!job.scheduledDate || job.status === 'complete') continue;
      const jobTime = new Date(job.scheduledDate).getTime();
      const oneHourBefore = jobTime - 60 * 60 * 1000;

      if (oneHourBefore > Date.now()) {
        await Notifications.scheduleNotificationAsync({
          identifier: `job-remind-${job._id}`,
          content: {
            title: 'Leaving Soon ⏳',
            body: `Job with ${job.name || 'client'} at ${job.address || 'location'} in 1 hour.`,
            sound: 'default',
            channelId: CHANNEL_ID,
          },
          trigger: buildDateTrigger(oneHourBefore),
        });
      }
    }
  } catch (e) {
    console.log('Could not sync job notifications:', e);
  }
}

export function buildBriefingSummaryText(allJobs = [], unpaidInvoices = [], targetDate = new Date()) {
  const assignedToday = allJobs.filter((j) => {
    if (!j.scheduledDate || j.status === 'complete') return false;
    const jd = new Date(j.scheduledDate);
    return (
      jd.getFullYear() === targetDate.getFullYear() &&
      jd.getMonth() === targetDate.getMonth() &&
      jd.getDate() === targetDate.getDate()
    );
  });

  const totalAssignedPending = allJobs.filter((j) => j.status !== 'complete').length;
  const unpaidCount = unpaidInvoices.length;

  const parts = [];
  if (assignedToday.length > 0) {
    parts.push(`${assignedToday.length} job(s) scheduled today`);
  } else {
    parts.push('0 jobs scheduled today');
  }
  parts.push(`${totalAssignedPending} total assigned job(s) pending`);
  if (unpaidCount > 0) {
    parts.push(`${unpaidCount} unpaid invoice(s)`);
  }
  return parts.join(' · ');
}

export async function fireInstantBriefingNotification(allJobs = [], unpaidInvoices = []) {
  const granted = await ensureNotificationSetup();
  if (!granted) return false;

  const summaryBody = buildBriefingSummaryText(allJobs, unpaidInvoices, new Date());
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '☀️ Morning Briefing Summary',
      body: summaryBody,
      sound: 'default',
      channelId: CHANNEL_ID,
      data: { type: 'morning_briefing' },
    },
    trigger: null,
  });
  return true;
}

export async function scheduleDailyMorningBriefing(
  enabled = true,
  timeStr = '07:30',
  allJobs = [],
  unpaidInvoices = []
) {
  try {
    await AsyncStorage.setItem(BRIEFING_KEY, JSON.stringify({ enabled, timeStr }));

    const granted = await ensureNotificationSetup();
    if (!granted) return;

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (
        notif.identifier.startsWith('briefing-') ||
        notif.identifier === 'morning-briefing' ||
        notif.content?.data?.type === 'morning_briefing'
      ) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    if (!enabled) return;

    let hour = 7;
    let minute = 30;
    if (timeStr && timeStr.includes(':')) {
      const parts = timeStr.split(':');
      hour = parseInt(parts[0], 10);
      minute = parseInt(parts[1], 10);
      if (isNaN(hour)) hour = 7;
      if (isNaN(minute)) minute = 30;
    }

    // 1. Schedule 7 days of specific date alarms with exact job counts
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + i);
      targetDate.setHours(hour, minute, 0, 0);

      if (targetDate.getTime() <= Date.now()) continue;

      const bodyText = buildBriefingSummaryText(allJobs, unpaidInvoices, targetDate);

      await Notifications.scheduleNotificationAsync({
        identifier: `briefing-${i}`,
        content: {
          title: '☀️ Morning Summary',
          body: bodyText,
          sound: 'default',
          channelId: CHANNEL_ID,
          data: { type: 'morning_briefing' },
        },
        trigger: buildDateTrigger(targetDate),
      });
    }

    // 2. Also schedule a repeating daily fallback alarm
    await Notifications.scheduleNotificationAsync({
      identifier: 'morning-briefing',
      content: {
        title: '☀️ Daily Trady Briefing',
        body: buildBriefingSummaryText(allJobs, unpaidInvoices, new Date()),
        sound: 'default',
        channelId: CHANNEL_ID,
        data: { type: 'morning_briefing' },
      },
      trigger: buildDailyTrigger(hour, minute),
    });
  } catch (error) {
    console.log('Failed briefing schedule:', error);
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