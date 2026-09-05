/**
 * ReportScreen.jsx
 * ------------------------------------------------------------------
 * Composes IncomeSection + ExpensesSection into the full Report tab.
 * Purely presentational — ReportPage owns the useReport() data hook.
 * ------------------------------------------------------------------
 */
import IncomeSection from './IncomeSection.jsx';
import ExpensesSection from './ExpensesSection.jsx';

export default function ReportScreen({ report }) {
  return (
    <div>
      <IncomeSection income={report.income} />
      <ExpensesSection expenses={report.expenses} profit={report.profit} />
      <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 8, fontStyle: 'italic', lineHeight: 1.5 }}>
        Based on all invoices raised to date.
      </div>
    </div>
  );
}
