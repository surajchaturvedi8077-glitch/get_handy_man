/**
 * InvoiceListItem.jsx
 * ------------------------------------------------------------------
 * One row in the invoices list: number, paid/unpaid chip, customer,
 * date, and total due (from the API's computed `totals`).
 * ------------------------------------------------------------------
 */
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card.jsx';
import Chip from '../ui/Chip.jsx';
import { money } from '../../utils/money.js';

export default function InvoiceListItem({ invoice }) {
  const navigate = useNavigate();
  const paid = invoice.status === 'paid';
  return (
    <Card onClick={() => navigate(`/invoices/${invoice._id}`)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: 13.5 }}>#{invoice.number}</span>
        <Chip tone={paid ? 'green' : 'red'}>{paid ? 'Paid' : 'Unpaid'}</Chip>
      </div>
      <div style={{ fontSize: 12, color: 'var(--charcoal2)', marginTop: 4 }}>{invoice.customer}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 10.5, color: 'var(--gray)' }}>
          {new Date(invoice.date).toLocaleDateString()}
        </span>
        <span style={{ fontWeight: 800, fontSize: 13 }}>{money(invoice.totals?.total)}</span>
      </div>
    </Card>
  );
}
