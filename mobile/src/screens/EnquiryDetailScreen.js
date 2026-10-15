import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Text, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ScreenHeader from '../components/layout/ScreenHeader';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import FieldLabel from '../components/ui/FieldLabel';
import Chip from '../components/ui/Chip';
import AddressAutocomplete from '../components/ui/AddressAutocomplete';
import useEnquiry from '../hooks/useEnquiry';
import useToast from '../hooks/useToast';
import { apiClient, unwrap } from '../services/apiClient';
import * as jobService from '../services/jobService';
import { colors } from '../theme/colors';

const CHIP_TONE = { new: 'orange', accepted: 'green', rejected: 'red' };

export default function EnquiryDetailScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { showToast } = useToast();

  const { enquiry, loading, error, reject, accept, refresh } = useEnquiry(params.id);

  const [localName, setLocalName] = useState('');
  const [localPhone, setLocalPhone] = useState('');
  const [localEmail, setLocalEmail] = useState('');
  const [localAddress, setLocalAddress] = useState('');
  const [localService, setLocalService] = useState('');
  const [localNotes, setLocalNotes] = useState('');
  const [savingCustomer, setSavingCustomer] = useState(false);

  useEffect(() => {
    if (enquiry) {
      setLocalName(enquiry.name || '');
      setLocalPhone(enquiry.phone || '');
      setLocalEmail(enquiry.email || '');
      setLocalAddress(enquiry.address || '');
      setLocalService(
        Array.isArray(enquiry.services) && enquiry.services.length > 0
          ? enquiry.services.join(', ')
          : enquiry.service || ''
      );
      setLocalNotes(enquiry.notes || '');
    }
  }, [enquiry]);

  const handleUpdateCustomer = async () => {
    Keyboard.dismiss();
    setSavingCustomer(true);
    try {
      await unwrap(
        apiClient.put(`/api/enquiries/${params.id}`, {
          name: localName,
          phone: localPhone,
          email: localEmail,
          address: localAddress,
          service: localService,
          services: localService ? [localService] : [],
          notes: localNotes,
        })
      );
      showToast('✅ Enquiry details saved!');
      refresh();
    } catch (e) {
      Alert.alert('Error', 'Failed to save enquiry details');
    } finally {
      setSavingCustomer(false);
    }
  };

  const handleAccept = async () => {
    try {
      await handleUpdateCustomer();
      const { job } = await accept();
      showToast('Job created from enquiry');
      refresh();
      navigation.getParent()?.navigate('Jobs', {
        screen: 'JobDetail',
        params: { id: String(job._id) },
        initial: false,
      });
    } catch (e) {
      Alert.alert('Backend Error', e?.response?.data?.message || 'Could not accept enquiry.');
    }
  };

  const openLinkedJob = async (jobIdToOpen) => {
    const cleanId = String(jobIdToOpen?._id || jobIdToOpen || '');
    if (!cleanId) return handleAccept();
    try {
      await jobService.getJob(cleanId);
      navigation.getParent()?.navigate('Jobs', {
        screen: 'JobDetail',
        params: { id: cleanId },
        initial: false,
      });
    } catch (err) {
      handleAccept();
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="ENQUIRY DETAILS" subtitle={enquiry?.name} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 150 }]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >
          {loading && <LoadingState />}
          {error && <ErrorState>{error}</ErrorState>}

          {enquiry && (
            <>
              <View style={styles.top}>
                <Chip tone={CHIP_TONE[enquiry.status] || 'orange'}>
                  {enquiry.status[0].toUpperCase() + enquiry.status.slice(1)}
                </Chip>
                {enquiry.when ? <Text style={styles.whenText}>Preferred: {enquiry.when}</Text> : null}
              </View>

              {enquiry.message ? (
                <View style={styles.messageBox}>
                  <Text style={styles.messageTitle}>Message from customer:</Text>
                  <Text style={styles.messageText}>"{enquiry.message}"</Text>
                </View>
              ) : null}

              <FieldLabel style={{ marginTop: 14 }}>Customer Name</FieldLabel>
              <TextInput style={styles.input} value={localName} onChangeText={setLocalName} placeholder="Customer Name" />

              <FieldLabel>Phone Number</FieldLabel>
              <TextInput style={styles.input} value={localPhone} onChangeText={setLocalPhone} placeholder="Phone Number" keyboardType="phone-pad" />

              <FieldLabel>Email Address</FieldLabel>
              <TextInput style={styles.input} value={localEmail} onChangeText={setLocalEmail} placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" />

              <FieldLabel>Address</FieldLabel>
              <AddressAutocomplete value={localAddress} onChangeText={setLocalAddress} placeholder="Search Australian address..." />

              <FieldLabel>Requested Service</FieldLabel>
              <TextInput style={styles.input} value={localService} onChangeText={setLocalService} placeholder="Service requested" />

              <FieldLabel style={{ marginTop: 10 }}>Notes</FieldLabel>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                multiline
                placeholder="Notes..."
                value={localNotes}
                onChangeText={setLocalNotes}
              />

              <Button variant="primary" style={{ marginTop: 6, marginBottom: 14 }} onPress={handleUpdateCustomer} disabled={savingCustomer}>
                {savingCustomer ? 'Saving...' : '💾 Save Enquiry Details'}
              </Button>

              {enquiry.status === 'new' && (
                <>
                  <Button variant="green" style={{ marginTop: 6 }} onPress={handleAccept}>
                    ✅ Accept Enquiry & Create Job
                  </Button>
                  <Button
                    variant="outline"
                    style={{ marginTop: 10, borderColor: colors.orange }}
                    onPress={() =>
                      navigation.getParent()?.navigate('Quotes', {
                        screen: 'NewQuote',
                        params: {
                          customer: {
                            name: localName,
                            phone: localPhone,
                            email: localEmail,
                            address: localAddress,
                          },
                        },
                      })
                    }
                  >
                    <Text style={{ color: colors.orangeDeep, fontWeight: '700' }}>📄 Create Quote in Quotes Tab</Text>
                  </Button>
                  <Button variant="outline" onPress={() => reject()} style={{ marginTop: 10 }}>
                    Reject enquiry
                  </Button>
                </>
              )}

              {enquiry.status === 'accepted' && (
                <Button
                  variant="primary"
                  style={{ backgroundColor: colors.blue, marginTop: 16 }}
                  onPress={() => openLinkedJob(enquiry.jobId)}
                >
                  🚀 View Linked Job
                </Button>
              )}

              <Button
                variant="outline"
                style={{ borderColor: colors.red, marginTop: 20 }}
                onPress={() =>
                  Alert.alert('Delete', 'Delete this enquiry?', [
                    { text: 'Cancel' },
                    {
                      text: 'Delete',
                      onPress: async () => {
                        await unwrap(apiClient.delete(`/api/enquiries/${params.id}`));
                        navigation.goBack();
                      },
                    },
                  ])
                }
              >
                <Text style={{ color: colors.red, fontWeight: '700' }}>🗑️ Delete Enquiry</Text>
              </Button>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  whenText: { fontSize: 12, color: colors.gray },
  input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, backgroundColor: '#fff', marginBottom: 8, color: colors.charcoal },
  messageBox: { padding: 14, backgroundColor: colors.orangeTint, borderRadius: 8, marginBottom: 14, borderWidth: 1, borderColor: colors.orange },
  messageTitle: { fontSize: 11, fontWeight: '800', color: colors.orangeDeep, marginBottom: 4 },
  messageText: { fontSize: 13, color: colors.charcoal, fontStyle: 'italic', lineHeight: 20 },
});