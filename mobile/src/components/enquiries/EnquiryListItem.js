import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Card from '../ui/Card';
import Chip from '../ui/Chip';
import { colors } from '../../theme/colors';

const CHIP_TONE = { new: 'orange', quoted: 'blue', accepted: 'green', rejected: 'red' };

export default function EnquiryListItem({ enquiry }) {
  const navigation = useNavigation();
  
  const serviceText = (enquiry.services && enquiry.services.length > 0) 
    ? enquiry.services.join(', ') 
    : (enquiry.service || 'No service specified');

  return (
    <Card onPress={() => navigation.navigate('EnquiryDetail', { id: enquiry._id })}>
      <View style={styles.top}>
        <Text style={styles.name}>{enquiry.name}</Text>
        <Chip tone={CHIP_TONE[enquiry.status] || 'orange'}>
          {enquiry.status[0].toUpperCase() + enquiry.status.slice(1)}
        </Chip>
      </View>
      <Text style={styles.service}>{serviceText}</Text>
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