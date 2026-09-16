/**
 * EnquirySummaryCard.js
 * ------------------------------------------------------------------
 * Read-only summary of an enquiry's contact + job details, shown at
 * the top of the enquiry detail screen.
 * ------------------------------------------------------------------
 */
import { View, Text, StyleSheet } from 'react-native';
import Chip from '../ui/Chip';
import { colors } from '../../theme/colors';

const CHIP_TONE = { new: 'orange', quoted: 'blue', accepted: 'green', rejected: 'red' };

export default function EnquirySummaryCard({ enquiry }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <Text style={styles.name}>{enquiry.name}</Text>
        <Chip tone={CHIP_TONE[enquiry.status] || 'orange'}>
          {enquiry.status[0].toUpperCase() + enquiry.status.slice(1)}
        </Chip>
      </View>
      <Text style={styles.service}>{enquiry.service}</Text>
      <View style={styles.details}>
        {enquiry.phone ? <Text style={styles.detail}>{enquiry.phone}</Text> : null}
        {enquiry.email ? <Text style={styles.detail}>{enquiry.email}</Text> : null}
        {(enquiry.address || enquiry.suburb) && (
          <Text style={styles.detail}>{[enquiry.address, enquiry.suburb].filter(Boolean).join(', ')}</Text>
        )}
        {enquiry.when ? <Text style={styles.detail}>Preferred: {enquiry.when}</Text> : null}
      </View>
      {enquiry.message ? <Text style={styles.message}>{enquiry.message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: '800', fontSize: 16 },
  service: { fontSize: 13, color: colors.charcoal2, marginTop: 4 },
  details: { marginTop: 8, gap: 3 },
  detail: { fontSize: 12, color: colors.gray },
  message: {
    marginTop: 10,
    padding: 12,
    backgroundColor: colors.offwhite,
    borderRadius: 8,
    fontSize: 12.5,
    color: colors.charcoal2,
  },
});
