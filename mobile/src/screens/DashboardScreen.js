import React, { useEffect } from 'react';
// IMPORT ALERT
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuth from '../hooks/useAuth';
import useEnquiries from '../hooks/useEnquiries';
import useJobs from '../hooks/useJobs';
import useInvoices from '../hooks/useInvoices';
import useSettings from '../hooks/useSettings';
import JobListItem from '../components/jobs/JobListItem';

import { getExpoPushToken, syncLocalNotifications } from '../services/notificationService';
import { colors } from '../theme/colors';

const safeTime = (dateStr) => {
  if (!dateStr) return 999999999999999;
  const time = new Date(dateStr).getTime();
  return isNaN(time) ? 999999999999999 : time;
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

  // FIXED: Aggressively checks permissions and syncs the push token to your backend
  useEffect(() => {
    async function ensureNotifications() {
      const { status } = await Notifications.getPermissionsAsync();
      
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert(
            "Notifications Disabled 🔕", 
            "You will NOT receive lock-screen alerts for new website enquiries or job reminders! Please open your phone Settings > Apps > Get Handyman and turn on Notifications."
          );
        }
      }

      if (settings) {
        const token = await getExpoPushToken();
        if (token && settings.expoPushToken !== token) {
          update({ expoPushToken: token });
        }
      }
    }
    ensureNotifications();
  }, [settings]);

  const upcomingJobs = jobs
    .filter(j => j.status !== 'complete')
    .sort((a, b) => {
      if (a.needsDetails && !b.needsDetails) return -1;
      if (!a.needsDetails && b.needsDetails) return 1;
      return safeTime(a.scheduledDate) - safeTime(b.scheduledDate);
    });

  useEffect(() => {
    syncLocalNotifications(upcomingJobs, unpaidInvoices);
  }, [upcomingJobs, unpaidInvoices]);

  const needsDetailsCount = upcomingJobs.filter(j => j.needsDetails).length;
  const confirmedCount = upcomingJobs.filter(j => j.status === 'confirmed').length;

  const todayOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const todayStr = new Date().toLocaleDateString('en-US', todayOptions);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.greeting}>Hi, {user?.name?.split(' ')[0] || 'Worker'}</Text>
          <Text style={styles.dateSub}>{todayStr}</Text>
        </View>

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
          big={upcomingJobs.length}
          label="UPCOMING JOBS"
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

        <Text style={styles.sectionLabel}>Upcoming Schedule</Text>
        {upcomingJobs.map((job) => (
          <JobListItem key={job._id} job={job} />
        ))}
        {upcomingJobs.length === 0 && (
          <Text style={styles.emptyText}>No upcoming jobs scheduled.</Text>
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
  emptyText: { textAlign: 'center', color: colors.gray, marginTop: 10, fontSize: 12 }
});