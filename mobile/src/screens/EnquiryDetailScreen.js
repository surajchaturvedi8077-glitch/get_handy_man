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
import { convertToInvoice } from '../services/enquiryService';
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
  const [localNotes, setLocalNotes] = useState('');
  const [localAdvancePaid, setLocalAdvancePaid] = useState('0');

  useEffect(() => {
    if (enquiry) {
      setLocalName(enquiry.name || '');
      setLocalPhone(enquiry.phone || '');
      setLocalEmail(enquiry.email || '');
      setLocalAddress(enquiry.address || '');
      setLocalNotes(enquiry.notes || '');
      setLocalAdvancePaid(String(enquiry.advancePaid || 0));
    }
  }, [enquiry]);

  const handleUpdateEnquiry = async () => {
    try {
      await unwrap(apiClient.put(`/api/enquiries/${params.id}`, {
        name: localName, phone: localPhone, email: localEmail, address: localAddress, notes: localNotes, advancePaid: Number(localAdvancePaid) || 0
      }));
      refresh();
      showToast('Enquiry details saved');
    } catch (e) { Alert.alert('Backend Error', e?.response?.data?.message || 'Failed to save changes'); }
  };

  const handleConvertToInvoice = async () => {
    try {
      const data = await convertToInvoice(params.id);
      showToast('Converted Directly to Invoice!');
      navigation.getParent()?.navigate('Invoices', { screen: 'InvoiceDetail', params: { id: data.invoice._id } });
    } catch (e) { Alert.alert('Backend Error', e?.response?.data?.message || 'Could not convert to Invoice'); }
  };

  const generateQuoteHTML = (items) => {
    const itemsHtml = items.map(i => `<tr><td class="text-left" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">${i.name || ''}</td><td class="text-center" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">1</td><td class="text-right" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">$${parseFloat(i.amt || 0).toFixed(2)}</td><td class="text-right" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">$${parseFloat(i.amt || 0).toFixed(2)}</td></tr>`).join('') || '<tr><td colspan="4" class="text-center" style="border-bottom: 1px solid #E5E7EB;">No items</td></tr>';
    
    const subtotal = items.reduce((sum, i) => sum + parseFloat(i.amt || 0), 0);
    const gstRate = settings?.gstRate || 10;
    const applyGst = settings?.gstEnabled !== false;
    const gstAmt = applyGst ? subtotal * (gstRate / 100) : 0;
    const finalTotal = subtotal + gstAmt;

    const advanceAmt = parseFloat(localAdvancePaid || 0);
    const advanceHtml = advanceAmt > 0 ? `<div class="totals-row"><span>Advance/Deposit Paid</span><span>-$${advanceAmt.toFixed(2)}</span></div>` : '';
    const balanceDue = finalTotal - advanceAmt;

    const bsbStr = settings?.bsb || '';
    const accountStr = settings?.account || '';
    const accountNameStr = settings?.accountName || '';
    const bankNameStr = settings?.bankName || '';
    const payIdHtml = settings?.payId ? `<br/>PayID: ${settings.payId}` : '';
    const paymentDetailsHtml = bankNameStr ? `<div style="margin-top: 30px; font-size: 10px; color: #6B7280; line-height: 1.6; page-break-inside: avoid;"><strong>Payment Details</strong><br/>Bank: ${bankNameStr}<br/>BSB: ${bsbStr}<br/>Account: ${accountStr}<br/>Account Name: ${accountNameStr}${payIdHtml}</div>` : '';

    const notesHtml = localNotes ? `<div style="margin-top: 20px; font-size: 11px; color: #374151; line-height: 1.5;"><strong>Notes:</strong><br/>${localNotes.replace(/\n/g, '<br/>')}</div>` : '';

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            @page { margin: 0; }
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; margin: 0; -webkit-print-color-adjust: exact; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; }
            .logo { max-height: 120px; max-width: 250px; object-fit: contain; margin-bottom: 15px; }
            .biz-details { font-size: 12px; color: #374151; line-height: 1.6; }
            .biz-name { font-size: 16px; font-weight: 800; color: #111827; margin-bottom: 4px; }
            .doc-meta { text-align: right; }
            .doc-type { font-size: 28px; font-weight: 800; color: #6B7280; margin: 0 0 15px 0; letter-spacing: 1px; line-height: 1; }
            .divider { border-top: 2px solid #111827; margin: 25px 0; }
            .bill-to-section { margin-bottom: 30px; }
            .bill-to-title { color: #9CA3AF; font-weight: 700; font-size: 11px; margin-bottom: 6px; letter-spacing: 0.5px; }
            .bill-to-details { font-size: 12px; color: #374151; line-height: 1.5; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
            .items-table th { background-color: #1D4ED8; color: #ffffff; padding: 12px 10px; font-weight: 700; text-align: left; }
            .items-table td { padding: 12px 10px; border-bottom: 1px solid #E5E7EB; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .totals-container { display: flex; justify-content: flex-end; margin-top: 20px; page-break-inside: avoid; }
            .totals { width: 260px; font-size: 11px; color: #374151; }
            .totals-row { display: flex; justify-content: space-between; padding: 6px 10px; }
            .balance-due { background-color: #000000; color: #ffffff; font-size: 15px; font-weight: 700; padding: 12px 10px; margin-top: 8px; display: flex; justify-content: space-between; align-items: center; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>${settings?.logoUrl ? `<img src="${settings.logoUrl.startsWith('http') ? settings.logoUrl : `${BASE_URL}${settings.logoUrl}`}" class="logo" />` : ''}<div class="biz-details"><div class="biz-name">${settings?.businessName || 'Get Handyman'}</div>${settings?.abn ? `<div>ABN - ${settings.abn}</div>` : ''}${settings?.bizCityState ? `<div>${settings.bizCityState}</div>` : ''}${settings?.bizPhone ? `<div>${settings.bizPhone}</div>` : ''}${settings?.website ? `<div>${settings.website}</div>` : ''}</div></div>
            <div class="doc-meta"><h2 class="doc-type">QUOTE</h2><div style="font-size: 11px; color: #6B7280; line-height: 1.6;"><div><strong style="color: #9CA3AF;">Date:</strong> ${quoteDate}</div><div><strong style="color: #9CA3AF;">Currency:</strong> AUD</div><div><strong style="color: #9CA3AF;">Terms:</strong> ${settings?.paymentTerms || 'Due on receipt'}</div></div></div>
          </div>
          <div class="divider"></div>
          <div class="bill-to-section">
            <div class="bill-to-title">QUOTE TO:</div>
            <div class="bill-to-details"><div style="font-weight: 700; font-size: 14px; color: #111827;">${localName || 'Customer Name'}</div>${localPhone ? `<div>${localPhone}</div>` : ''}${localEmail ? `<div>${localEmail}</div>` : ''}${localAddress ? `<div style="margin-top: 4px;">${localAddress}</div>` : ''}</div>
          </div>
          <table class="items-table"><tr><th>Description</th><th class="text-center">Quantity</th><th class="text-right">Rate</th><th class="text-right">Amount</th></tr>${itemsHtml}</table>
          <div class="totals-container">
            <div class="totals">
              <div class="totals-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
              <div class="totals-row"><span>${applyGst ? `GST ${gstRate}%` : 'GST'}</span><span>${applyGst ? `$${gstAmt.toFixed(2)}` : '$0.00'}</span></div>
              ${advanceHtml}
              <div class="balance-due"><span>Total Quote</span><span>$${balanceDue.toFixed(2)}</span></div>
            </div>
          </div>
          ${paymentDetailsHtml}
          ${notesHtml}
        </body>
      </html>
    `;
  };

  const handlePreviewQuote = (items) => {
    navigation.navigate('PdfPreview', { html: generateQuoteHTML(items), title: `Quote_${localName || 'Preview'}.pdf` });
  };

  const handleSendQuote = async (items) => {
    try {
      showToast('Generating Quote PDF...');
      const { uri } = await Print.printToFileAsync({ html: generateQuoteHTML(items), base64: false });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Share Quote for ${localName}`, UTI: '.pdf' });
      
      const subtotal = items.reduce((sum, i) => sum + parseFloat(i.amt || 0), 0);
      const gstAmt = (settings?.gstEnabled !== false) ? subtotal * ((settings?.gstRate || 10) / 100) : 0;
      await unwrap(apiClient.put(`/api/enquiries/${params.id}`, { price: subtotal + gstAmt }));
      
      await sendQuote(items);
      showToast('Quote sent successfully');
    } catch (err) { Alert.alert("Error", "Failed to generate or share quote."); }
  };

  const handleAccept = async () => {
    try {
      const { job } = await accept();
      showToast('Job created from enquiry');
      navigation.getParent()?.navigate('Jobs', { screen: 'JobDetail', params: { id: job._id } });
    } catch (e) {
      Alert.alert("Backend Error", e?.response?.data?.message || e?.message || "Could not accept enquiry.");
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="QUOTE / ENQUIRY" subtitle={enquiry?.name} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {loading && <LoadingState />}
        {error && <ErrorState>{error}</ErrorState>}
        
        {enquiry && (
          <>
            <View style={styles.top}>
              <Chip tone={CHIP_TONE[enquiry.status] || 'orange'}>{enquiry.status[0].toUpperCase() + enquiry.status.slice(1)}</Chip>
            </View>

            <FieldLabel style={{ marginTop: 14 }}>Customer Details</FieldLabel>
            <TextInput style={styles.input} value={localName} onChangeText={setLocalName} placeholder="Customer Name" />
            <TextInput style={styles.input} value={localPhone} onChangeText={setLocalPhone} placeholder="Phone Number" keyboardType="phone-pad" />
            <TextInput style={styles.input} value={localEmail} onChangeText={setLocalEmail} placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} value={localAddress} onChangeText={setLocalAddress} placeholder="Address" />
            
            <FieldLabel style={{ marginTop: 10 }}>Advance / Deposit Paid (A$)</FieldLabel>
            <TextInput style={styles.input} value={localAdvancePaid} onChangeText={setLocalAdvancePaid} keyboardType="numeric" />

            <FieldLabel style={{ marginTop: 10 }}>Notes (Shown on PDF)</FieldLabel>
            <TextInput style={[styles.input, {height: 80, textAlignVertical: 'top'}]} multiline placeholder="Scope of work, terms, etc..." value={localNotes} onChangeText={setLocalNotes} />
            
            <Button variant="outline" style={{ marginBottom: 20 }} onPress={handleUpdateEnquiry}>
              💾 Save Customer Details & Notes
            </Button>

            {enquiry.status !== 'rejected' && (
              <QuoteComposer initialItems={enquiry.quoteItems} onSend={handleSendQuote} onPreview={handlePreviewQuote} />
            )}

            {enquiry.status === 'new' && (
              <>
                <Button variant="green" style={{ marginTop: 12 }} onPress={handleAccept}>
                  ✅ Accept Instantly & Create Job
                </Button>
                <Button variant="outline" onPress={() => reject()} style={{ marginTop: 10 }}>Reject enquiry</Button>
              </>
            )}

            {enquiry.status === 'quoted' && (
              <View style={{ marginTop: 16 }}>
                <EnquiryActions onReject={() => reject()} onAccept={handleAccept} acceptLabel="Mark accepted & create job" />
                <Button variant="outline" style={{ marginTop: 10, borderColor: colors.blue }} onPress={handleConvertToInvoice}>
                  <Text style={{ color: colors.blue, fontWeight: '700' }}>⚡ Skip Job & Convert to Invoice</Text>
                </Button>
              </View>
            )}

            {enquiry.status === 'accepted' && enquiry.jobId && (
              <Button variant="primary" style={{ backgroundColor: colors.blue, marginTop: 16 }} onPress={() => navigation.getParent()?.navigate('Jobs', { screen: 'JobDetail', params: { id: enquiry.jobId } })}>
                🚀 View Linked Job
              </Button>
            )}

            {enquiry.status === 'accepted' && enquiry.invoiceId && (
              <Button variant="primary" style={{ backgroundColor: colors.green, marginTop: 16 }} onPress={() => navigation.getParent()?.navigate('Invoices', { screen: 'InvoiceDetail', params: { id: enquiry.invoiceId } })}>
                💰 View Direct Invoice
              </Button>
            )}

            <Button variant="outline" style={{ borderColor: colors.red, marginTop: 20 }} onPress={() => Alert.alert("Delete", "Delete?", [{ text: "Cancel" }, { text: "Delete", onPress: async () => { await unwrap(apiClient.delete(`/api/enquiries/${params.id}`)); navigation.goBack(); } }])}>
              <Text style={{ color: colors.red, fontWeight: '700' }}>🗑️ Delete Quote/Enquiry</Text>
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
  input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, backgroundColor: '#fff', marginBottom: 8, color: colors.charcoal },
  noteError: { fontSize: 12.5, color: colors.red, fontWeight: '700', marginTop: 10 },
});