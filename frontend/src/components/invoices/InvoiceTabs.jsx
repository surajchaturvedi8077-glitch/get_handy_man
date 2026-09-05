/**
 * InvoiceTabs.jsx
 * ------------------------------------------------------------------
 * The dark segmented control at the top of the Invoices screen:
 * Unpaid / Paid / All / Report (was "Summary").
 * ------------------------------------------------------------------
 */
import SegmentedControl from '../ui/SegmentedControl.jsx';

const OPTIONS = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
  { value: 'all', label: 'All' },
  { value: 'report', label: 'Report' },
];

export default function InvoiceTabs({ value, onChange }) {
  return <SegmentedControl options={OPTIONS} value={value} onChange={onChange} dark />;
}
