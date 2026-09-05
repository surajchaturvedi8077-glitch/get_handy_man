/**
 * InvoiceTotals.jsx
 * ------------------------------------------------------------------
 * Read-only breakdown of subtotal -> discount -> GST -> total due,
 * using the `totals` object the API already computed for this
 * invoice (see gstService.calcInvoiceTotals) — no maths done here.
 * ------------------------------------------------------------------
 */
import { money } from '../../utils/money.js';

export default function InvoiceTotals({ totals, discount, gstRate }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--gray)', marginBottom: 5 }}>
        <span>Subtotal</span>
        <span>{money(totals.subtotal)}</span>
      </div>
      {totals.discAmt > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--gray)', marginBottom: 5 }}>
          <span>Discount{discount.type === 'percent' ? ` (${discount.value}%)` : ''}</span>
          <span>&minus;{money(totals.discAmt)}</span>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--gray)' }}>
        <span>{totals.applyGst ? `GST (${gstRate}%)` : 'GST'}</span>
        <span>{totals.applyGst ? money(totals.gst) : 'Not included · Cash Bonus'}</span>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          background: 'var(--orange-tint)',
          borderRadius: 8,
          padding: '12px 14px',
          marginTop: 12,
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 13 }}>Total due</span>
        <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--orange-deep)' }}>{money(totals.total)}</span>
      </div>
    </div>
  );
}
