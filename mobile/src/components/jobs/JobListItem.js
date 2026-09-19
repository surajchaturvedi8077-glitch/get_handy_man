import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Card from '../ui/Card';
import JobStatusBadge from './JobStatusBadge';
import { openEmail } from '../../utils/linking';
import { colors } from '../../theme/colors';

export default function JobListItem({ job }) {
  const navigation = useNavigation();
  
  // FIXED: Crash-proof check. If it's an old job, it safely falls back to the old string format.
  const serviceText = (Array.isArray(job.services) && job.services.length > 0) 
    ? job.services.join(', ') 
    : (job.service || 'None');

  return (
    <Card
      onPress={() => navigation.navigate('JobDetail', { id: job._id })}
      style={job.needsDetails ? styles.needsDetails : undefined}
    >
      <View style={styles.top}>
        <Text style={styles.when}>{job.when} {job.exactTime ? `· ${job.exactTime}` : ''}</Text>
        <JobStatusBadge job={job} />
      </View>
      <Text style={styles.customer}>{job.name} — {serviceText}</Text>
      
      <View style={styles.bottomRow}>
        <Text style={styles.address}>{job.address}</Text>
        {job.email ? (
          <TouchableOpacity onPress={() => openEmail(job.email)} style={styles.emailBtn}>
            <Text style={styles.emailText}>✉️ Email</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  needsDetails: { borderColor: colors.orange },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  when: { fontWeight: '800', fontSize: 13.5 },
  customer: { fontSize: 12, color: colors.charcoal2, marginTop: 4 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 4 },
  address: { fontSize: 10.5, color: colors.gray, flex: 1, paddingRight: 10 },
  emailBtn: { backgroundColor: colors.blueTint, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  emailText: { fontSize: 10, fontWeight: '700', color: colors.blue }
});