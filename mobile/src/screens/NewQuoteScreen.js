import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import ScreenHeader from '../components/layout/ScreenHeader';
import Button from '../components/ui/Button';
import FieldLabel from '../components/ui/FieldLabel';
import useSettings from '../hooks/useSettings';
import useToast from '../hooks/useToast';
import { apiClient } from '../services/apiClient';
import { colors } from '../theme/colors';

const BASE_URL = 'https://gold-worm-334910.hostingersite.com';

export default function NewQuoteScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { showToast } = useToast();
  const { settings } = useSettings();
  const [generating, setGenerating] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', currency: 'AUD', terms: settings?.paymentTerms || 'Due on receipt'
  });
  const [items, setItems] = useState([{ name: 'General Handyman Services', amt: '150.00' }]);

  useEffect(() => {
    if (params?.customer) {
      setForm(prev => ({
        ...prev,
        name: params.customer.name || '',
        phone: params.customer.phone || '',
        email: params.customer.email || '',
        address: params.customer.address || '',
      }));
    }
  }, [params?.customer]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const generateHTMLString = () => {
    const itemsHtml = items.map(i => `<tr><td class="text-left" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">${i.name || ''}</td><td class="text-center" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">1</td><td class="text-right" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">$${parseFloat(i.amt || 0).toFixed(2)}</td><td class="text-right" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">$${parseFloat(i.amt || 0).toFixed(2)}</td></tr>`).join('') || '<tr><td colspan="4" class="text-center" style="border-bottom: 1px solid #E5E7EB;">No items</td></tr>';
    
    const subtotal = items.reduce((sum, i) => sum + parseFloat(i.amt || 0), 0);
    const gstRate = settings?.gstRate || 10;
    const applyGst = settings?.gstEnabled !== false;
    const gstAmt = applyGst ? subtotal * (gstRate / 100) : 0;
    const finalTotal = subtotal + gstAmt;

    const bizNameStr = settings?.businessName || 'Get Handyman';
    const bizCityStr = settings?.bizCityState || '';
    const bizPhoneStr = settings?.bizPhone || '';
    const bizWebStr = settings?.website || '';
    
    const logoSrc = settings?.logoUrl ? (settings.logoUrl.startsWith('http') ? settings.logoUrl : `${BASE_URL}${settings.logoUrl}`) : '';
    const logoImg = logoSrc ? `<img src="${logoSrc}" class="logo" />` : '';
    
    const quoteDate = new Date().toLocaleDateString('en-GB');

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
            .items-table { width: 100%; border-collapse: collapse; margin-top: 40px; font-size: 11px; }
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
            <div>
              ${logoImg}
              <div class="biz-details">
                <div class="biz-name">${bizNameStr}</div>
                ${settings?.abn ? `<div>ABN - ${settings.abn}</div>` : ''}
                ${bizCityStr ? `<div>${bizCityStr}</div>` : ''}
                ${bizPhoneStr ? `<div>${bizPhoneStr}</div>` : ''}
                ${bizWebStr ? `<div>${bizWebStr}</div>` : ''}
              </div>
            </div>
            <div class="doc-meta">
              <h2 class="doc-type">QUOTE</h2>
              <div style="font-size: 11px; color: #6B7280; line-height: 1.6;">
                <div><strong style="color: #9CA3AF;">Date:</strong> ${quoteDate}</div>
                <div><strong style="color: #9CA3AF;">Currency:</strong> ${form.currency}</div>
                <div><strong style="color: #9CA3AF;">Terms:</strong> ${form.terms}</div>
              </div>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="bill-to-section">
            <div class="bill-to-title">QUOTE TO:</div>
            <div class="bill-to-details">
              <div style="font-weight: 700; font-size: 14px; color: #111827;">${form.name || 'Customer Name'}</div>
              ${form.phone ? `<div>${form.phone}</div>` : ''}
              ${form.email ? `<div>${form.email}</div>` : ''}
              ${form.address ? `<div style="margin-top: 4px;">${form.address}</div>` : ''}
            </div>
          </div>

          <table class="items-table">
            <tr><th>Description</th><th class="text-center">Quantity</th><th class="text-right">Rate</th><th class="text-right">Amount</th></tr>
            ${itemsHtml}
          </table>
          <div class="totals-container">
            <div class="totals">
              <div class="totals-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
              <div class="totals-row"><span>${applyGst ? `GST ${gstRate}%` : 'GST'}</span><span>${applyGst ? `$${gstAmt.toFixed(2)}` : '$0.00'}</span></div>
              <div class="balance-due"><span>Total Quote</span><span>$${finalTotal.toFixed(2)}</span></div>
            </div>
          </div>
          ${settings?.quoteMessage ? `<div style="margin-top: 30px; font-size: 11px; color: #6B7280; line-height: 1.6;">${settings.quoteMessage}</div>` : ''}
        </body>
      </html>
    `;
  };

  const handlePreviewPdf = () => {
    const html = generateHTMLString();
    navigation.navigate('PdfPreview', { html, title: `Quote_${form.name || 'Preview'}.pdf` });
  };

  const handleSaveAndShareQuote = async () => {
    if (!form.name || !form.phone || !form.email) {
      return Alert.alert("Required Fields", "Name, Phone, and Email are mandatory.");
    }
    
    setGenerating(true);
    try {
      const subtotal = items.reduce((sum, i) => sum + parseFloat(i.amt || 0), 0);
      const applyGst = settings?.gstEnabled !== false;
      const gstAmt = applyGst ? subtotal * ((settings?.gstRate || 10) / 100) : 0;
      const finalTotal = subtotal + gstAmt;

      // Saves quote permanently to Enquiries list with final GST total
      await apiClient.post('/api/enquiries', {
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        status: 'quoted', 
        quoteItems: items,
        price: finalTotal
      });
      showToast('Quote saved permanently!');

      const html = generateHTMLString();
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { 
          mimeType: 'application/pdf', 
          dialogTitle: `Share Quote for ${form.name}`,
          UTI: '.pdf' 
        });
      }
    } catch (err) {
      Alert.alert("Error", "Failed to generate quote PDF.");
    } finally {
      setGenerating(false);
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.navigate('Dashboard');
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="NEW QUOTE" onBack={() => { navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Dashboard') }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        <FieldLabel>Customer Details (Mandatory)</FieldLabel>
        <TextInput style={styles.input} placeholder="Full Name *" value={form.name} onChangeText={v => updateForm('name', v)} placeholderTextColor={colors.gray} />
        <TextInput style={styles.input} placeholder="Phone Number *" value={form.phone} onChangeText={v => updateForm('phone', v)} keyboardType="phone-pad" placeholderTextColor={colors.gray} />
        <TextInput style={styles.input} placeholder="Email Address *" value={form.email} onChangeText={v => updateForm('email', v)} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.gray} />
        <TextInput style={styles.input} placeholder="Street Address" value={form.address} onChangeText={v => updateForm('address', v)} placeholderTextColor={colors.gray} />

        <FieldLabel style={{ marginTop: 10 }}>Quote Configuration</FieldLabel>
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1, marginTop: 0 }]} placeholder="Currency" value={form.currency} onChangeText={v => updateForm('currency', v)} />
          <TextInput style={[styles.input, { flex: 2, marginTop: 0 }]} placeholder="Terms" value={form.terms} onChangeText={v => updateForm('terms', v)} />
        </View>

        <FieldLabel style={{ marginTop: 14 }}>Line Items (Fully Editable)</FieldLabel>
        {items.map((it, idx) => (
          <View key={idx} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <TextInput style={[styles.input, { flex: 1, marginTop: 0 }]} value={it.name} onChangeText={v => { const n = [...items]; n[idx].name = v; setItems(n); }} placeholder="Description" />
            <TextInput style={[styles.input, { width: 90, marginTop: 0 }]} value={it.amt} onChangeText={v => { const n = [...items]; n[idx].amt = v; setItems(n); }} placeholder="Amount" keyboardType="numeric" />
            <TouchableOpacity onPress={() => setItems(items.filter((_, i) => i !== idx))}><Text style={{ fontSize: 20, color: colors.red, padding: 8 }}>×</Text></TouchableOpacity>
          </View>
        ))}
        <Button variant="outline" style={{ paddingVertical: 8, marginBottom: 14 }} onPress={() => setItems([...items, { name: '', amt: '' }])}>+ Add line item</Button>

        <View style={styles.btnRow}>
          <Button variant="dark" style={[styles.flex, { marginRight: 8 }]} onPress={handlePreviewPdf}>
            Preview PDF
          </Button>
          <Button variant="primary" style={[styles.flex, { backgroundColor: colors.orange }]} onPress={handleSaveAndShareQuote} disabled={generating}>
            {generating ? <ActivityIndicator color="#fff" /> : 'Save & Share'}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, backgroundColor: '#fff', marginBottom: 10, color: colors.charcoal },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  btnRow: { flexDirection: 'row', marginTop: 12 },
  flex: { flex: 1 }
});