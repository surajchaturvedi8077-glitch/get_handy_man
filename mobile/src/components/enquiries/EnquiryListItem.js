/**
 * EnquiryListItem.js
 * ------------------------------------------------------------------
 * One row in the enquiries list: name, status chip, service, and
 * when it was received. Tapping navigates to the detail screen.
 * ------------------------------------------------------------------
 */
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Card from '../ui/Card';
import Chip from '../ui/Chip';
import { colors } from '../../theme/colors';

const CHIP_TONE = { new: 'orange', quoted: 'blue', accepted: 'green', rejected: 'red' };

export default function EnquiryListItem({ enquiry }) {
  const navigation = useNavigation();
  return (
    <Card onPress={() => navigation.navigate('EnquiryDetail', { id: enquiry._id })}>
      <View style={styles.top}>
        <Text style={styles.name}>{enquiry.name}</Text>
        <Chip tone={CHIP_TONE[enquiry.status] || 'orange'}>
          {enquiry.status[0].toUpperCase() + enquiry.status.slice(1)}
        </Chip>
      </View>
      <Text style={styles.service}>{enquiry.service}</Text>
      <View style={styles.bottom}>
        <Text style={styles.meta}>{enquiry.when}</Text>
        <Text style={styles.meta}>{new Date(enquiry.received).toLocaleDateString()}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: '800', fontSize: 13.5 },
  service: { fontSize: 12, color: colors.charcoal2, marginTop: 4 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  meta: { fontSize: 10.5, color: colors.gray },
});
