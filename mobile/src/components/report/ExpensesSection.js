/**
 * ExpensesSection.js
 * ------------------------------------------------------------------
 * The Expenses & profit block: material expenses, other expenses
 * (was "vehicle expenses"), and profit (income minus both).
 * ------------------------------------------------------------------
 */
import { View } from 'react-native';
import FieldLabel from '../ui/FieldLabel';
import StatRow from '../ui/StatRow';
import { money } from '../../utils/money';
import { colors } from '../../theme/colors';

export default function ExpensesSection({ expenses, profit }) {
  return (
    <View>
      <FieldLabel style={{ marginTop: 16, marginBottom: 8 }}>Expenses & profit</FieldLabel>
      <StatRow
        label="Material expenses"
        sub="From receipts attached to invoices"
        value={money(expenses.materialExpenses)}
        bg={colors.orangeTint}
        fg={colors.orangeDeep}
      />
      <StatRow
        label="Other expenses"
        sub="From receipts attached to invoices"
        value={money(expenses.otherExpenses)}
        bg={colors.orangeTint}
        fg={colors.orangeDeep}
      />
      <StatRow
        label="Profit"
        sub="Income minus material & other costs"
        value={money(profit)}
        bg="#F1F0ED"
        fg={colors.charcoal}
      />
    </View>
  );
}
