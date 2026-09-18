import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Alert, TextInput } from 'react-native';
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
import FieldLabel from '../components/ui/FieldLabel';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import useInvoice from '../hooks/useInvoice';
import useSettings from '../hooks/useSettings';
import useToast from '../hooks/useToast';
import { money } from '../utils/money';
import { colors } from '../theme/colors';

const BASE_URL = 'https://gold-worm-334910.hostingersite.com';
sep
// =====================================================================
// FIXED: MOVED STYLES TO THE VERY TOP TO PREVENT "OUT OF REACH" ERRORS
// =====================================================================
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  divider: { borderTopWidth: 1, borderTopColor: colors.grayLight, marginVertical: 12 },
  hintText: { fontSize: 10, color: '#9CA3AF', marginBottom: 10 },
  expenseCard: { backgroundColor: colors.blueTint, borderRadius: 10, padding: 14, marginTop: 12 },
  expenseTotal: { fontSize: 17, fontWeight: '800', color: colors.charcoal },
  gstBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.grayLight, marginBottom: 14 },
  gstInput: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, fontSize: 12, width: 45, textAlign: 'center', backgroundColor: '#fff' }
});

export default function InvoiceDetailScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { settings, update: updateSettings } = useSettings();
  const {
    invoice, loading, error, updateItems, setDiscount, toggleGstIncluded,
    setPaymentMode, togglePaidStatus, setCostItems, uploadCostItemPhoto,
  } = useInvoice(params.id);

  const [localGstRate, setLocalGstRate] = useState(settings?.gstRate ? String(settings.gstRate) : '10');

  if (loading || !invoice) return <View style={styles.screen}><LoadingState /></View>;
  if (error) return <View style={styles.screen}><ErrorState>{error}</ErrorState></View>;

  const isPaid = invoice.status === 'paid';

  const handleSaveGstRate = () => {
    updateSettings({ gstRate: Number(localGstRate) || 0 });
    showToast('GST Rate Updated');
  };

  const generateHTMLString = () => {
    // 1. Build the items safely
    const itemsHtml = invoice.items && invoice.items.length 
      ? invoice.items.map(i => `<tr><td class="text-left" style="border-bottom: 1px solid #E5E7EB;">${i.name ? i.name : ''}</td><td class="text-center" style="border-bottom: 1px solid #E5E7EB;">${i.qty ? i.qty : 1}</td><td class="text-right" style="border-bottom: 1px solid #E5E7EB;">$${parseFloat(i.amt ? i.amt : 0).toFixed(2)}</td><td class="text-right" style="border-bottom: 1px solid #E5E7EB;">$${(parseFloat(i.amt ? i.amt : 0) * parseInt(i.qty ? i.qty : 1)).toFixed(2)}</td></tr>`).join('')
      : '<tr><td colspan="4" class="text-center" style="border-bottom: 1px solid #E5E7EB;">No items</td></tr>';

    // 2. Prepare variables safely outside the HTML string to prevent syntax bugs
    const bsbStr = settings?.bsb ? settings.bsb : '';
    const accountStr = settings?.account ? settings.account : '';
    const accountNameStr = settings?.accountName ? settings.accountName : '';
    const bankNameStr = settings?.bankName ? settings.bankName : '';
    const payIdHtml = settings?.payId ? `<br/>PayID: ${settings.payId}` : '';
    
    const bizNameStr = settings?.businessName ? settings.businessName : 'Get Handyman';
    const bizCityStr = settings?.bizCityState ? settings.bizCityState : '';
    const bizPhoneStr = settings?.bizPhone ? settings.bizPhone : '';
    const bizWebStr = settings?.website ? settings.website : '';
    
    const logoSrc = settings?.logoUrl ? (settings.logoUrl.startsWith('http') ? settings.logoUrl : `${BASE_URL}${settings.logoUrl}`) : '';
    const logoImg = logoSrc ? `<img src="${logoSrc}" class="logo" />` : `<h2 style="margin: 0; color: #1F2937;">${bizNameStr}</h2>`;
    
    const invDate = new Date(invoice.date).toLocaleDateString('en-GB');
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-GB') : invDate;
    
    const customerName = invoice.customer ? invoice.customer : 'Customer Name';
    const customerEmailHtml = invoice.customerEmail ? `<div>${invoice.customerEmail}</div>` : '';
    const customerPhoneHtml = invoice.customerPhone ? `<div>${invoice.customerPhone}</div>` : '';
    
    const invoiceNum = invoice.number ? invoice.number.replace('GH-', '') : '0';
    const termsStr = invoice.terms === 'Due on receipt' ? 'NET 0' : invoice.terms;
    
    const subtotal = parseFloat(invoice.totals?.subtotal ? invoice.totals.subtotal : 0).toFixed(2);
    const discAmt = parseFloat(invoice.totals?.discAmt ? invoice.totals.discAmt : 0).toFixed(2);
    const gstAmt = parseFloat(invoice.totals?.gst ? invoice.totals.gst : 0).toFixed(2);
    const totalDue = parseFloat(invoice.totals?.total ? invoice.totals.total : 0).toFixed(2);
    const gstRate = settings?.gstRate ? settings.gstRate : 10;
    
    const isPaidAmt = invoice.status === 'paid' ? totalDue : '0.00';
    const balanceAmt = invoice.status === 'paid' ? '0.00' : totalDue;

    const paymentDetailsHtml = bankNameStr ? `
      <div style="margin-top: 40px; font-size: 10px; color: #6B7280; line-height: 1.6;">
        <strong>Payment Details</strong><br/>
        Bank: ${bankNameStr}<br/>
        BSB: ${bsbStr}<br/>
        Account: ${accountStr}<br/>
        Account Name: ${accountNameStr}
        ${payIdHtml}
      </div>
    ` : '';

    const discountHtml = invoice.totals?.discAmt > 0 ? `<div class="totals-row"><span>Discount</span><span>-$${discAmt}</span></div>` : '';

    // 3. Render clean HTML
    return `
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
            .doc-type { font-size: 22px; font-weight: 800; color: #6B7280; margin: 0; }
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
            .items-table th { background-color: #1D4ED8; color: #ffffff; padding: 12px 10px; font-weight: 700; }
            .items-table td { padding: 12px 10px; color: #374151; }
            .text-left { text-align: left; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .totals-container { display: flex; justify-content: flex-end; margin-top: 20px; }
            .totals { width: 260px; font-size: 11px; color: #374151; }
            .totals-row { display: flex; justify-content: space-between; padding: 6px 10px; }
            .balance-due { background-color: #000000; color: #ffffff; font-size: 15px; font-weight: 700; padding: 12px 10px; margin-top: 8px; display: flex; justify-content: space-between; align-items: center; }
            .bg-shapes { position: absolute; bottom: 0; left: 0; width: 350px; height: 350px; z-index: -1; opacity: 0.6; pointer-events: none; }
          </style>
        </head>
        <body>
          <svg class="bg-shapes" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="160" r="45" fill="#F4E8FF" /><circle cx="110" cy="120" r="22" fill="#F1F5F9" /><circle cx="160" cy="180" r="35" fill="#FFF1F2" /><circle cx="80" cy="190" r="18" fill="#FDF4FF" /></svg>
          <div class="header"><div>${logoImg}</div><div class="biz-details"><div>${bizCityStr}</div><div>${bizPhoneStr}</div><div>${bizWebStr}</div></div></div>
          <div class="title-row"><h1 class="biz-name">${bizNameStr}</h1><h2 class="doc-type">Invoice</h2></div>
          <div class="divider"></div>
          <div class="meta-row">
            <div class="bill-to"><div class="bill-to-label">Bill To:</div><div class="bill-to-details"><div style="font-weight: 700;">${customerName}</div>${customerEmailHtml}${customerPhoneHtml}</div></div>
            <div class="meta-right"><table><tr><td class="label">Invoice No:</td><td class="val">${invoiceNum}</td></tr><tr><td class="label">Date:</td><td class="val">${invDate}</td></tr><tr><td class="label">Terms:</td><td class="val">${termsStr}</td></tr><tr><td class="label">Due Date:</td><td class="val">${dueDate}</td></tr></table></div>
          </div>
          <table class="items-table"><tr><th class="text-left">Description</th><th class="text-center">Quantity</th><th class="text-right">Rate</th><th class="text-right">Amount</th></tr>${itemsHtml}</table>
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
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: `Invoice_${invoice.number}.pdf` });
    } catch (err) {
      Alert.alert("PDF Error", "Could not share the PDF.");
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title={`INVOICE #${invoice.number}`} subtitle={`${invoice.customer} · ${new Date(invoice.date).toLocaleDateString()}`} onBack={() => navigation.navigate('InvoicesList')} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
        
        <InvoiceActions
          isPaid={isPaid}
          customerEmail={invoice.customerEmail}
          onTogglePaid={async () => { await togglePaidStatus(); showToast(isPaid ? 'Marked as unpaid' : 'Marked as paid'); }}
          onPreviewPdf={handlePreviewPdf}
          onShare={handleSharePdf}
        />

        <FieldLabel style={{ marginVertical: 20, marginBottom: 4 }}>Job costs · internal, not shown to customer</FieldLabel>
        <Text style={styles.hintText}>Attach receipt photos for each expense.</Text>
        <FieldLabel style={{ marginBottom: 6 }}>Material expenses</FieldLabel>
        <CostItemsEditor items={invoice.costs.materials} kind="materials" onSetItems={(items) => setCostItems('materials', items)} onUploadPhoto={(idx, file) => uploadCostItemPhoto('materials', idx, file)} />
        <FieldLabel style={{ marginVertical: 14, marginBottom: 6 }}>Other expenses</FieldLabel>
        <CostItemsEditor items={invoice.costs.other} kind="other" onSetItems={(items) => setCostItems('other', items)} onUploadPhoto={(idx, file) => uploadCostItemPhoto('other', idx, file)} />
        <View style={styles.expenseCard}>
          <FieldLabel style={{ color: colors.blue }}>Total expense</FieldLabel>
          <Text style={styles.expenseTotal}>{money(invoice.costTotals?.total)}</Text>
        </View>
      </ScrollView>
    </View>
  );
}