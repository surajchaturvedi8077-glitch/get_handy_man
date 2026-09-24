import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Text, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import ScreenHeader from '../components/layout/ScreenHeader';
import QuoteComposer from '../components/enquiries/QuoteComposer';
import EnquiryActions from '../components/enquiries/EnquiryActions';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import FieldLabel from '../components/ui/FieldLabel';
import Chip from '../components/ui/Chip';
import useEnquiry from '../hooks/useEnquiry';
import useSettings from '../hooks/useSettings';
import useToast from '../hooks/useToast';
import { apiClient, unwrap } from '../services/apiClient';
import { colors } from '../theme/colors';

const BASE_URL = 'https://gold-worm-334910.hostingersite.com';
const CHIP_TONE = { new: 'orange', quoted: 'blue', accepted: 'green', rejected: 'red' };

export default function EnquiryDetailScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { settings } = useSettings();
  
  const { enquiry, loading, error, reject, sendQuote, accept, refresh } = useEnquiry(params.id);

  const [localName, setLocalName] = useState('');
  const [localPhone, setLocalPhone] = useState('');
  const [localEmail, setLocalEmail] = useState('');
  const [localAddress, setLocalAddress] = useState('');

  useEffect(() => {
    if (enquiry) {
      setLocalName(enquiry.name || '');
      setLocalPhone(enquiry.phone || '');
      setLocalEmail(enquiry.email || '');
      setLocalAddress(enquiry.address || '');
    }
  }, [enquiry]);

  const handleUpdateEnquiry = async () => {
    try {
      await unwrap(apiClient.put(`/api/enquiries/${params.id}`, {
        name: localName,
        phone: localPhone,
        email: localEmail,
        address: localAddress
      }));
      refresh();
      showToast('Enquiry details saved');
    } catch (e) {
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const handleReject = async () => {
    await reject();
    showToast('Enquiry rejected');
  };

  const handleReactivate = async () => {
    try {
      await unwrap(apiClient.put(`/api/enquiries/${params.id}`, { status: 'new' }));
      showToast('Enquiry Restored!');
      refresh();
    } catch (e) {
      Alert.alert("Error", "Could not restore the enquiry.");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Enquiry", "Permanently delete this enquiry?", [
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
  };

  const handleSendQuote = async (items) => {
    try {
      showToast('Generating Quote PDF...');
      
      const itemsHtml = items.map(i => `<tr><td class="text-left" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">${i.name || ''}</td><td class="text-right" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">$${parseFloat(i.amt || 0).toFixed(2)}</td></tr>`).join('');
      const total = items.reduce((sum, i) => sum + parseFloat(i.amt || 0), 0);

      const logoSrc = settings?.logoUrl ? (settings.logoUrl.startsWith('http') ? settings.logoUrl : `${BASE_URL}${settings.logoUrl}`) : '';
      const logoImg = logoSrc ? `<img src="${logoSrc}" class="logo" />` : `<h2 style="margin: 0; color: #1F2937;">${settings?.businessName || 'Get Handyman'}</h2>`;
      const quoteDate = new Date().toLocaleDateString('en-GB');

      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              @page { margin: 0; }
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; margin: 0; -webkit-print-color-adjust: exact; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; }
              .logo { max-height: 100px; max-width: 200px; object-fit: contain; }
              .biz-details { text-align: right; font-size: 11px; color: #6B7280; line-height: 1.5; }
              .title-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 25px; }
              .biz-name { font-size: 24px; font-weight: 800; color: #1F2937; margin: 0; }
              .doc-type { font-size: 22px; font-weight: 800; color: #1D4ED8; margin: 0; }
              .divider { border-top: 2px solid #111827; margin: 15px 0 25px 0; }
              .meta-row { display: flex; justify-content: space-between; font-size: 11px; color: #374151; }
              .bill-to-details { line-height: 1.5; }
              .items-table { width: 100%; border-collapse: collapse; margin-top: 30px; font-size: 11px; }
              .items-table th { background-color: #111827; color: #ffffff; padding: 10px; font-weight: 700; text-align: left; }
              .text-right { text-align: right; }
              .totals-container { display: flex; justify-content: flex-end; margin-top: 20px; }
              .balance-due { background-color: #1D4ED8; color: #ffffff; font-size: 14px; font-weight: 700; padding: 10px 15px; display: flex; justify-content: space-between; width: 220px; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="header"><div>${logoImg}</div><div class="biz-details"><div>${settings?.abn ? `ABN: ${settings.abn}` : ''}</div><div>${settings?.bizPhone || ''}</div><div>${settings?.bizEmail || ''}</div><div>${settings?.website || ''}</div></div></div>
            <div class="title-row"><h1 class="biz-name">${settings?.businessName || 'Get Handyman'}</h1><h2 class="doc-type">QUOTE</h2></div>
            <div class="divider"></div>
            <div class="meta-row">
              <div>
                <div style="color: #9CA3AF; font-weight: 700; margin-bottom: 4px;">BILL TO:</div>
                <div class="bill-to-details">
                  <div style="font-weight: 700;">${localName}</div>
                  <div>${localEmail}</div>
                  <div>${localPhone}</div>
                  ${localAddress ? `<div>${localAddress}</div>` : ''}
                </div>
              </div>
              <div style="text-align: right;">
                <div><span style="color: #9CA3AF;">Quote Date:</span> ${quoteDate}</div>
                <div><span style="color: #9CA3AF;">Currency:</span> AUD</div>
                <div><span style="color: #9CA3AF;">Terms:</span> Due on receipt</div>
              </div>
            </div>
            <table class="items-table">
              <tr><th>DESCRIPTION</th><th class="text-right">AMOUNT</th></tr>
              ${itemsHtml}
            </table>
            <div class="totals-container">
              <div class="balance-due"><span>TOTAL</span><span>$${total.toFixed(2)}</span></div>
            </div>
            ${settings?.quoteMessage ? `<div style="margin-top: 30px; font-size: 11px; color: #4B5563; line-height: 1.5;">${settings.quoteMessage}</div>` : ''}
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html, base64: false });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { 
          mimeType: 'application/pdf', 
          dialogTitle: `Share Quote for ${localName}`,
          UTI: '.pdf' 
        });
      }
      
      // Update Database Status
      await sendQuote(items);
      showToast('Quote sent successfully');
    } catch (err) {
      Alert.alert("Error", "Failed to generate or share quote.");
    }
  };

  const handleAccept = async () => {
  try {
    const data = await accept();
    showToast('Job created from enquiry');
    
    if (data && data.job && data.job._id) {
      navigation.getParent()?.navigate('Jobs', { screen: 'JobDetail', params: { id: data.job._id } });
    } else {
      navigation.goBack();
    }
  } catch (e) {
    // Extract the exact error from the backend response
    let errorText = 'An unknown error occurred.';
    if (e.response?.data?.errors) {
      errorText = e.response.data.errors.join('\n');
    } else if (e.response?.data?.message) {
      errorText = e.response.data.message;
    } else if (e.message) {
      errorText = e.message;
    }
    
    Alert.alert("Backend Error", errorText);
  }
};

  return (
    <View style={styles.screen}>
      <ScreenHeader title="ENQUIRY" subtitle={enquiry?.name} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {loading && <LoadingState />}
        {error && <ErrorState>{error}</ErrorState>}
        
        {enquiry && (
          <>
            <View style={styles.top}>
              <Chip tone={CHIP_TONE[enquiry.status] || 'orange'}>
                {enquiry.status[0].toUpperCase() + enquiry.status.slice(1)}
              </Chip>
              {enquiry.when ? <Text style={styles.detail}>Preferred: {enquiry.when}</Text> : null}
            </View>

            {enquiry.message ? <Text style={styles.message}>{enquiry.message}</Text> : null}

            {/* Editable Customer Fields */}
            <FieldLabel style={{ marginTop: 14 }}>Customer Details</FieldLabel>
            <TextInput style={styles.input} value={localName} onChangeText={setLocalName} placeholder="Customer Name" />
            <TextInput style={styles.input} value={localPhone} onChangeText={setLocalPhone} placeholder="Phone Number" keyboardType="phone-pad" />
            <TextInput style={styles.input} value={localEmail} onChangeText={setLocalEmail} placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} value={localAddress} onChangeText={setLocalAddress} placeholder="Address" />
            
            <Button variant="primary" style={{ marginBottom: 20 }} onPress={handleUpdateEnquiry}>
              💾 Save Customer Details
            </Button>

            {enquiry.status === 'new' && (
              <>
                <QuoteComposer initialItems={enquiry.quoteItems} onSend={handleSendQuote} />
                <Button variant="green" style={{ marginTop: 12 }} onPress={handleAccept}>
                  ✅ Accept Instantly (Confirmed on Phone)
                </Button>
                <Button variant="outline" onPress={handleReject} style={{ marginTop: 10 }}>
                  Reject enquiry
                </Button>
              </>
            )}

            {enquiry.status === 'quoted' && (
              <>
                <Text style={styles.quoted}>Quote Sent</Text>
                <EnquiryActions onReject={handleReject} onAccept={handleAccept} acceptLabel="Mark accepted & create job" />
              </>
            )}

            {enquiry.status === 'accepted' && (
              <Text style={styles.note}>This enquiry is accepted and linked to a job.</Text>
            )}

            {enquiry.status === 'rejected' && (
              <>
                <Text style={styles.noteError}>This enquiry was previously rejected.</Text>
                <Button variant="primary" style={{ backgroundColor: colors.green, marginTop: 12 }} onPress={handleReactivate}>
                  🔄 Reactivate & Edit Details
                </Button>
              </>
            )}

            <Button variant="outline" style={{ borderColor: colors.red, marginTop: 20 }} onPress={handleDelete}>
              <Text style={{ color: colors.red, fontWeight: '700' }}>🗑️ Delete Enquiry</Text>
            </Button>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  detail: { fontSize: 12, color: colors.gray },
  message: { padding: 12, backgroundColor: colors.offwhite, borderRadius: 8, fontSize: 12.5, color: colors.charcoal2, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, backgroundColor: '#fff', marginBottom: 8, color: colors.charcoal },
  quoted: { fontWeight: '800', fontSize: 15, marginVertical: 10 },
  note: { fontSize: 12.5, color: colors.green, fontWeight: '700', marginTop: 10 },
  noteError: { fontSize: 12.5, color: colors.red, fontWeight: '700', marginTop: 10 },
});