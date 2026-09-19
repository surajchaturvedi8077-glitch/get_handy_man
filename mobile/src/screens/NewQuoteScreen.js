import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import ScreenHeader from '../components/layout/ScreenHeader';
import Button from '../components/ui/Button';
import FieldLabel from '../components/ui/FieldLabel';
import useSettings from '../hooks/useSettings';
import useToast from '../hooks/useToast';
import { colors } from '../theme/colors';

const BASE_URL = 'https://gold-worm-334910.hostingersite.com';

export default function NewQuoteScreen() {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { settings } = useSettings();
  const [generating, setGenerating] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', currency: 'AUD', terms: settings?.paymentTerms || 'Due on receipt'
  });
  const [items, setItems] = useState([{ name: 'General Handyman Services', amt: '150.00' }]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const generateQuotePDF = async () => {
    if (!form.name || !form.phone || !form.email) {
      return Alert.alert("Required Fields", "Name, Phone, and Email are mandatory.");
    }
    
    setGenerating(true);
    try {
      showToast('Generating Quote PDF...');
      
      const itemsHtml = items.map(i => `
        <tr>
          <td class="text-left" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">${i.name || ''}</td>
          <td class="text-right" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">$${parseFloat(i.amt || 0).toFixed(2)}</td>
        </tr>
      `).join('');
      
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
                  <div style="font-weight: 700;">${form.name}</div>
                  <div>${form.email}</div>
                  <div>${form.phone}</div>
                  ${form.address ? `<div>${form.address}</div>` : ''}
                </div>
              </div>
              <div style="text-align: right;">
                <div><span style="color: #9CA3AF;">Quote Date:</span> ${quoteDate}</div>
                <div><span style="color: #9CA3AF;">Currency:</span> ${form.currency}</div>
                <div><span style="color: #9CA3AF;">Terms:</span> ${form.terms}</div>
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
      
      // Forces native sharing dialog to work across all apps (WhatsApp, Gmail, Drive, etc.)
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { 
          mimeType: 'application/pdf', 
          dialogTitle: `Share Quote for ${form.name}`,
          UTI: '.pdf' 
        });
      } else {
        Alert.alert("Sharing not available", "Sharing is not available on this device");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to generate quote PDF: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="NEW QUOTE" onBack={() => navigation.goBack()} />
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

        <Button variant="primary" style={{ marginTop: 12, backgroundColor: colors.orange }} onPress={generateQuotePDF} disabled={generating}>
          {generating ? <ActivityIndicator color="#fff" /> : <Text style={{fontWeight: 'bold', color: '#fff'}}>✓ Preview & Share Quote PDF</Text>}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, backgroundColor: '#fff', marginBottom: 10, color: colors.charcoal },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 }
});