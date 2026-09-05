/**
 * InvoiceList.jsx
 * ------------------------------------------------------------------
 * Renders a list of InvoiceListItem rows, plus a "Total unpaid" strip
 * when viewing the Unpaid tab. Empty-state message otherwise.
 * ------------------------------------------------------------------
 */
import InvoiceListItem from './InvoiceListItem.jsx';
import { money } from '../../utils/money.js';

export default function InvoiceList({ invoices, showUnpaidTotal }) {
  const unpaidTotal = invoices
    .filter((i) => i.status === 'unpaid')
    .reduce((s, i) => s + (i.totals?.total || 0), 0);

  return (
    <div>
      {showUnpaidTotal && unpaidTotal > 0 && (
        <div style={{ background: 'var(--orange-tint)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--orange-deep)', letterSpacing: 0.5 }}>
            TOTAL UNPAID
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--orange-deep)', marginTop: 2 }}>
            {money(unpaidTotal)}
          </div>
        </div>
      )}
      {invoices.length ? (
        invoices.map((inv) => <InvoiceListItem key={inv._id} invoice={inv} />)
      ) : (
        <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 12.5, padding: '30px 0' }}>
          No invoices here.
        </div>
      )}
    </div>
  );
}
