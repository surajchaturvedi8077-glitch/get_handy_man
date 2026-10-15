import SegmentedControl from '../ui/SegmentedControl';

const OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'all', label: 'All' },
];

export default function EnquiryFilterTabs({ value, onChange }) {
  return <SegmentedControl options={OPTIONS} value={value} onChange={onChange} />;
}