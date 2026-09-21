import { View } from 'react-native';
import IncomeSection from './IncomeSection';
import ExpensesSection from './ExpensesSection';

export default function ReportScreen({ report }) {
  return (
    <View style={{ paddingBottom: 40 }}>
      <IncomeSection income={report.income} />
      <ExpensesSection expenses={report.expenses} profit={report.profit} />
    </View>
  );
}