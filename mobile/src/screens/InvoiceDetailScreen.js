import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, Alert, TextInput, Keyboard } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import ScreenHeader from '../components/layout/ScreenHeader';
import PaymentModeSelector from '../components/invoices/PaymentModeSelector';
import Toggle from '../components/ui/Toggle';
import InvoiceLineItemsEditor from '../components/invoices/InvoiceLineItemsEditor';
import DiscountEditor from '../components/invoices/DiscountEditor';
import InvoiceTotals from '../components/invoices/InvoiceTotals';
import InvoiceActions from '../components/invoices/InvoiceActions';
import CostItemsEditor from '../components/invoices/CostItemsEditor';
import PhotoUploadButton from '../components/invoices/PhotoUploadButton';
import FieldLabel from '../components/ui/FieldLabel';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import useInvoice from '../hooks/useInvoice';
import useSettings from '../hooks/useSettings';
import useToast from '../hooks/useToast';
import { money } from '../utils/money';
import { colors } from '../theme/colors';
import * as invoiceService from '../services/invoiceService';

const BASE_URL = 'https://gold-worm-334910.hostingersite.com';

export default function InvoiceDetailScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { settings, update: updateSettings } = useSettings();
  const {
    invoice, loading, error, refresh, updateItems, setDiscount, toggleGstIncluded,
    setPaymentMode, togglePaidStatus, setCostItems, uploadCostItemPhoto,
  } = useInvoice(params.id);

  const [localGstRate, setLocalGstRate] = useState('10');
  const [localCustomer, setLocalCustomer] = useState('');
  const [localPhone, setLocalPhone] = useState('');
  const [localEmail, setLocalEmail] = useState('');
  const [savingInvoice, setSavingInvoice] = useState(false);

  // Sync state when invoice loads
  useEffect(() => {
    if (settings?.gstRate) setLocalGstRate(String(settings.gstRate));
    if (invoice) {
      setLocalCustomer(invoice.customer || '');
      setLocalPhone(invoice.customerPhone || '');
      setLocalEmail(invoice.customerEmail || '');
    }
  }, [invoice, settings]);

  if (loading || !invoice) return <View style={styles.screen}><LoadingState /></View>;
  if (error) return <View style={styles.screen}><ErrorState>{error}</ErrorState></View>;

  const isPaid = invoice.status === 'paid';

  const handleSaveGstRate = () => {
    updateSettings({ gstRate: Number(localGstRate) || 0 });
    showToast('GST Rate Updated');
  };

  const handleUpdateInvoice = async () => {
    Keyboard.dismiss();
    setSavingInvoice(true);
    try {
      await invoiceService.updateInvoice(invoice._id, {
        customer: localCustomer,
        customerPhone: localPhone,
        customerEmail: localEmail
      });
      refresh();
      showToast('✅ Invoice details updated successfully');
    } catch (e) {
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setSavingInvoice(false);
    }
  };

  const handleDeleteInvoice = () => {
    Alert.alert("Delete Invoice", "Are you sure you want to delete this invoice?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await invoiceService.deleteInvoice(invoice._id);
            showToast("Invoice deleted");
            navigation.navigate('InvoicesList');
          } catch (e) {
            Alert.alert("Error", "Could not delete invoice");
          }
        }
      }
    ]);
  };

  const generateHTMLString = () => {
    const itemsHtml = invoice.items && invoice.items.length 
      ? invoice.items.map(i => `<tr><td class="text-left" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">${i.name ? i.name : ''}</td><td class="text-center" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">${i.qty ? i.qty : 1}</td><td class="text-right" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">$${parseFloat(i.amt ? i.amt : 0).toFixed(2)}</td><td class="text-right" style="border-bottom: 1px solid #E5E7EB; padding: 10px;">$${(parseFloat(i.amt ? i.amt : 0) * parseInt(i.qty ? i.qty : 1)).toFixed(2)}</td></tr>`).join('')
      : '<tr><td colspan="4" class="text-center" style="border-bottom: 1px solid #E5E7EB;">No items</td></tr>';

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
    const logoImg = logoSrc ? `<img src="${logoSrc}" class="logo" />` : `<h2 style="margin: 0; color: #1F2937;">${bizNameStr}</h2>`;
    
    const invDate = new Date(invoice.date).toLocaleDateString('en-GB');
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-GB') : invDate;
    
    const customerName = localCustomer || 'Customer Name';
    const customerEmailHtml = localEmail ? `<div>${localEmail}</div>` : '';
    const customerPhoneHtml = localPhone ? `<div>${localPhone}</div>` : '';
    
    const invoiceNum = invoice.number ? invoice.number.replace('GH-', '') : '0';
    const termsStr = invoice.terms === 'Due on receipt' ? 'NET 0' : invoice.terms;
    
    const subtotal = parseFloat(invoice.totals?.subtotal || 0).toFixed(2);
    const discAmt = parseFloat(invoice.totals?.discAmt || 0).toFixed(2);
    const gstAmt = parseFloat(invoice.totals?.gst || 0).toFixed(2);
    const totalDue = parseFloat(invoice.totals?.total || 0).toFixed(2);
    const gstRate = settings?.gstRate || 10;
    
    const isPaidAmt = invoice.status === 'paid' ? totalDue : '0.00';
    const balanceAmt = invoice.status === 'paid' ? '0.00' : totalDue;

    const paymentDetailsHtml = bankNameStr ? `
      <div style="margin-top: 30px; font-size: 10px; color: #6B7280; line-height: 1.6; page-break-inside: avoid;">
        <strong>Payment Details</strong><br/>
        Bank: ${bankNameStr}<br/>
        BSB: ${bsbStr}<br/>
        Account: ${accountStr}<br/>
        Account Name: ${accountNameStr}
        ${payIdHtml}
      </div>
    ` : '';

    const discountHtml = invoice.totals?.discAmt > 0 ? `<div class="totals-row"><span>Discount</span><span>-$${discAmt}</span></div>` : '';

    // NEW: Render the Job Completion Photo directly on the PDF if it exists
    const completionPhotoHtml = invoice.completionPhotoUrl ? `
      <div style="margin-top: 30px; page-break-inside: avoid;">
        <h3 style="color: #374151; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">Job Completion Proof</h3>
        <img src="${invoice.completionPhotoUrl.startsWith('http') ? invoice.completionPhotoUrl : `${BASE_URL}${invoice.completionPhotoUrl}`}" style="max-width: 100%; max-height: 350px; border-radius: 8px; border: 1px solid #E5E7EB;" />
      </div>
    ` : '';

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            @page { margin: 0; }
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; margin: 0; -webkit-print-color-adjust: exact; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; }
            .logo { max-height: 120px; max-width: 250px; object-fit: contain; }
            .biz-details { text-align: right; font-size: 11px; color: #6B7280; line-height: 1.6; }
            .title-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 25px; }
            .biz-name { font-size: 28px; font-weight: 800; color: #1F2937; margin: 0; }
            .doc-type { font-size: 22px; font-weight: 800; color: #6B7280; margin: 0; }
            .divider { border-top: 2px solid #111827; margin: 15px 0 25px 0; }
            .meta-row { display: flex; justify-content: space-between; font-size: 11px; color: #374151; }
            .bill-to-details { line-height: 1.6; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 40px; font-size: 11px; }
            .items-table th { background-color: #1D4ED8; color: #ffffff; padding: 12px 10px; font-weight: 700; text-align: left; }
            .items-table td { padding: 12px 10px; color: #374151; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .totals-container { display: flex; justify-content: flex-end; margin-top: 20px; page-break-inside: avoid; }
            .totals { width: 260px; font-size: 11px; color: #374151; }
            .totals-row { display: flex; justify-content: space-between; padding: 6px 10px; }
            .balance-due { background-color: #000000; color: #ffffff; font-size: 15px; font-weight: 700; padding: 12px 10px; margin-top: 8px; display: flex; justify-content: space-between; align-items: center; }
          </style>
        </head>
        <body>
          <div class="header"><div>${logoImg}</div><div class="biz-details"><div>${bizCityStr}</div><div>${bizPhoneStr}</div><div>${bizWebStr}</div></div></div>
          <div class="title-row"><h1 class="biz-name">${bizNameStr}</h1><h2 class="doc-type">Invoice</h2></div>
          <div class="divider"></div>
          <div class="meta-row">
            <div>
              <div style="color: #9CA3AF; margin-bottom: 2px;">Bill To:</div>
              <div class="bill-to-details"><div style="font-weight: 700;">${customerName}</div>${customerEmailHtml}${customerPhoneHtml}</div>
            </div>
            <div style="text-align: right;">
              <div><span style="color: #9CA3AF;">Invoice No:</span> ${invoiceNum}</div>
              <div><span style="color: #9CA3AF;">Date:</span> ${invDate}</div>
              <div><span style="color: #9CA3AF;">Terms:</span> ${termsStr}</div>
              <div><span style="color: #9CA3AF;">Due Date:</span> ${dueDate}</div>
            </div>
          </div>
          <table class="items-table">
            <tr><th>Description</th><th class="text-center">Quantity</th><th class="text-right">Rate</th><th class="text-right">Amount</th></tr>
            ${itemsHtml}
          </table>
          <div class="totals-container">
            <div class="totals">
              <div class="totals-row"><span>Subtotal</span><span>$${subtotal}</span></div>
              ${discountHtml}
              <div class="totals-row"><span>${invoice.totals?.applyGst ? `GST ${gstRate}%` : 'GST'}</span><span>${invoice.totals?.applyGst ? `$${gstAmt}` : '$0.00'}</span></div>
              <div class="totals-row"><span>Total</span><span>$${totalDue}</span></div>
              <div class="totals-row"><span>Paid</span><span>$${isPaidAmt}</span></div>
              <div class="balance-due"><span>Balance Due</span><span>$${balanceAmt}</span></div>
            </div>
          </div>
          ${paymentDetailsHtml}
          ${completionPhotoHtml}
        </body>
      </html>
    `;
  };

  const handlePreviewPdf = () => {
    const html = generateHTMLString();
    navigation.navigate('PdfPreview', { html, title: `Invoice_${invoice.number}.pdf` });
  };

  const handleSharePdf = async () => {
    try {
      showToast('Generating Document...');
      const html = generateHTMLString();
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: `Invoice_${invoice.number}.pdf` });
      }
    } catch (err) {
      Alert.alert("PDF Error", "Could not share the PDF.");
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title={`INVOICE #${invoice.number}`} subtitle={`${invoice.customer} · ${new Date(invoice.date).toLocaleDateString()}`} onBack={() => navigation.navigate('InvoicesList')} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        {/* Editable Customer Fields */}
        <FieldLabel>Customer Details</FieldLabel>
        <TextInput style={styles.input} value={localCustomer} onChangeText={setLocalCustomer} placeholder="Customer Name" />
        <TextInput style={styles.input} value={localPhone} onChangeText={setLocalPhone} placeholder="Phone Number" keyboardType="phone-pad" />
        <TextInput style={styles.input} value={localEmail} onChangeText={setLocalEmail} placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" />

        {/* FIXED: The explicit save button for Customer Details */}
        <Button variant="outline" style={{ marginTop: 4, marginBottom: 16 }} onPress={handleUpdateInvoice} disabled={savingInvoice}>
          {savingInvoice ? "Saving..." : "💾 Save Customer Details"}
        </Button>

        <FieldLabel style={{ marginBottom: 6 }}>Payment mode</FieldLabel>
        <View style={{ marginBottom: 12 }}>
          <PaymentModeSelector value={invoice.paymentMode} onChange={setPaymentMode} />
        </View>
        
        <View style={styles.gstBox}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', fontSize: 12.5, color: invoice.gstIncluded ? colors.green : colors.red }}>
              {invoice.gstIncluded ? 'Reported income' : 'Cash Bonus'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Text style={{ fontSize: 11, color: colors.gray, marginRight: 8 }}>Include GST at</Text>
              <TextInput
                style={styles.gstInput}
                value={localGstRate}
                onChangeText={setLocalGstRate}
                onBlur={handleSaveGstRate}
                keyboardType="numeric"
                editable={invoice.gstIncluded}
              />
              <Text style={{ fontSize: 11, color: colors.gray, marginLeft: 4 }}>%</Text>
            </View>
          </View>
          <Toggle on={invoice.gstIncluded} onToggle={toggleGstIncluded} />
        </View>

        <InvoiceLineItemsEditor items={invoice.items} onChange={updateItems} />
        <View style={styles.divider} />
        <DiscountEditor discount={invoice.discount} onChange={setDiscount} />
        <InvoiceTotals totals={invoice.totals} discount={invoice.discount} gstRate={settings?.gstRate || 10} />
        
        {/* NEW FEATURE: Completion Photo (Appears on PDF) */}
        <FieldLabel style={{ marginTop: 24 }}>Job Completion Photo (Sent with PDF Invoice)</FieldLabel>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <PhotoUploadButton 
            photoUrl={invoice.completionPhotoUrl} 
            onUpload={async (asset) => {
              try {
                await invoiceService.uploadCompletionPhoto(invoice._id, asset);
                showToast('Completion photo attached to invoice!');
                refresh();
              } catch (e) { Alert.alert('Error', 'Upload failed'); }
            }} 
          />
          <Text style={{ fontSize: 11, color: colors.gray, flex: 1 }}>
            {invoice.completionPhotoUrl ? "Photo attached. It will appear at the bottom of the PDF." : "Tap the icon to attach a completion photo."}
          </Text>
        </View>

        {/* Restored Cost/Material Tracking (Internal Only) */}
        <FieldLabel style={{ marginTop: 20 }}>Internal Tracking (Not on PDF)</FieldLabel>
        <View style={styles.expenseCard}>
          <Text style={styles.cardTitle}>Materials</Text>
          <CostItemsEditor
            items={invoice.costs?.materials}
            kind="materials"
            onSetItems={(items) => setCostItems('materials', items)}
            onUploadPhoto={async (idx, asset) => {
              try {
                await invoiceService.uploadCostItemPhoto(invoice._id, 'materials', idx, asset);
                showToast('Material photo saved!');
                refresh();
              } catch (e) { Alert.alert('Upload Failed', 'Could not save the photo.'); }
            }}
          />
          <View style={styles.divider} />
          <Text style={styles.cardTitle}>Other Expenses</Text>
          <CostItemsEditor
            items={invoice.costs?.other}
            kind="other"
            onSetItems={(items) => setCostItems('other', items)}
            onUploadPhoto={async (idx, asset) => {
              try {
                await invoiceService.uploadCostItemPhoto(invoice._id, 'other', idx, asset);
                showToast('Expense photo saved!');
                refresh();
              } catch (e) { Alert.alert('Upload Failed', 'Could not save the photo.'); }
            }}
          />
        </View>

        <InvoiceActions
          isPaid={isPaid}
          customerEmail={invoice.customerEmail}
          onUpdateInvoice={handleUpdateInvoice}
          onTogglePaid={async () => { await togglePaidStatus(); showToast(isPaid ? 'Marked as unpaid' : 'Marked as paid'); }}
          onPreviewPdf={handlePreviewPdf}
          onShare={handleSharePdf}
        />

        <Button variant="outline" style={{ borderColor: colors.red, marginTop: 16 }} onPress={handleDeleteInvoice}>
          <Text style={{ color: colors.red, fontWeight: '700' }}>🗑️ Delete Invoice</Text>
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, backgroundColor: '#fff', marginBottom: 8, color: colors.charcoal },
  divider: { borderTopWidth: 1, borderTopColor: colors.grayLight, marginVertical: 12 },
  expenseCard: { backgroundColor: colors.blueTint, borderRadius: 10, padding: 14, marginTop: 6 },
  cardTitle: { fontWeight: '800', fontSize: 12.5, color: colors.blue, marginBottom: 10 },
  gstBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.grayLight, marginBottom: 14 },
  gstInput: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, fontSize: 12, width: 45, textAlign: 'center', backgroundColor: '#fff' }
});