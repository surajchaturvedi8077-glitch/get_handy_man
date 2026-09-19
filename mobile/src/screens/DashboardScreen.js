import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuth from '../hooks/useAuth';
import useEnquiries from '../hooks/useEnquiries';
import useJobs from '../hooks/useJobs';
import useInvoices from '../hooks/useInvoices';
import useSettings from '../hooks/useSettings';
import JobListItem from '../components/jobs/JobListItem';
import { getExpoPushToken, scheduleLocalJobReminder } from '../services/notificationService';
import { colors } from '../theme/colors';

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

  // NEW: Instantly syncs this phone's notification token to the backend
  useEffect(() => {
    async function syncPushToken() {
      if (settings && !settings.expoPushToken) {
        const token = await getExpoPushToken();
        if (token) {
          update({ expoPushToken: token });
        }
      }
    }
    syncPushToken();
  }, [settings]);

  const today = new Date();
  const isToday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  const todaysJobs = jobs
    .filter(j => j.status !== 'complete' && isToday(j.scheduledDate))
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  // Auto-schedule local reminders for today's jobs
  useEffect(() => {
    todaysJobs.forEach(job => scheduleLocalJobReminder(job));
  }, [todaysJobs]);

  const needsDetailsCount = todaysJobs.filter(j => j.needsDetails).length;
  const confirmedCount = todaysJobs.filter(j => j.status === 'confirmed').length;

  const todayOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const todayStr = new Date().toLocaleDateString('en-US', todayOptions);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.greeting}>Hi, {user?.name?.split(' ')[0] || 'Worker'}</Text>
          <Text style={styles.dateSub}>{todayStr}</Text>
        </View>

        {/* REDESIGNED: Large Icons with Labels and Proper Spacing */}
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Customers')}>
            <View style={styles.iconBoxDark}><Text style={styles.iconLarge}>👥</Text></View>
            <Text style={styles.navLabel}>Clients</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Notifications')}>
            <View style={styles.iconBoxDark}>
              <Text style={styles.iconLarge}>🔔</Text>
              {(newEnquiries.length > 0) && <View style={styles.alertDot} />}
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
          big={newEnquiries.length}
          label={newEnquiries.length === 1 ? 'NEW ENQUIRY' : 'NEW ENQUIRIES'}
          sub="From website or directly"
          bg={colors.orangeTint}
          fg={colors.orangeDeep}
          onPress={() => navigation.getParent()?.navigate('Enquiries')}
        />

        <SummaryCard
          big={todaysJobs.length}
          label="JOBS TODAY"
          sub={`${confirmedCount} confirmed · ${needsDetailsCount} need details`}
          bg={colors.blueTint}
          fg={colors.blue}
          onPress={() => navigation.getParent()?.navigate('Jobs')}
        />

        {unpaidInvoices.length > 0 && (
          <SummaryCard
            big={unpaidInvoices.length}
            label={unpaidInvoices.length === 1 ? 'UNPAID INVOICE' : 'UNPAID INVOICES'}
            sub="Tap to review & follow up"
            bg={colors.redTint}
            fg={colors.red}
            onPress={() => navigation.getParent()?.navigate('Invoices')}
          />
        )}

        <Text style={styles.sectionLabel}>Today's schedule</Text>
        {todaysJobs.map((job) => (
          <JobListItem key={job._id} job={job} />
        ))}
        {todaysJobs.length === 0 && (
          <Text style={styles.emptyText}>No jobs scheduled for today.</Text>
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
  navItem: { alignItems: 'center' },
  iconBoxDark: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.charcoal2, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  iconBoxOrange: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  iconLarge: { fontSize: 20 },
  iconPlus: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  navLabel: { color: '#fff', fontSize: 10, fontWeight: '700' },
  alertDot: { position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.red, borderWidth: 2, borderColor: colors.charcoal2 },

  content: { flex: 1 },
  card: { borderRadius: 10, padding: 14, marginBottom: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  big: { fontSize: 22, fontWeight: '800' },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  sub: { fontSize: 10.5, marginTop: 2, opacity: 0.85 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: colors.gray, letterSpacing: 0.4, textTransform: 'uppercase', marginVertical: 12 },
  emptyText: { textAlign: 'center', color: colors.gray, marginTop: 10, fontSize: 12 }
});