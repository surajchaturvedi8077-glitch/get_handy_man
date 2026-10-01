import React from 'react';
import { View, Text } from 'react-native';
import IncomeSection from './IncomeSection';
import ExpensesSection from './ExpensesSection';
import { colors } from '../../theme/colors';

export default function ReportScreen({ report }) {
  // FIXED: Prevents "undefined" crash while calculating
  if (!report || !report.income || !report.expenses) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <Text style={{ color: colors.gray, fontSize: 13, fontWeight: 'bold' }}>Gathering report data...</Text>
      </View>
    );
  }

  return (
    <View style={{ paddingBottom: 40 }}>
      <IncomeSection income={report.income} />
      <ExpensesSection expenses={report.expenses} profit={report.profit} />
    </View>
  );
}