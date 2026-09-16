import React from 'react';
import { View, ScrollView, Text, StyleSheet, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import ScreenHeader from '../components/layout/ScreenHeader';
import PaymentModeSelector from '../components/invoices/PaymentModeSelector';
import GstIncludeToggle from '../components/invoices/GstIncludeToggle';
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

export default function InvoiceDetailScreen() {
  const { params } = useRoute();
  const { showToast } = useToast();
  const { settings } = useSettings();
  const {
    invoice,
    loading,
    error,
    updateItems,
    setDiscount,
    toggleGstIncluded,
    setPaymentMode,
    togglePaidStatus,
    setCostItems,
    uploadCostItemPhoto,
  } = useInvoice(params.id);

  if (loading || !invoice) return <View style={styles.screen}><LoadingState /></View>;
  if (error) return <View style={styles.screen}><ErrorState>{error}</ErrorState></View>;

  const isPaid = invoice.status === 'paid';

  const generatePDFUri = async () => {
    // Safely mapping items and handling missing fields to prevent crashes
    const itemsHtml = invoice.items && invoice.items.length 
      ? invoice.items.map(i => `
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 10px;">${i.name || ''}</td>
            <td style="padding: 10px; text-align: right;">$${i.amt || 0}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="2">No items</td></tr>';

    const html = `
      <html>
        <body style="font-family: Helvetica, Arial, sans-serif; padding: 40px; color: #1F2937;">
          <h1 style="color: #1F2937; margin-bottom: 0;">INVOICE #${invoice.number || '000'}</h1>
          <p style="color: #6B7280; font-size: 14px; margin-top: 5px;">${new Date(invoice.date).toLocaleDateString()}</p>
          
          <div style="margin-top: 30px;">
            <p style="margin: 0; font-size: 12px; color: #6B7280; font-weight: bold;">BILL TO</p>
            <p style="margin: 5px 0;"><strong>${invoice.customer || 'Customer'}</strong></p>
          </div>
          
          <table style="width: 100%; text-align: left; margin-top: 40px; border-collapse: collapse;">
            <tr style="background-color: #1D4ED8; color: #ffffff;">
              <th style="padding: 10px;">Description</th>
              <th style="padding: 10px; text-align: right;">Amount</th>
            </tr>
            ${itemsHtml}
          </table>
          
          <div style="margin-top: 30px; text-align: right;">
            <p>Subtotal: $${invoice.totals?.subtotal || 0}</p>
            ${invoice.totals?.discAmt > 0 ? `<p>Discount: -$${invoice.totals.discAmt}</p>` : ''}
            <p>${invoice.totals?.applyGst ? `GST (${settings?.gstRate || 10}%): $${invoice.totals.gst}` : 'GST: Not included'}</p>
            <h2 style="color: #D9690C;">Total Due: $${invoice.totals?.total || 0}</h2>
          </div>
        </body>
      </html>
    `;
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    return uri;
  };

  const handlePreviewPdf = async () => {
    try {
      showToast('Generating PDF...');
      const uri = await generatePDFUri();
      
      // Ensure Android understands it is sharing a PDF file
      await Sharing.shareAsync(uri, { 
        UTI: '.pdf', 
        mimeType: 'application/pdf',
        dialogTitle: `Invoice_${invoice.number}.pdf`
      });
    } catch (err) {
      Alert.alert("PDF Error", err.message || "Could not generate or share the PDF.");
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title={`INVOICE #${invoice.number}`} subtitle={`${invoice.customer} · ${new Date(invoice.date).toLocaleDateString()}`} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FieldLabel style={{ marginBottom: 6 }}>Payment mode</FieldLabel>
        <View style={{ marginBottom: 12 }}>
          <PaymentModeSelector value={invoice.paymentMode} onChange={setPaymentMode} />
        </View>

        <GstIncludeToggle gstIncluded={invoice.gstIncluded} onToggle={toggleGstIncluded} />

        <InvoiceLineItemsEditor items={invoice.items} onChange={updateItems} />

        <View style={styles.divider} />

        <DiscountEditor discount={invoice.discount} onChange={setDiscount} />

        <InvoiceTotals totals={invoice.totals} discount={invoice.discount} gstRate={settings?.gstRate || 10} />

        <InvoiceActions
          isPaid={isPaid}
          onTogglePaid={async () => {
            await togglePaidStatus();
            showToast(isPaid ? 'Marked as unpaid' : 'Marked as paid');
          }}
          onPreviewPdf={handlePreviewPdf}
          onShare={handlePreviewPdf}
        />

        <FieldLabel style={{ marginVertical: 20, marginBottom: 4 }}>Job costs · internal, not shown to customer</FieldLabel>
        <Text style={styles.hintText}>Attach receipt photos for each expense.</Text>

        <FieldLabel style={{ marginBottom: 6 }}>Material expenses</FieldLabel>
        <CostItemsEditor
          items={invoice.costs.materials}
          kind="materials"
          onSetItems={(items) => setCostItems('materials', items)}
          onUploadPhoto={(idx, file) => uploadCostItemPhoto('materials', idx, file)}
        />

        <FieldLabel style={{ marginVertical: 14, marginBottom: 6 }}>Other expenses</FieldLabel>
        <CostItemsEditor
          items={invoice.costs.other}
          kind="other"
          onSetItems={(items) => setCostItems('other', items)}
          onUploadPhoto={(idx, file) => uploadCostItemPhoto('other', idx, file)}
        />

        <View style={styles.expenseCard}>
          <FieldLabel style={{ color: colors.blue }}>Total expense</FieldLabel>
          <Text style={styles.expenseTotal}>{money(invoice.costTotals?.total)}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  divider: { borderTopWidth: 1, borderTopColor: colors.grayLight, marginVertical: 12 },
  hintText: { fontSize: 10, color: '#9CA3AF', marginBottom: 10 },
  expenseCard: { backgroundColor: colors.blueTint, borderRadius: 10, padding: 14, marginTop: 12 },
  expenseTotal: { fontSize: 17, fontWeight: '800', color: colors.charcoal },
});