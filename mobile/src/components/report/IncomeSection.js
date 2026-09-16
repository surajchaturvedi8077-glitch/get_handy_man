/**
 * IncomeSection.js
 * ------------------------------------------------------------------
 * The Income block of the business Report: Reported income, Cash
 * Bonus (was "NRI"), GST on material (10% of total material cost),
 * and Reportable GST (GST collected minus GST on material). Values
 * come straight from services/reportService.getBusinessReport().
 * ------------------------------------------------------------------
 */
import { View } from 'react-native';
import FieldLabel from '../ui/FieldLabel';
import StatRow from '../ui/StatRow';
import { money } from '../../utils/money';
import { colors } from '../../theme/colors';

export default function IncomeSection({ income }) {
  return (
    <View>
      <FieldLabel style={{ marginBottom: 8 }}>Income</FieldLabel>
      <StatRow
        label="Reported income"
        sub="GST included on these invoices"
        value={money(income.reportedIncome)}
        bg={colors.greenTint}
        fg={colors.green}
      />
      <StatRow
        label="Cash Bonus"
        sub="GST not included on these invoices"
        value={money(income.cashBonus)}
        bg={colors.redTint}
        fg={colors.red}
      />
      <StatRow
        label="GST on material"
        sub="10% of total material cost"
        value={money(income.gstOnMaterial)}
        bg={colors.blueTint}
        fg={colors.blue}
      />
      <StatRow
        label="Reportable GST"
        sub="GST collected minus GST on material"
        value={money(income.reportableGst)}
        bg={colors.blueTint}
        fg={colors.blue}
      />
    </View>
  );
}
