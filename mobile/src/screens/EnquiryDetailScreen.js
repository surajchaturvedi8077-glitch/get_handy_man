/**
 * EnquiryDetailScreen.js
 * ------------------------------------------------------------------
 * Owns useEnquiry() for one enquiry and wires its actions (reject,
 * send quote, accept) into EnquiryDetail. On accept, jumps straight
 * to the new job's detail screen in the Jobs tab.
 * ------------------------------------------------------------------
 */
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ScreenHeader from '../components/layout/ScreenHeader';
import EnquiryDetail from '../components/enquiries/EnquiryDetail';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import useEnquiry from '../hooks/useEnquiry';
import useToast from '../hooks/useToast';

export default function EnquiryDetailScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { enquiry, loading, error, reject, sendQuote, accept } = useEnquiry(params.id);

  async function handleReject() {
    await reject();
    showToast('Enquiry rejected');
    navigation.goBack();
  }

  async function handleSendQuote(items) {
    await sendQuote(items);
    showToast('Quote sent');
  }

  async function handleAccept() {
    const { job } = await accept();
    showToast('Job created from enquiry');
    navigation.getParent()?.navigate('Jobs', { screen: 'JobDetail', params: { id: job._id } });
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="ENQUIRY" subtitle={enquiry?.name} />
      <ScrollView contentContainerStyle={styles.content}>
        {loading && <LoadingState />}
        {error && <ErrorState>{error}</ErrorState>}
        {enquiry && (
          <EnquiryDetail
            enquiry={enquiry}
            onReject={handleReject}
            onSendQuote={handleSendQuote}
            onAccept={handleAccept}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
});
