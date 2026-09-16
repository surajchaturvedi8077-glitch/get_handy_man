/**
 * JobSummaryCard.js
 * ------------------------------------------------------------------
 * Read-only summary shown once a job's details are saved: service,
 * schedule, address, contact info, labour, and notes.
 * ------------------------------------------------------------------
 */
import { View, Text, StyleSheet } from 'react-native';
import { money } from '../../utils/money';
import { colors } from '../../theme/colors';

export default function JobSummaryCard({ job }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.service}>{job.service}</Text>
      <Text style={styles.when}>{job.when}</Text>
      <View style={styles.details}>
        <Text style={styles.detail}>{job.address}</Text>
        {job.phone ? <Text style={styles.detail}>{job.phone}</Text> : null}
        {job.email ? <Text style={styles.detail}>{job.email}</Text> : null}
        <Text style={styles.detail}>Labour: {money(job.labour)}</Text>
      </View>
      {job.notes ? <Text style={styles.notes}>{job.notes}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 6 },
  service: { fontWeight: '800', fontSize: 16 },
  when: { fontSize: 13, color: colors.charcoal2, marginTop: 2 },
  details: { marginTop: 8, gap: 3 },
  detail: { fontSize: 12, color: colors.gray },
  notes: {
    marginTop: 10,
    padding: 12,
    backgroundColor: colors.offwhite,
    borderRadius: 8,
    fontSize: 12.5,
    color: colors.charcoal2,
  },
});
