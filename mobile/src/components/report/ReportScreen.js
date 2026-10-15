import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import IncomeSection from './IncomeSection';
import ExpensesSection from './ExpensesSection';
import { listAllExpenses } from '../../services/expenseService';
import { colors } from '../../theme/colors';

export default function ReportScreen({ report }) {
  const navigation = useNavigation();
  const [extraExpenses, setExtraExpenses] = useState({ materials: 0, other: 0, gstPaid: 0 });

  useEffect(() => {
    listAllExpenses().then((all) => {
      const standalone = all.filter((e) => !e.fromInvoice);
      const materials = standalone
        .filter((e) => e.category === 'Materials')
        .reduce((s, e) => s + (Number(e.amount) || 0), 0);
      const other = standalone
        .filter((e) => e.category !== 'Materials')
        .reduce((s, e) => s + (Number(e.amount) || 0), 0);
      const gstPaid = standalone.reduce((s, e) => s + (Number(e.gstAmount) || 0), 0);
      setExtraExpenses({ materials, other, gstPaid });
    });
  }, [report]);

  if (!report || !report.income || !report.expenses) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <Text style={{ color: colors.gray, fontSize: 13, fontWeight: 'bold' }}>
          Gathering report data...
        </Text>
      </View>
    );
  }

  const combinedExpenses = {
    materialExpenses: (report.expenses.materialExpenses || 0) + extraExpenses.materials,
    otherExpenses: (report.expenses.otherExpenses || 0) + extraExpenses.other,
  };

  const combinedIncome = {
    ...report.income,
    gstOnMaterial: (report.income.gstOnMaterial || 0) + extraExpenses.gstPaid,
    reportableGst: (report.income.reportableGst || 0) - extraExpenses.gstPaid,
  };

  const combinedProfit =
    (report.profit || 0) - extraExpenses.materials - extraExpenses.other;

  return (
    <View style={{ paddingBottom: 40 }}>
      <IncomeSection income={combinedIncome} />
      <ExpensesSection expenses={combinedExpenses} profit={combinedProfit} />

      <TouchableOpacity
        style={{
          backgroundColor: '#1565D8',
          borderRadius: 10,
          paddingVertical: 14,
          alignItems: 'center',
          marginTop: 14,
        }}
        onPress={() => navigation.getParent()?.navigate('Expenses')}
      >
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>
          📄 Open Expenses & Export PDF Report
        </Text>
      </TouchableOpacity>
    </View>
  );
}