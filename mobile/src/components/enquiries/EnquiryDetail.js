import { View, Text, StyleSheet } from 'react-native';
import EnquirySummaryCard from './EnquirySummaryCard';
import QuoteComposer from './QuoteComposer';
import EnquiryActions from './EnquiryActions';
import Button from '../ui/Button';
import { money } from '../../utils/money';
import { colors } from '../../theme/colors';

export default function EnquiryDetail({ enquiry, onReject, onSendQuote, onAccept, onReactivate }) {
  return (
    <View>
      <EnquirySummaryCard enquiry={enquiry} />

      {enquiry.status === 'new' && (
        <>
          <QuoteComposer initialItems={enquiry.quoteItems} onSend={onSendQuote} />
          <Button variant="outline" onPress={onReject} style={styles.rejectBtn}>
            Reject enquiry
          </Button>
        </>
      )}

      {enquiry.status === 'quoted' && (
        <>
          <Text style={styles.quoted}>Quoted: {money(enquiry.price)}</Text>
          <EnquiryActions onReject={onReject} onAccept={onAccept} acceptLabel="Mark accepted & create job" />
        </>
      )}

      {enquiry.status === 'accepted' && (
        <Text style={styles.note}>This enquiry is accepted and linked to a job.</Text>
      )}

      {enquiry.status === 'rejected' && (
        <>
          <Text style={styles.noteError}>This enquiry was previously rejected.</Text>
          {/* Feature 4: Reactivate rejected enquiry */}
          <Button variant="primary" onPress={onReactivate} style={{ marginTop: 12 }}>
            Reactivate & Edit Details
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rejectBtn: { marginTop: 10 },
  quoted: { fontWeight: '800', fontSize: 15, marginVertical: 10 },
  note: { fontSize: 12.5, color: colors.green, fontWeight: '700', marginTop: 10 },
  noteError: { fontSize: 12.5, color: colors.red, fontWeight: '700', marginTop: 10 },
});