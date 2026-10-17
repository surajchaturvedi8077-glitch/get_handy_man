import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHANNEL_ID = 'alerts-v2';
const BRIEFING_KEY = 'gh_briefing_pref';
const SEEN_ENQUIRIES_KEY = 'gh_seen_enquiry_ids_v1';

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
      bypassDnd: true,
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

// Forces the notification to appear directly on the lock screen with heads-up banner display
export async function notifyNewEnquiry(enquiry) {
  try {
    if (!enquiry) return;
    const granted = await ensureNotificationSetup();
    if (!granted) return;

    if (enquiry._id) {
      const raw = await AsyncStorage.getItem(SEEN_ENQUIRIES_KEY);
      const seenIds = raw ? JSON.parse(raw) : [];
      if (!seenIds.includes(String(enquiry._id))) {
        seenIds.push(String(enquiry._id));
        await AsyncStorage.setItem(SEEN_ENQUIRIES_KEY, JSON.stringify(seenIds.slice(-200)));
      }
    }

    const serviceName =
      (Array.isArray(enquiry.services) && enquiry.services[0]) ||
      enquiry.service ||
      'Handyman Service';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📩 New Enquiry Received!',
        body: `${enquiry.name || 'New Customer'} requested ${serviceName}${enquiry.address ? ` at ${enquiry.address}` : ''}.`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        channelId: CHANNEL_ID,
        data: { type: 'new_enquiry', enquiryId: String(enquiry._id || '') },
      },
      trigger: null, // Triggers immediately on the lock screen
    });
  } catch (e) {
    console.log('Failed to fire lock screen notification:', e);
  }
}

export async function checkAndNotifyNewEnquiries(enquiries = []) {
  try {
    if (!Array.isArray(enquiries) || enquiries.length === 0) return;

    const pureEnquiries = enquiries.filter(
      (e) =>
        !e.isQuote &&
        !(e.when && String(e.when).startsWith('#GH-')) &&
        e.status !== 'quoted'
    );

    const raw = await AsyncStorage.getItem(SEEN_ENQUIRIES_KEY);
    if (!raw) {
      const initialIds = pureEnquiries.map((e) => String(e._id));
      await AsyncStorage.setItem(SEEN_ENQUIRIES_KEY, JSON.stringify(initialIds));
      return;
    }

    const seenIds = JSON.parse(raw);
    const unseen = pureEnquiries.filter((e) => e._id && !seenIds.includes(String(e._id)));

    if (unseen.length > 0) {
      const updatedIds = [...seenIds, ...unseen.map((e) => String(e._id))].slice(-200);
      await AsyncStorage.setItem(SEEN_ENQUIRIES_KEY, JSON.stringify(updatedIds));

      for (const item of unseen) {
        await notifyNewEnquiry(item);
      }
    }
  } catch (e) {
    console.log('Error checking new enquiries:', e);
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
            priority: Notifications.AndroidNotificationPriority.MAX,
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
      priority: Notifications.AndroidNotificationPriority.MAX,
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
          priority: Notifications.AndroidNotificationPriority.MAX,
          channelId: CHANNEL_ID,
          data: { type: 'morning_briefing' },
        },
        trigger: buildDateTrigger(targetDate),
      });
    }

    await Notifications.scheduleNotificationAsync({
      identifier: 'morning-briefing',
      content: {
        title: '☀️ Daily Trady Briefing',
        body: buildBriefingSummaryText(allJobs, unpaidInvoices, new Date()),
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
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