/**
 * EnquiryFilterTabs.jsx
 * ------------------------------------------------------------------
 * Status filter for the enquiries list (New / Quoted / Accepted /
 * Rejected / All). Thin wrapper around SegmentedControl so the
 * option list lives in one place.
 * ------------------------------------------------------------------
 */
import SegmentedControl from '../ui/SegmentedControl.jsx';

const OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'all', label: 'All' },
];

export default function EnquiryFilterTabs({ value, onChange }) {
  return <SegmentedControl options={OPTIONS} value={value} onChange={onChange} />;
}
