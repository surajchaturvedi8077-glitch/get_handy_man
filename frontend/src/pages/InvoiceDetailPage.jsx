/**
 * InvoiceDetailPage.jsx
 * ------------------------------------------------------------------
 * Owns useInvoice() for one invoice and wires every small invoice
 * component (line items, discount, GST toggle, totals, cost items
 * for materials & other expenses, payment mode/status) together.
 * Each editor persists its own change immediately via the hook.
 * ------------------------------------------------------------------
 */
import { useParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import ScreenHeader from '../components/layout/ScreenHeader.jsx';
import PaymentModeSelector from '../components/invoices/PaymentModeSelector.jsx';
import GstIncludeToggle from '../components/invoices/GstIncludeToggle.jsx';
import InvoiceLineItemsEditor from '../components/invoices/InvoiceLineItemsEditor.jsx';
import DiscountEditor from '../components/invoices/DiscountEditor.jsx';
import InvoiceTotals from '../components/invoices/InvoiceTotals.jsx';
import InvoiceActions from '../components/invoices/InvoiceActions.jsx';
import CostItemsEditor from '../components/invoices/CostItemsEditor.jsx';
import FieldLabel from '../components/ui/FieldLabel.jsx';
import useInvoice from '../hooks/useInvoice.js';
import useSettings from '../hooks/useSettings.js';
import useToast from '../hooks/useToast.js';
import { money } from '../utils/money.js';

export default function InvoiceDetailPage() {
  const { id } = useParams();
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
  } = useInvoice(id);

  if (loading) return <AppShell activeTab="invoices"><div style={{ padding: 16 }}>Loading…</div></AppShell>;
  if (error) return <AppShell activeTab="invoices"><div style={{ padding: 16, color: 'var(--red)' }}>{error}</div></AppShell>;
  if (!invoice) return null;

  const isPaid = invoice.status === 'paid';

  return (
    <AppShell activeTab="invoices">
      <ScreenHeader title={`INVOICE #${invoice.number}`} subtitle={`${invoice.customer} · ${new Date(invoice.date).toLocaleDateString()}`} />
      <div style={{ padding: 16 }}>
        <FieldLabel style={{ marginBottom: 6 }}>Payment mode</FieldLabel>
        <div style={{ marginBottom: 12 }}>
          <PaymentModeSelector value={invoice.paymentMode} onChange={setPaymentMode} />
        </div>

        <GstIncludeToggle gstIncluded={invoice.gstIncluded} onToggle={toggleGstIncluded} />

        <InvoiceLineItemsEditor items={invoice.items} onChange={updateItems} />

        <hr style={{ border: 'none', borderTop: '1px solid var(--gray-light)', margin: '12px 0' }} />

        <DiscountEditor discount={invoice.discount} onChange={setDiscount} />

        <InvoiceTotals totals={invoice.totals} discount={invoice.discount} gstRate={settings?.gstRate || 10} />

        <InvoiceActions
          isPaid={isPaid}
          onTogglePaid={async () => {
            await togglePaidStatus();
            showToast(isPaid ? 'Marked as unpaid' : 'Marked as paid');
          }}
          onPreviewPdf={() => showToast('Wire this up to your PDF preview')}
          onShare={() => showToast('Wire this up to your share flow')}
        />

        <FieldLabel style={{ margin: '20px 0 4px' }}>Job costs · internal, not shown to customer</FieldLabel>
        <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 10 }}>
          Attach receipt photos for each expense.
        </div>

        <FieldLabel style={{ marginBottom: 6 }}>Material expenses</FieldLabel>
        <CostItemsEditor
          items={invoice.costs.materials}
          kind="materials"
          onSetItems={(items) => setCostItems('materials', items)}
          onUploadPhoto={(idx, file) => uploadCostItemPhoto('materials', idx, file)}
        />

        <FieldLabel style={{ margin: '14px 0 6px' }}>Other expenses</FieldLabel>
        <CostItemsEditor
          items={invoice.costs.other}
          kind="other"
          onSetItems={(items) => setCostItems('other', items)}
          onUploadPhoto={(idx, file) => uploadCostItemPhoto('other', idx, file)}
        />

        <div style={{ background: 'var(--blue-tint)', borderRadius: 10, padding: '12px 14px', marginTop: 12 }}>
          <FieldLabel style={{ color: 'var(--blue)' }}>Total expense</FieldLabel>
          <div style={{ fontSize: 17, fontWeight: 800 }}>{money(invoice.costTotals?.total)}</div>
        </div>
      </div>
    </AppShell>
  );
}
