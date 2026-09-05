/**
 * ExpensesSection.jsx
 * ------------------------------------------------------------------
 * The Expenses & profit block: material expenses, other expenses
 * (was "vehicle expenses"), and profit (income minus both).
 * ------------------------------------------------------------------
 */
import FieldLabel from '../ui/FieldLabel.jsx';
import StatRow from '../ui/StatRow.jsx';
import { money } from '../../utils/money.js';

export default function ExpensesSection({ expenses, profit }) {
  return (
    <div>
      <FieldLabel style={{ margin: '16px 0 8px' }}>Expenses & profit</FieldLabel>
      <StatRow
        label="Material expenses"
        sub="From receipts attached to invoices"
        value={money(expenses.materialExpenses)}
        bg="var(--orange-tint)"
        fg="var(--orange-deep)"
      />
      <StatRow
        label="Other expenses"
        sub="From receipts attached to invoices"
        value={money(expenses.otherExpenses)}
        bg="var(--orange-tint)"
        fg="var(--orange-deep)"
      />
      <StatRow
        label="Profit"
        sub="Income minus material & other costs"
        value={money(profit)}
        bg="#F1F0ED"
        fg="var(--charcoal)"
      />
    </div>
  );
}
