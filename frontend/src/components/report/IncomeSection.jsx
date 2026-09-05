/**
 * IncomeSection.jsx
 * ------------------------------------------------------------------
 * The Income block of the business Report: Reported income, Cash
 * Bonus (was "NRI"), GST on material (10% of total material cost),
 * and Reportable GST (GST collected minus GST on material). Values
 * come straight from GET /api/report — see reportService.js.
 * ------------------------------------------------------------------
 */
import FieldLabel from '../ui/FieldLabel.jsx';
import StatRow from '../ui/StatRow.jsx';
import { money } from '../../utils/money.js';

export default function IncomeSection({ income }) {
  return (
    <div>
      <FieldLabel style={{ marginBottom: 8 }}>Income</FieldLabel>
      <StatRow
        label="Reported income"
        sub="GST included on these invoices"
        value={money(income.reportedIncome)}
        bg="var(--green-tint)"
        fg="var(--green)"
      />
      <StatRow
        label="Cash Bonus"
        sub="GST not included on these invoices"
        value={money(income.cashBonus)}
        bg="var(--red-tint)"
        fg="var(--red)"
      />
      <StatRow
        label="GST on material"
        sub="10% of total material cost"
        value={money(income.gstOnMaterial)}
        bg="var(--blue-tint)"
        fg="var(--blue)"
      />
      <StatRow
        label="Reportable GST"
        sub="GST collected minus GST on material"
        value={money(income.reportableGst)}
        bg="var(--blue-tint)"
        fg="var(--blue)"
      />
    </div>
  );
}
