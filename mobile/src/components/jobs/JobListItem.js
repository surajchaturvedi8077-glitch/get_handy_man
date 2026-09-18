import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Card from '../ui/Card';
import JobStatusBadge from './JobStatusBadge';
import { colors } from '../../theme/colors';

export default function JobListItem({ job }) {
  const navigation = useNavigation();
  
  // Safely display the array, or fall back to old string, or 'None'
  const serviceText = (job.services && job.services.length > 0) 
    ? job.services.join(', ') 
    : (job.service || 'None');

  return (
    <Card
      onPress={() => navigation.navigate('JobDetail', { id: job._id })}
      style={job.needsDetails ? styles.needsDetails : undefined}
    >
      <View style={styles.top}>
        <Text style={styles.when}>{job.when}</Text>
        <JobStatusBadge job={job} />
      </View>
      <Text style={styles.customer}>{job.name} — {serviceText}</Text>
      <Text style={styles.address}>{job.address}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  needsDetails: { borderColor: colors.orange },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  when: { fontWeight: '800', fontSize: 13.5 },
  customer: { fontSize: 12, color: colors.charcoal2, marginTop: 4 },
  address: { fontSize: 10.5, color: colors.gray, marginTop: 4 },
});