/**
 * ReportScreen.js
 * ------------------------------------------------------------------
 * Composes IncomeSection + ExpensesSection into the full Report tab.
 * Purely presentational — InvoicesScreen owns the useReport() hook.
 * Named "ReportScreen" (matching the web app's component) even
 * though it's rendered inline inside InvoicesScreen, not as its own
 * navigator screen.
 * ------------------------------------------------------------------
 */
import { View, Text, StyleSheet } from 'react-native';
import IncomeSection from './IncomeSection';
import ExpensesSection from './ExpensesSection';

export default function ReportScreen({ report }) {
  return (
    <View>
      <IncomeSection income={report.income} />
      <ExpensesSection expenses={report.expenses} profit={report.profit} />
      <Text style={styles.footnote}>Based on all invoices raised to date.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footnote: { fontSize: 10, color: '#9CA3AF', marginTop: 8, fontStyle: 'italic', lineHeight: 15 },
});
