import React from 'react';
import { View, ScrollView, StyleSheet, Alert, Text } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ScreenHeader from '../components/layout/ScreenHeader';
import EnquiryDetail from '../components/enquiries/EnquiryDetail';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import useEnquiry from '../hooks/useEnquiry';
import useToast from '../hooks/useToast';
import { apiClient, unwrap } from '../services/apiClient';
import { colors } from '../theme/colors';

export default function EnquiryDetailScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { showToast } = useToast();
  
  // Notice we pull 'refresh' from useEnquiry so we can instantly reload the screen after restoring
  const { enquiry, loading, error, reject, sendQuote, accept, refresh } = useEnquiry(params.id);

  async function handleReject() {
    await reject();
    showToast('Enquiry rejected');
  }

  // FIXED: The Restore/Reactivate handler
  async function handleReactivate() {
    try {
      // Force the database status back to 'new'
      await unwrap(apiClient.put(`/api/enquiries/${params.id}`, { status: 'new' }));
      showToast('Enquiry Restored!');
      refresh(); // Reload the data so the UI updates instantly
    } catch (e) {
      Alert.alert("Error", "Could not restore the enquiry.");
    }
  }

  async function handleDelete() {
    Alert.alert("Delete Enquiry", "Are you sure you want to permanently delete this enquiry?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await unwrap(apiClient.delete(`/api/enquiries/${params.id}`));
            showToast('Enquiry deleted');
            navigation.goBack();
          } catch (e) {
            Alert.alert("Error", "Could not delete enquiry.");
          }
      }}
    ]);
  }

  async function handleSendQuote(items) {
    await sendQuote(items);
    showToast('Quote sent');
  }

  async function handleAccept() {
    try {
      const { job } = await accept();
      showToast('Job created from enquiry');
      navigation.getParent()?.navigate('Jobs', { screen: 'JobDetail', params: { id: job._id } });
    } catch (e) {
      Alert.alert("Error", "Could not accept enquiry.");
    }
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="ENQUIRY" subtitle={enquiry?.name} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {loading && <LoadingState />}
        {error && <ErrorState>{error}</ErrorState>}
        
        {enquiry && (
          <EnquiryDetail
            enquiry={enquiry}
            onReject={handleReject}
            onSendQuote={handleSendQuote}
            onAccept={handleAccept}
            onReactivate={handleReactivate} // Passed the function down to the button here
          />
        )}

        {enquiry && (
          <Button variant="outline" style={{ borderColor: colors.red, marginTop: 20 }} onPress={handleDelete}>
            <Text style={{ color: colors.red, fontWeight: '700' }}>🗑️ Delete Enquiry</Text>
          </Button>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
});