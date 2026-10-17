import React, { useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
  checkAndNotifyNewEnquiries,
} from '../services/notificationService';
import { colors } from '../theme/colors';

const safeTime = (dateStr) => {
  if (!dateStr) return Number.MAX_SAFE_INTEGER;
  const time = new Date(dateStr).getTime();
  return isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
};

function SummaryCard({ big, label, sub, bg, fg, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
        style={[styles.card, { backgroundColor: bg }]}
      >
        <View style={styles.cardTop}>
          <Text style={[styles.big, { color: fg }]}>{big}</Text>
          <Text style={[styles.label, { color: fg }]}>{label}</Text>
        </View>
        <Text style={[styles.sub, { color: fg }]}>{sub}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { settings, update } = useSettings();

  const { enquiries: rawNewEnquiries, refresh: refreshEnquiries } = useEnquiries('new');
  const { jobs } = useJobs('all');
  const { invoices: unpaidInvoices } = useInvoices('unpaid');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const newEnquiries = useMemo(() => {
    return (rawNewEnquiries || []).filter(
      (e) => !e.isQuote && !(e.when && String(e.when).startsWith('#GH-')) && e.status !== 'quoted'
    );
  }, [rawNewEnquiries]);

  useFocusEffect(
    useCallback(() => {
      refreshEnquiries();
      const interval = setInterval(() => {
        refreshEnquiries();
      }, 15000);
      return () => clearInterval(interval);
    }, [refreshEnquiries])
  );

  useEffect(() => {
    if (newEnquiries.length > 0) {
      checkAndNotifyNewEnquiries(newEnquiries);
    }
  }, [newEnquiries]);

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

        {/* 3 Header Actions (Removed + New Job button as requested) */}
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Customers')}>
            <View style={styles.iconBoxBlue}><Text style={styles.iconLarge}>👥</Text></View>
            <Text style={styles.navLabel}>Clients</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Notifications')}>
            <View style={styles.iconBoxBlue}>
              <Text style={styles.iconLarge}>🔔</Text>
              {newEnquiries.length > 0 && <View style={styles.alertDot} />}
            </View>
            <Text style={styles.navLabel}>Alerts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
            <View style={styles.iconBoxBlue}><Text style={styles.iconLarge}>⚙️</Text></View>
            <Text style={styles.navLabel}>Settings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} contentContainerStyle={{ padding: 14 }}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <SummaryCard
            big={totalPendingJobs}
            label="OVERALL ASSIGNED JOBS"
            sub={`${unpaidInvoices.length} total unpaid invoices`}
            bg="#1565D8"
            fg="#fff"
            onPress={() => navigation.getParent()?.navigate('Jobs')}
          />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <SummaryCard
                big={newEnquiries.length}
                label={newEnquiries.length === 1 ? 'NEW ENQUIRY' : 'NEW ENQUIRIES'}
                sub="Awaiting action"
                bg="#E0F2FE"
                fg="#0369A1"
                onPress={() => navigation.getParent()?.navigate('Enquiries')}
              />
            </View>
            <View style={{ flex: 1 }}>
              <SummaryCard
                big={todaysJobs.length}
                label="JOBS TODAY"
                sub="Currently scheduled"
                bg={colors.blueTint}
                fg={colors.orangeDeep}
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
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.offwhite },
  header: { backgroundColor: colors.charcoal, paddingHorizontal: 16, paddingBottom: 18, paddingTop: 10 },
  headerTop: { marginBottom: 18 },
  greeting: { color: '#fff', fontWeight: '800', fontSize: 20 },
  dateSub: { color: '#94A3B8', fontSize: 11.5, marginTop: 4 },
  headerActions: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 12 },
  navItem: { alignItems: 'center', width: '30%' },
  iconBoxBlue: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconLarge: { fontSize: 25 },
  navLabel: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  alertDot: { position: 'absolute', top: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.red, borderWidth: 2, borderColor: colors.charcoal2 },
  content: { flex: 1 },
  card: { borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2, shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  cardTop: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  big: { fontSize: 24, fontWeight: '800' },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  sub: { fontSize: 11, marginTop: 3, opacity: 0.9 },
  sectionLabel: { fontSize: 10.5, fontWeight: '800', color: colors.gray, letterSpacing: 0.5, textTransform: 'uppercase', marginVertical: 12 },
  emptyText: { textAlign: 'center', color: colors.gray, marginTop: 10, fontSize: 12.5 },
});