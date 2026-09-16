import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../components/layout/ScreenHeader';
import useJobs from '../hooks/useJobs';
import useInvoices from '../hooks/useInvoices';
import { colors } from '../theme/colors';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { jobs } = useJobs('all');
  const { invoices } = useInvoices('unpaid');

  const todayJobs = jobs.filter(j => j.status !== 'complete'); 
  const unpaidInvoices = invoices.filter(i => i.status === 'unpaid');

  return (
    <View style={styles.screen}>
      <ScreenHeader title="" showBack={false} />
      <View style={styles.timeHeader}>
        <Text style={styles.timeText}>9:41</Text>
        <Text style={styles.dateText}>TODAY'S ALERTS</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {todayJobs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>TODAY'S JOBS</Text>
            {todayJobs.map(job => (
              <TouchableOpacity key={job._id} style={styles.card} onPress={() => navigation.navigate('JobDetail', { id: job._id })}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconBox}><Text style={{fontSize: 10, color: '#fff'}}>🔔</Text></View>
                  <Text style={styles.appName}>GET HANDYMAN</Text>
                  <Text style={styles.timeLabel}>Today</Text>
                </View>
                <Text style={styles.message}>Job with {job.name} — {job.service} at {job.address}.</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {unpaidInvoices.length > 0 && (
           <>
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>UNPAID INVOICES</Text>
            {unpaidInvoices.map(inv => (
              <TouchableOpacity key={inv._id} style={styles.card} onPress={() => navigation.getParent()?.navigate('Invoices', { screen: 'InvoiceDetail', params: { id: inv._id } })}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconBox}><Text style={{fontSize: 10, color: '#fff'}}>🔔</Text></View>
                  <Text style={styles.appName}>GET HANDYMAN</Text>
                  <Text style={styles.timeLabel}>Reminder</Text>
                </View>
                <Text style={styles.message}>Invoice #{inv.number} for {inv.customer} is still unpaid.</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {todayJobs.length === 0 && unpaidInvoices.length === 0 && (
          <Text style={styles.emptyText}>You're all caught up.</Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.backBtnText}>Back to app</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.charcoalDeep },
  timeHeader: { alignItems: 'center', marginTop: 0, paddingBottom: 10 },
  timeText: { color: '#fff', fontSize: 36, fontWeight: '300' },
  dateText: { color: '#9CA6B5', fontSize: 10, letterSpacing: 1, marginTop: 2 },
  content: { padding: 16 },
  sectionTitle: { color: '#9CA6B5', fontSize: 9.5, fontWeight: '700', letterSpacing: 0.6, marginBottom: 10 },
  card: { backgroundColor: '#1E293B', borderRadius: 10, padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  iconBox: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', marginRight: 7 },
  appName: { color: '#9CA6B5', fontSize: 9.5, fontWeight: '700', letterSpacing: 0.5, flex: 1 },
  timeLabel: { color: '#9CA6B5', fontSize: 9.5 },
  message: { color: '#fff', fontSize: 11.5, lineHeight: 18 },
  emptyText: { textAlign: 'center', color: '#9CA6B5', fontSize: 12, marginTop: 40 },
  footer: { alignItems: 'center', paddingVertical: 18 },
  backBtn: { backgroundColor: colors.charcoal2, paddingVertical: 9, paddingHorizontal: 18, borderRadius: 20 },
  backBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' }
});