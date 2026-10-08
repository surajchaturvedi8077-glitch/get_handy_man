import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import ScreenHeader from '../components/layout/ScreenHeader';
import JobStatusBadge from '../components/jobs/JobStatusBadge';
import JobDetailForm from '../components/jobs/JobDetailForm';
import Button from '../components/ui/Button';
import LoadingState from '../components/ui/LoadingState';
import useJob from '../hooks/useJob';
import useSettings from '../hooks/useSettings';
import useToast from '../hooks/useToast';
import { openPhone, openEmail, openMaps } from '../utils/linking';
import { money } from '../utils/money';
import { colors } from '../theme/colors';
import * as invoiceService from '../services/invoiceService';

const BASE_URL = 'https://gold-worm-334910.hostingersite.com';

export default function JobDetailScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { settings } = useSettings();
  const { job, loading, saveDetails, complete, remove, changeStatus } = useJob(params.id);
  
  const [editingPrice, setEditingPrice] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false); 
  const [priceInput, setPriceInput] = useState('0');
  const [optionsOpen, setOptionsOpen] = useState(false); 
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false); 
  const [generating, setGenerating] = useState(false);

  if (loading || !job) return <View style={styles.screen}><LoadingState /></View>;

  const handleSaveDetails = async (payload) => {
    try {
      await saveDetails(payload);

      if (payload.labour !== undefined && job.invoiceId) {
        try {
          const inv = await invoiceService.getInvoice(job.invoiceId);
          if (inv && inv.items && inv.items.length > 0) {
            const updatedItems = [...inv.items];
            updatedItems[0].amt = payload.labour; 
            await invoiceService.updateInvoice(job.invoiceId, { items: updatedItems });
          }
        } catch (invErr) { }
      }

      setIsEditingJob(false);
      setEditingPrice(false); 
      showToast('Job details saved');
    } catch (err) {
      Alert.alert("Backend Error", err.message || 'An error occurred');
    }
  };

  const handleComplete = async () => {
    try {
      const { invoice } = await complete();
      showToast('Job marked complete');
      navigation.getParent()?.navigate('Invoices', { screen: 'InvoiceDetail', params: { id: invoice._id } });
    } catch (err) {
      Alert.alert("Backend Error", err.message);
    }
  };

  const handleDelete = async () => {
    setOptionsOpen(false);
    setConfirmDelete(false);
    await remove();
    showToast('Job deleted');
    navigation.navigate('JobsList');
  };

  const handleStatusChange = async (newStatus) => {
    setShowStatusPicker(false);
    try {
      await changeStatus(newStatus);
      showToast(`Job status updated successfully`);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to change status.");
    }
  };

  // NEW: Directly generates the invoice HTML from the Job screen BEFORE completion!
  const generateDraftInvoiceHTML = () => {
    const itemsHtml = (job.services && job.services.length > 0)
      ? job.services.map(s => `<tr><td class="text-left" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">${s.name || ''}</td><td class="text-center" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">1</td><td class="text-right" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">$${parseFloat(s.amt || 0).toFixed(2)}</td><td class="text-right" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">$${parseFloat(s.amt || 0).toFixed(2)}</td></tr>`).join('')
      : `<tr><td class="text-left" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">${job.service || 'Handyman'}</td><td class="text-center" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">1</td><td class="text-right" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">$${parseFloat(job.labour || 0).toFixed(2)}</td><td class="text-right" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">$${parseFloat(job.labour || 0).toFixed(2)}</td></tr>`;
      
    const subtotal = job.labour || 0;
    const gstRate = settings?.gstRate || 10;
    const applyGst = settings?.gstEnabled !== false;
    const gstAmt = applyGst ? subtotal * (gstRate / 100) : 0;
    const finalTotal = subtotal + gstAmt;

    const bsbStr = settings?.bsb || '';
    const accountStr = settings?.account || '';
    const accountNameStr = settings?.accountName || '';
    const bankNameStr = settings?.bankName || '';
    const payIdHtml = settings?.payId ? `<br/>PayID: ${settings.payId}` : '';
    
    const bizNameStr = settings?.businessName || 'Get Handyman';
    const bizCityStr = settings?.bizCityState || '';
    const bizPhoneStr = settings?.bizPhone || '';
    const bizWebStr = settings?.website || '';
    
    const logoSrc = settings?.logoUrl ? (settings.logoUrl.startsWith('http') ? settings.logoUrl : `${BASE_URL}${settings.logoUrl}`) : '';
    const logoImg = logoSrc ? `<img src="${logoSrc}" class="logo" />` : '';

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
            .doc-type { font-size: 24px; font-weight: 800; color: #6B7280; margin: 0 0 15px 0; letter-spacing: 1px; line-height: 1; }
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
            <div>${logoImg}<div class="biz-details"><div class="biz-name">${bizNameStr}</div>${settings?.abn ? `<div>ABN - ${settings.abn}</div>` : ''}${bizCityStr ? `<div>${bizCityStr}</div>` : ''}${bizPhoneStr ? `<div>${bizPhoneStr}</div>` : ''}${bizWebStr ? `<div>${bizWebStr}</div>` : ''}</div></div>
            <div class="doc-meta"><h2 class="doc-type">INVOICE (DRAFT)</h2><div style="font-size: 11px; color: #6B7280; line-height: 1.6;"><div><strong style="color: #9CA3AF;">Date:</strong> ${new Date().toLocaleDateString('en-GB')}</div></div></div>
          </div>
          <div class="divider"></div>
          <div class="bill-to-section">
            <div class="bill-to-title">BILL TO:</div>
            <div class="bill-to-details"><div style="font-weight: 700; font-size: 14px; color: #111827;">${job.name || 'Customer Name'}</div>${job.phone ? `<div>${job.phone}</div>` : ''}${job.email ? `<div>${job.email}</div>` : ''}${job.address ? `<div style="margin-top: 4px;">${job.address}</div>` : ''}</div>
          </div>
          <table class="items-table">
            <tr><th>Description</th><th class="text-center">Quantity</th><th class="text-right">Rate</th><th class="text-right">Amount</th></tr>
            ${itemsHtml}
          </table>
          <div class="totals-container">
            <div class="totals">
              <div class="totals-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
              <div class="totals-row"><span>${applyGst ? `GST ${gstRate}%` : 'GST'}</span><span>${applyGst ? `$${gstAmt.toFixed(2)}` : '$0.00'}</span></div>
              <div class="balance-due"><span>Balance Due</span><span>$${finalTotal.toFixed(2)}</span></div>
            </div>
          </div>
          ${bankNameStr ? `<div style="margin-top: 30px; font-size: 10px; color: #6B7280; line-height: 1.6;"><strong>Payment Details</strong><br/>Bank: ${bankNameStr}<br/>BSB: ${bsbStr}<br/>Account:${accountStr}<br/>Account Name: ${accountNameStr}${payIdHtml}</div>` : ''}
        </body>
      </html>
    `;
  };

  const handlePreviewDraftPdf = () => {
    const html = generateDraftInvoiceHTML();
    navigation.navigate('PdfPreview', { html, title: `Draft_Invoice_${job.name}.pdf` });
  };

  const handleShareDraftPdf = async () => {
    setGenerating(true);
    try {
      showToast('Generating Document...');
      const html = generateDraftInvoiceHTML();
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: `Draft_Invoice_${job.name}.pdf` });
      }
    } catch (err) {
      Alert.alert("PDF Error", "Could not share the PDF.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader 
        title="JOB DETAILS" 
        onBack={() => navigation.navigate('JobsList')} 
        rightAction={
          <TouchableOpacity onPress={() => setOptionsOpen(true)} style={{ padding: 4 }}><Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>⋮</Text></TouchableOpacity>
        } 
      />
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.customerStrip}>
          <View style={styles.avatar}><Text style={{ color: '#fff', fontSize: 18 }}>👤</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.customerName}>{job.name}</Text>
            <JobStatusBadge job={job} />
          </View>
          <TouchableOpacity style={styles.actionIcon} onPress={() => openPhone(job.phone)}><Text>📞</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon} onPress={() => openEmail(job.email)}><Text>✉️</Text></TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {job.needsDetails || isEditingJob ? (
          <JobDetailForm job={job} onSave={handleSaveDetails} />
        ) : (
          <>
            <View style={styles.fieldRow}>
              <Text style={styles.icon}>📅</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Date & time</Text>
                <Text style={styles.value}>{job.when || 'Not set'} {job.exactTime ? ` at ${job.exactTime}` : ''}</Text>
              </View>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.icon}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.value}>{job.address}</Text>
              </View>
              <Button variant="outline" style={{ paddingVertical: 6, paddingHorizontal: 12 }} onPress={() => openMaps(job.address)}>Locate</Button>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.icon}>📝</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Services & Line Items</Text>
                {job.services && job.services.length > 0 ? (
                  job.services.map((s, i) => (
                    <Text key={i} style={styles.value}>• {s.name} (${s.amt})</Text>
                  ))
                ) : (
                  <Text style={styles.value}>{job.service || 'None'}</Text>
                )}
              </View>
            </View>

            {(job.extraFields && job.extraFields.length > 0) && (
              <View style={styles.fieldRow}>
                <Text style={styles.icon}>📋</Text>
                <View style={{ flex: 1 }}>
                  {job.extraFields.map((f, idx) => (
                    <View key={idx} style={{ marginBottom: 4 }}>
                      <Text style={styles.label}>{f.label}</Text>
                      <Text style={styles.value}>{f.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.priceCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View><Text style={styles.labelOrange}>Total Labour Price</Text><Text style={styles.priceText}>{money(job.labour)}</Text></View>
              </View>
            </View>

            {job.status !== 'complete' && (
              <View style={[styles.buttonRow, { marginTop: 18 }]}>
                <Button variant="outline" style={{ flex: 1 }} onPress={handlePreviewDraftPdf}>📄 Preview Invoice</Button>
                <Button variant="primary" style={{ flex: 1 }} onPress={handleShareDraftPdf} disabled={generating}>
                  {generating ? <ActivityIndicator color="#fff" /> : '📤 Share Invoice'}
                </Button>
              </View>
            )}

            <View style={styles.buttonRow}>
              <Button variant="outline" style={{ flex: 1 }} onPress={() => setIsEditingJob(true)}>Edit Details</Button>
              {job.status === 'complete' ? (
                <Button variant="dark" style={{ flex: 1 }} onPress={() => navigation.getParent()?.navigate('Invoices', { screen: 'InvoiceDetail', params: { id: job.invoiceId } })}>View Final Invoice</Button>
              ) : (
                <Button variant="green" style={{ flex: 1 }} onPress={handleComplete}>Mark Complete & Invoice</Button>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {optionsOpen && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOptionsOpen(false)}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <TouchableOpacity style={styles.sheetRow} onPress={() => { setOptionsOpen(false); setIsEditingJob(true); }}>
              <View style={[styles.sheetIconBox, { backgroundColor: colors.blueTint }]}><Text>✏️</Text></View>
              <Text style={[styles.sheetText, { color: colors.blue }]}>Edit job details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetRow} onPress={() => { setOptionsOpen(false); setShowStatusPicker(true); }}>
              <View style={[styles.sheetIconBox, { backgroundColor: colors.orangeTint }]}><Text>🔄</Text></View>
              <Text style={[styles.sheetText, { color: colors.orangeDeep }]}>Change Job Status</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetRow} onPress={() => { setOptionsOpen(false); setConfirmDelete(true); }}>
              <View style={[styles.sheetIconBox, { backgroundColor: colors.redTint }]}><Text>🗑️</Text></View>
              <Text style={[styles.sheetText, { color: colors.red }]}>Delete job</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {showStatusPicker && (
        <View style={styles.overlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Change Job Status</Text>
            <Text style={styles.confirmSub}>Manually override the current status of this job.</Text>
            <View style={{ gap: 10, marginBottom: 20 }}>
              <Button variant="outline" onPress={() => handleStatusChange('accepted')}>🔵 Set to Assigned Job</Button>
              <Button variant="outline" onPress={() => handleStatusChange('complete')}>🟢 Set to Complete</Button>
            </View>
            <Button variant="outline" style={{ borderColor: colors.gray }} onPress={() => setShowStatusPicker(false)}>
              <Text style={{ color: colors.gray, fontWeight: '700' }}>Cancel</Text>
            </Button>
          </View>
        </View>
      )}

      {confirmDelete && (
        <View style={styles.overlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Delete this job?</Text>
            <Text style={styles.confirmSub}>Are you sure you want to delete it? This can't be undone.</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button variant="outline" style={{ flex: 1 }} onPress={() => setConfirmDelete(false)}>Cancel</Button>
              <Button variant="primary" style={{ flex: 1, backgroundColor: colors.red }} onPress={handleDelete}>Delete</Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  customerStrip: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.charcoal, alignItems: 'center', justifyContent: 'center' },
  customerName: { fontWeight: '800', fontSize: 14, marginBottom: 4 },
  actionIcon: { width: 34, height: 34, borderRadius: 8, backgroundColor: colors.orangeTint, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: colors.grayLight, marginVertical: 14 },
  fieldRow: { flexDirection: 'row', gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.grayLight, alignItems: 'flex-start' },
  icon: { width: 34, textAlign: 'center', fontSize: 17, marginTop: 4 },
  label: { fontSize: 10, fontWeight: '700', color: colors.gray, textTransform: 'uppercase', marginBottom: 2 },
  labelOrange: { fontSize: 10, fontWeight: '700', color: colors.orangeDeep, textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: 13, color: colors.charcoal, marginBottom: 4 },
  priceCard: { backgroundColor: colors.orangeTint, borderRadius: 10, padding: 12, marginTop: 12 },
  priceText: { fontSize: 18, fontWeight: '800', color: colors.charcoal },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  overlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(17,24,39,0.4)', justifyContent: 'flex-end', zIndex: 50 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingBottom: 30, paddingTop: 10 },
  handle: { width: 36, height: 4, backgroundColor: colors.grayLight, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  sheetIconBox: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sheetText: { fontSize: 14, fontWeight: '600' },
  confirmBox: { backgroundColor: '#fff', margin: 20, borderRadius: 14, padding: 20, alignSelf: 'center', top: '30%', position: 'absolute', width: '90%' },
  confirmTitle: { fontWeight: '800', fontSize: 15, marginBottom: 6 },
  confirmSub: { fontSize: 12.5, color: colors.gray, marginBottom: 18, lineHeight: 18 }
});