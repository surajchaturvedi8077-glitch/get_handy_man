/**
 * InvoiceListItem.js
 * ------------------------------------------------------------------
 * One row in the invoices list: number, paid/unpaid chip, customer,
 * date, and total due (from the API's computed `totals`).
 * ------------------------------------------------------------------
 */
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Card from '../ui/Card';
import Chip from '../ui/Chip';
import { money } from '../../utils/money';
import { colors } from '../../theme/colors';

export default function InvoiceListItem({ invoice }) {
  const navigation = useNavigation();
  const paid = invoice.status === 'paid';
  return (
    <Card onPress={() => navigation.navigate('InvoiceDetail', { id: invoice._id })}>
      <View style={styles.top}>
        <Text style={styles.number}>#{invoice.number}</Text>
        <Chip tone={paid ? 'green' : 'red'}>{paid ? 'Paid' : 'Unpaid'}</Chip>
      </View>
      <Text style={styles.customer}>{invoice.customer}</Text>
      <View style={styles.bottom}>
        <Text style={styles.date}>{new Date(invoice.date).toLocaleDateString()}</Text>
        <Text style={styles.total}>{money(invoice.totals?.total)}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  number: { fontWeight: '800', fontSize: 13.5 },
  customer: { fontSize: 12, color: colors.charcoal2, marginTop: 4 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  date: { fontSize: 10.5, color: colors.gray },
  total: { fontWeight: '800', fontSize: 13 },
});
