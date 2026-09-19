import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuth from '../hooks/useAuth';
import useEnquiries from '../hooks/useEnquiries';
import useJobs from '../hooks/useJobs';
import useInvoices from '../hooks/useInvoices';
import JobListItem from '../components/jobs/JobListItem';
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

  const { enquiries: newEnquiries } = useEnquiries('new');
  const { jobs } = useJobs('all');
  const { invoices: unpaidInvoices } = useInvoices('unpaid');

  const today = new Date();
  const isToday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  const todaysJobs = jobs
    .filter(j => j.status !== 'complete' && isToday(j.scheduledDate))
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  const needsDetailsCount = todaysJobs.filter(j => j.needsDetails).length;
  const confirmedCount = todaysJobs.filter(j => j.status === 'confirmed').length;

  const todayOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const todayStr = new Date().toLocaleDateString('en-US', todayOptions);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hi, {user?.name?.split(' ')[0] || 'Worker'}</Text>
            <Text style={styles.dateSub}>{todayStr}</Text>
          </View>
          <View style={styles.headerActions}>
            {/* Navigates to the new Customers CRM screen */}
            <TouchableOpacity style={styles.iconBtnDark} onPress={() => navigation.navigate('Customers')}>
              <Text style={{ fontSize: 14 }}>👥</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnDark} onPress={() => navigation.navigate('Notifications')}>
              <Text style={{ fontSize: 14 }}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnDark} onPress={() => navigation.navigate('Settings')}>
              <Text style={{ fontSize: 14 }}>⚙️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnOrange} onPress={() => navigation.navigate('NewJob')}>
              <Text style={{ fontSize: 16, color: '#fff', fontWeight: 'bold' }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} contentContainerStyle={{ padding: 14 }}>
        <SummaryCard
          big={newEnquiries.length}
          label={newEnquiries.length === 1 ? 'NEW ENQUIRY' : 'NEW ENQUIRIES'}
          sub="From gethandyman.com.au"
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
  header: { backgroundColor: colors.charcoal },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, paddingTop: 6 },
  greeting: { color: '#fff', fontWeight: '800', fontSize: 15 },
  dateSub: { color: '#C7CCD4', fontSize: 10.5, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 7 },
  iconBtnDark: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.charcoal2, alignItems: 'center', justifyContent: 'center' },
  iconBtnOrange: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  card: { borderRadius: 10, padding: 14, marginBottom: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  big: { fontSize: 22, fontWeight: '800' },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  sub: { fontSize: 10.5, marginTop: 2, opacity: 0.85 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: colors.gray, letterSpacing: 0.4, textTransform: 'uppercase', marginVertical: 12 },
  emptyText: { textAlign: 'center', color: colors.gray, marginTop: 10, fontSize: 12 }
});