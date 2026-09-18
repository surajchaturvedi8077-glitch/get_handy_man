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
    name: '', email: '', phone: '', address: ''
  });
  const [items, setItems] = useState([{ name: 'General Handyman Services', amt: '150' }]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const generateQuotePDF = async () => {
    if (!form.name) return Alert.alert("Required", "Please enter a customer name.");
    
    setGenerating(true);
    try {
      showToast('Generating Quote...');
      
      const itemsHtml = items.map(i => `<tr><td class="text-left" style="border-bottom: 1px solid #E5E7EB;">${i.name || ''}</td><td class="text-right" style="border-bottom: 1px solid #E5E7EB;">$${parseFloat(i.amt || 0).toFixed(2)}</td></tr>`).join('');
      const total = items.reduce((sum, i) => sum + parseFloat(i.amt || 0), 0);

      const logoSrc = settings?.logoUrl ? (settings.logoUrl.startsWith('http') ? settings.logoUrl : `${BASE_URL}${settings.logoUrl}`) : '';
      const logoImg = logoSrc ? `<img src="${logoSrc}" class="logo" />` : `<h2 style="margin: 0; color: #1F2937;">${settings?.businessName || 'Get Handyman'}</h2>`;
      const quoteDate = new Date().toLocaleDateString('en-GB');

      // Uses upgraded quote formatting matching the premium invoice layout
      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              @page { margin: 0; }
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; position: relative; min-height: 100vh; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; }
              .logo { max-height: 120px; max-width: 250px; object-fit: contain; }
              .biz-details { text-align: right; font-size: 11px; color: #6B7280; line-height: 1.6; }
              .title-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 25px; }
              .biz-name { font-size: 28px; font-weight: 800; color: #1F2937; margin: 0; letter-spacing: -0.5px; }
              .doc-type { font-size: 22px; font-weight: 800; color: #1D4ED8; margin: 0; }
              .divider { border-top: 2px solid #111827; margin: 15px 0 25px 0; }
              .meta-row { display: flex; justify-content: space-between; font-size: 11px; color: #374151; }
              .bill-to { display: flex; gap: 20px; }
              .bill-to-label { color: #9CA3AF; width: 40px; }
              .bill-to-details { line-height: 1.6; }
              .meta-right table { font-size: 11px; text-align: right; border-collapse: collapse; line-height: 1.6; }
              .meta-right td { padding: 0 0 0 15px; }
              .meta-right .label { color: #9CA3AF; }
              .meta-right .val { color: #374151; }
              .items-table { width: 100%; border-collapse: collapse; margin-top: 40px; font-size: 11px; }
              .items-table th { background-color: #111827; color: #ffffff; padding: 12px 10px; font-weight: 700; }
              .items-table td { padding: 12px 10px; color: #374151; }
              .text-left { text-align: left; }
              .text-right { text-align: right; }
              .totals-container { display: flex; justify-content: flex-end; margin-top: 20px; }
              .totals { width: 260px; font-size: 11px; color: #374151; }
              .totals-row { display: flex; justify-content: space-between; padding: 6px 10px; }
              .balance-due { background-color: #1D4ED8; color: #ffffff; font-size: 15px; font-weight: 700; padding: 12px 10px; margin-top: 8px; display: flex; justify-content: space-between; align-items: center; }
              .bg-shapes { position: absolute; bottom: 0; left: 0; width: 350px; height: 350px; z-index: -1; opacity: 0.6; pointer-events: none; }
            </style>
          </head>
          <body>
            <svg class="bg-shapes" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="160" r="45" fill="#EAF3FF" /><circle cx="110" cy="120" r="22" fill="#F1F5F9" /><circle cx="160" cy="180" r="35" fill="#F4E8FF" /></svg>
            <div class="header"><div>${logoImg}</div><div class="biz-details"><div>${settings?.bizCityState || ''}</div><div>${settings?.bizPhone || ''}</div><div>${settings?.website || ''}</div></div></div>
            <div class="title-row"><h1 class="biz-name">${settings?.businessName || 'Get Handyman'}</h1><h2 class="doc-type">QUOTE</h2></div>
            <div class="divider"></div>
            <div class="meta-row">
              <div class="bill-to"><div class="bill-to-label">Quote For:</div><div class="bill-to-details"><div style="font-weight: 700;">${form.name}</div>${form.email ? `<div>${form.email}</div>` : ''}${form.phone ? `<div>${form.phone}</div>` : ''}${form.address ? `<div>${form.address}</div>` : ''}</div></div>
              <div class="meta-right"><table><tr><td class="label">Date:</td><td class="val">${quoteDate}</td></tr></table></div>
            </div>
            <table class="items-table"><tr><th class="text-left">Description</th><th class="text-right">Amount</th></tr>${itemsHtml}</table>
            <div class="totals-container">
              <div class="totals">
                <div class="balance-due"><span>Total Quote</span><span>$${total.toFixed(2)}</span></div>
              </div>
            </div>
            ${settings?.quoteMessage ? `<div style="margin-top: 40px; font-size: 11px; color: #374151; line-height: 1.6;">${settings.quoteMessage}</div>` : ''}
          </body>
        </html>
      `;

      // Navigate to the preview screen for Native Sharing
      navigation.navigate('PdfPreview', { html, title: `Quote_${form.name.replace(/\s+/g, '_')}.pdf` });
    } catch (err) {
      Alert.alert("Error", "Failed to generate quote.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="NEW QUOTE" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        <FieldLabel>Customer Details</FieldLabel>
        <TextInput style={styles.input} placeholder="Customer Name" value={form.name} onChangeText={v => updateForm('name', v)} />
        <TextInput style={styles.input} placeholder="Phone Number" value={form.phone} onChangeText={v => updateForm('phone', v)} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Email Address" value={form.email} onChangeText={v => updateForm('email', v)} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Street Address" value={form.address} onChangeText={v => updateForm('address', v)} />

        <FieldLabel style={{ marginTop: 14 }}>Quote Items</FieldLabel>
        {items.map((it, idx) => (
          <View key={idx} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <TextInput style={[styles.input, { flex: 1, marginTop: 0 }]} value={it.name} onChangeText={v => { const n = [...items]; n[idx].name = v; setItems(n); }} placeholder="Description" />
            <TextInput style={[styles.input, { width: 80, marginTop: 0 }]} value={it.amt} onChangeText={v => { const n = [...items]; n[idx].amt = v; setItems(n); }} placeholder="Cost" keyboardType="numeric" />
            <TouchableOpacity onPress={() => setItems(items.filter((_, i) => i !== idx))}><Text style={{ fontSize: 20, color: colors.red, padding: 8 }}>×</Text></TouchableOpacity>
          </View>
        ))}
        <Button variant="outline" style={{ paddingVertical: 8, marginBottom: 14 }} onPress={() => setItems([...items, { name: '', amt: '' }])}>+ Add item</Button>

        <Button variant="primary" style={{ marginTop: 12 }} onPress={generateQuotePDF} disabled={generating}>
          {generating ? <ActivityIndicator color="#fff" /> : <Text style={{fontWeight: 'bold', color: '#fff'}}>Preview & Share Quote</Text>}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10, fontSize: 13, backgroundColor: '#fff', marginBottom: 10, color: colors.charcoal },
});