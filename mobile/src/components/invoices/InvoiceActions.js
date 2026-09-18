import { View, StyleSheet } from 'react-native';
import Button from '../ui/Button';
import { openEmail } from '../../utils/linking';

export default function InvoiceActions({ isPaid, customerEmail, onTogglePaid, onPreviewPdf, onShare }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Button variant={isPaid ? 'outline' : 'green'} onPress={onTogglePaid} style={styles.flex}>
          {isPaid ? 'Mark unpaid' : 'Mark as paid'}
        </Button>
        <Button variant="dark" onPress={onPreviewPdf} style={styles.flex}>
          Preview PDF
        </Button>
      </View>
      <View style={styles.row}>
        <Button variant="outline" onPress={() => openEmail(customerEmail)} style={styles.flex}>
          ✉️ Email Customer
        </Button>
        <Button variant="primary" onPress={onShare} style={styles.flex}>
          Share
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16, gap: 10 },
  row: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
});