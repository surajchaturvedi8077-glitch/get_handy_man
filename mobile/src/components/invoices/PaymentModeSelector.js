/**
 * PaymentModeSelector.js
 * ------------------------------------------------------------------
 * Online vs Cash toggle for how the invoice will be paid.
 * ------------------------------------------------------------------
 */
import SegmentedControl from '../ui/SegmentedControl';

const OPTIONS = [
  { value: 'online', label: 'Online' },
  { value: 'cash', label: 'Cash' },
];

export default function PaymentModeSelector({ value, onChange }) {
  return <SegmentedControl options={OPTIONS} value={value} onChange={onChange} />;
}
