/**
 * EnquiryFilterTabs.js
 * ------------------------------------------------------------------
 * Status filter for the enquiries list (New / Quoted / Accepted / All).
 * ------------------------------------------------------------------
 */
import SegmentedControl from '../ui/SegmentedControl';

const OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'all', label: 'All' },
];

export default function EnquiryFilterTabs({ value, onChange }) {
  return <SegmentedControl options={OPTIONS} value={value} onChange={onChange} />;
}
