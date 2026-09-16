/**
 * EnquiryDetail.js
 * ------------------------------------------------------------------
 * Composes the small enquiry-detail pieces (summary card, quote
 * composer, accept/reject actions) based on the enquiry's status.
 * Holds no logic of its own — every action is passed down from
 * EnquiryDetailScreen, which owns the useEnquiry() hook.
 * ------------------------------------------------------------------
 */
import { View, Text, StyleSheet } from 'react-native';
import EnquirySummaryCard from './EnquirySummaryCard';
import QuoteComposer from './QuoteComposer';
import EnquiryActions from './EnquiryActions';
import Button from '../ui/Button';
import { money } from '../../utils/money';
import { colors } from '../../theme/colors';

export default function EnquiryDetail({ enquiry, onReject, onSendQuote, onAccept }) {
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

      {(enquiry.status === 'accepted' || enquiry.status === 'rejected') && (
        <Text style={styles.note}>This enquiry is {enquiry.status}. No further action needed here.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rejectBtn: { marginTop: 10 },
  quoted: { fontWeight: '800', fontSize: 15, marginVertical: 10 },
  note: { fontSize: 12.5, color: colors.gray },
});
