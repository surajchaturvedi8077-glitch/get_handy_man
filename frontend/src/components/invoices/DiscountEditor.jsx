/**
 * DiscountEditor.jsx
 * ------------------------------------------------------------------
 * Lets the worker set a discount as either a flat amount ($) or a
 * percentage, and the discount value. Controlled: {discount, onChange}.
 * ------------------------------------------------------------------
 */
import FieldLabel from '../ui/FieldLabel.jsx';

export default function DiscountEditor({ discount, onChange }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <FieldLabel style={{ marginBottom: 6 }}>Discount</FieldLabel>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ display: 'flex', background: '#F1F0ED', borderRadius: 8, padding: 3, width: 96, flexShrink: 0 }}>
          {['amount', 'percent'].map((type) => (
            <button
              key={type}
              onClick={() => onChange({ ...discount, type })}
              style={{
                flex: 1,
                border: 'none',
                background: discount.type === type ? '#fff' : 'transparent',
                color: 'var(--charcoal)',
                boxShadow: discount.type === type ? '0 1px 3px rgba(0,0,0,.12)' : 'none',
                fontSize: 11,
                fontWeight: 700,
                padding: '7px 0',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {type === 'amount' ? 'A$' : '%'}
            </button>
          ))}
        </div>
        <input
          type="number"
          value={discount.value}
          onChange={(e) => onChange({ ...discount, value: Number(e.target.value) })}
          style={{ flex: 1, border: '1px solid var(--gray-light)', borderRadius: 8, padding: '8px 10px', fontSize: 12.5 }}
        />
      </div>
    </div>
  );
}
