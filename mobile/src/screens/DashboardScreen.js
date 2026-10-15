import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuth from '../hooks/useAuth';
import useEnquiries from '../hooks/useEnquiries';
import useJobs from '../hooks/useJobs';
import useInvoices from '../hooks/useInvoices';
import useSettings from '../hooks/useSettings';
import JobListItem from '../components/jobs/JobListItem';
import {
  getExpoPushToken,
  syncLocalNotifications,
  scheduleDailyMorningBriefing,
  getSavedBriefingPref,
} from '../services/notificationService';
import { colors } from '../theme/colors';

const safeTime = (dateStr) => {
  if (!dateStr) return Number.MAX_SAFE_INTEGER;
  const time = new Date(dateStr).getTime();
  return isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
};

function SummaryCard({ big, label, sub, bg, fg, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { backgroundColor: bg }]}>
      <View style={styles.cardTop}>
        <Text style={[styles.big, { color: fg }]}>{big}</Text>
        <Text style={[styles.label, { color: fg }]}>{label}</Text>
      </View>
      <Text style={[styles.sub, { color: fg }]}>{sub}</Text>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { settings, update } = useSettings();

  const { enquiries: newEnquiries } = useEnquiries('new');
  const { jobs } = useJobs('all');
  const { invoices: unpaidInvoices } = useInvoices('unpaid');

  useEffect(() => {
    async function setupNotifications() {
      const token = await getExpoPushToken();
      if (token && settings && settings.expoPushToken !== token) {
        update({ expoPushToken: token });
      }
    }
    setupNotifications();
  }, [settings]);

  const isToday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };

  const todaysJobs = useMemo(() => {
    return jobs
      .filter((j) => j.status !== 'complete' && isToday(j.scheduledDate))
      .sort((a, b) => safeTime(a.scheduledDate) - safeTime(b.scheduledDate));
  }, [jobs]);

  const upcomingJobs = useMemo(() => {
    return jobs
      .filter((j) => j.status !== 'complete' && safeTime(j.scheduledDate) > new Date().setHours(23, 59, 59, 999))
      .sort((a, b) => safeTime(a.scheduledDate) - safeTime(b.scheduledDate))
      .slice(0, 3);
  }, [jobs]);

  const totalPendingJobs = jobs.filter((j) => j.status !== 'complete').length;

  useEffect(() => {
    syncLocalNotifications(jobs);
    getSavedBriefingPref().then((pref) => {
      const enabled = settings?.briefingEnabled ?? pref.enabled ?? true;
      const timeStr = settings?.briefingTime || pref.timeStr || '07:30';
      scheduleDailyMorningBriefing(enabled, timeStr, jobs, unpaidInvoices);
    });
  }, [jobs, unpaidInvoices, settings?.briefingEnabled, settings?.briefingTime]);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.greeting}>Hi, {user?.name?.split(' ')[0] || 'Worker'}</Text>
          <Text style={styles.dateSub}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Customers')}>
            <View style={styles.iconBoxDark}><Text style={styles.iconLarge}>👥</Text></View>
            <Text style={styles.navLabel}>Clients</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Notifications')}>
            <View style={styles.iconBoxDark}>
              <Text style={styles.iconLarge}>🔔</Text>
              {newEnquiries.length > 0 && <View style={styles.alertDot} />}
            </View>
            <Text style={styles.navLabel}>Alerts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
            <View style={styles.iconBoxDark}><Text style={styles.iconLarge}>⚙️</Text></View>
            <Text style={styles.navLabel}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('NewJob')}>
            <View style={styles.iconBoxOrange}><Text style={styles.iconPlus}>+</Text></View>
            <Text style={styles.navLabel}>New Job</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} contentContainerStyle={{ padding: 14 }}>
        <SummaryCard
          big={totalPendingJobs}
          label="OVERALL PENDING JOBS"
          sub={`${unpaidInvoices.length} total unpaid invoices`}
          bg={colors.charcoal2}
          fg="#fff"
          onPress={() => navigation.getParent()?.navigate('Jobs')}
        />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <SummaryCard
              big={newEnquiries.length}
              label={newEnquiries.length === 1 ? 'NEW ENQUIRY' : 'NEW ENQUIRIES'}
              sub="Awaiting quote"
              bg={colors.orangeTint}
              fg={colors.orangeDeep}
              onPress={() => navigation.getParent()?.navigate('Enquiries')}
            />
          </View>
          <View style={{ flex: 1 }}>
            <SummaryCard
              big={todaysJobs.length}
              label="JOBS TODAY"
              sub="Currently scheduled"
              bg={colors.blueTint}
              fg={colors.blue}
              onPress={() => navigation.getParent()?.navigate('Jobs')}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Today's schedule</Text>
        {todaysJobs.length > 0 ? (
          todaysJobs.map((job) => <JobListItem key={job._id} job={job} />)
        ) : (
          <View>
            <Text style={styles.emptyText}>You have a clear schedule today!</Text>
            {upcomingJobs.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>UPCOMING JOBS</Text>
                {upcomingJobs.map((job) => (
                  <JobListItem key={job._id} job={job} />
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.offwhite },
  header: { backgroundColor: colors.charcoal, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 10 },
  headerTop: { marginBottom: 20 },
  greeting: { color: '#fff', fontWeight: '800', fontSize: 18 },
  dateSub: { color: '#C7CCD4', fontSize: 11, marginTop: 4 },
  headerActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
  navItem: { alignItems: 'center', width: '23%' },
  iconBoxDark: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.charcoal2, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  iconBoxOrange: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  iconLarge: { fontSize: 26 },
  iconPlus: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  navLabel: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  alertDot: { position: 'absolute', top: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.red, borderWidth: 2, borderColor: colors.charcoal2 },
  content: { flex: 1 },
  card: { borderRadius: 10, padding: 14, marginBottom: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  big: { fontSize: 22, fontWeight: '800' },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  sub: { fontSize: 10.5, marginTop: 2, opacity: 0.85 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: colors.gray, letterSpacing: 0.4, textTransform: 'uppercase', marginVertical: 12 },
  emptyText: { textAlign: 'center', color: colors.gray, marginTop: 10, fontSize: 12 },
});