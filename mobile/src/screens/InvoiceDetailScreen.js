/**
 * InvoiceDetailScreen.js
 * ------------------------------------------------------------------
 * Owns useInvoice() for one invoice and wires every small invoice
 * component (line items, discount, GST toggle, totals, cost items
 * for materials & other expenses, payment mode/status) together.
 * Each editor persists its own change immediately via the hook,
 * which calls services/invoiceService.js — this screen never talks
 * to the API directly.
 * ------------------------------------------------------------------
 */
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
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

  if (loading) return <View style={styles.screen}><LoadingState /></View>;
  if (error) return <View style={styles.screen}><ErrorState>{error}</ErrorState></View>;
  if (!invoice) return null;

  const isPaid = invoice.status === 'paid';

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={`INVOICE #${invoice.number}`}
        subtitle={`${invoice.customer} · ${new Date(invoice.date).toLocaleDateString()}`}
      />
      <ScrollView contentContainerStyle={styles.content}>
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
          onPreviewPdf={() => showToast('Wire this up to your PDF preview (e.g. expo-print)')}
          onShare={() => showToast('Wire this up to your share flow (e.g. expo-sharing)')}
        />

        <FieldLabel style={{ marginTop: 20, marginBottom: 4 }}>Job costs · internal, not shown to customer</FieldLabel>
        <Text style={styles.hint}>Attach receipt photos for each expense.</Text>

        <FieldLabel style={{ marginBottom: 6 }}>Material expenses</FieldLabel>
        <CostItemsEditor
          items={invoice.costs.materials}
          kind="materials"
          onSetItems={(items) => setCostItems('materials', items)}
          onUploadPhoto={(idx, asset) => uploadCostItemPhoto('materials', idx, asset)}
        />

        <FieldLabel style={{ marginTop: 14, marginBottom: 6 }}>Other expenses</FieldLabel>
        <CostItemsEditor
          items={invoice.costs.other}
          kind="other"
          onSetItems={(items) => setCostItems('other', items)}
          onUploadPhoto={(idx, asset) => uploadCostItemPhoto('other', idx, asset)}
        />

        <View style={styles.expenseTotal}>
          <FieldLabel style={{ color: colors.blue }}>Total expense</FieldLabel>
          <Text style={styles.expenseTotalValue}>{money(invoice.costTotals?.total)}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  divider: { borderTopWidth: 1, borderTopColor: colors.grayLight, marginVertical: 12 },
  hint: { fontSize: 10, color: '#9CA3AF', marginBottom: 10 },
  expenseTotal: { backgroundColor: colors.blueTint, borderRadius: 10, padding: 14, marginTop: 12 },
  expenseTotalValue: { fontSize: 17, fontWeight: '800' },
});
