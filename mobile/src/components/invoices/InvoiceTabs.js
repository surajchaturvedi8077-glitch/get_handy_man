/**
 * InvoiceTabs.js
 * ------------------------------------------------------------------
 * Unpaid / Paid / All / Report (was "Summary") — same tab set as the
 * web app's dark segmented control at the top of the Invoices screen.
 * ------------------------------------------------------------------
 */
import SegmentedControl from '../ui/SegmentedControl';

const OPTIONS = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
  { value: 'all', label: 'All' },
  { value: 'report', label: 'Report' },
];

export default function InvoiceTabs({ value, onChange }) {
  return <SegmentedControl options={OPTIONS} value={value} onChange={onChange} dark />;
}
