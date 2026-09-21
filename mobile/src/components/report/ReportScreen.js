import { View, Text, StyleSheet } from 'react-native';
import IncomeSection from './IncomeSection';
import ExpensesSection from './ExpensesSection';
import FieldLabel from '../ui/FieldLabel';
import { money } from '../../utils/money';
import { colors } from '../../theme/colors';

export default function ReportScreen({ report }) {
  return (
    <View>
      <IncomeSection income={report.income} />
      <ExpensesSection expenses={report.expenses} profit={report.profit} />
      
      {/* NEW EARNINGS SECTION */}
      <FieldLabel style={{ marginTop: 24, marginBottom: 8 }}>Earnings Timeline (Paid Invoices) 📊</FieldLabel>
      <View style={styles.earningsGrid}>
        <View style={styles.earningCard}>
          <Text style={styles.earningLabel}>TODAY</Text>
          <Text style={styles.earningValue}>{money(report.earnings?.today || 0)}</Text>
        </View>
        <View style={styles.earningCard}>
          <Text style={styles.earningLabel}>THIS WEEK</Text>
          <Text style={styles.earningValue}>{money(report.earnings?.week || 0)}</Text>
        </View>
        <View style={styles.earningCard}>
          <Text style={styles.earningLabel}>THIS MONTH</Text>
          <Text style={styles.earningValue}>{money(report.earnings?.month || 0)}</Text>
        </View>
        <View style={styles.earningCard}>
          <Text style={styles.earningLabel}>THIS YEAR</Text>
          <Text style={styles.earningValue}>{money(report.earnings?.year || 0)}</Text>
        </View>
      </View>

      <Text style={styles.footnote}>Based on all invoices raised to date.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  earningsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  earningCard: { flex: 1, minWidth: '45%', backgroundColor: colors.charcoal, borderRadius: 10, padding: 14 },
  earningLabel: { fontSize: 10, fontWeight: '700', color: colors.grayLight, letterSpacing: 0.5, marginBottom: 4 },
  earningValue: { fontSize: 18, fontWeight: '800', color: '#fff' },
  footnote: { fontSize: 10, color: '#9CA3AF', marginTop: 14, fontStyle: 'italic', lineHeight: 15, paddingBottom: 40 },
});