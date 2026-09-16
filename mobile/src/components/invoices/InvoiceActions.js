/**
 * InvoiceActions.js
 * ------------------------------------------------------------------
 * The three primary buttons on an invoice: toggle paid/unpaid, and
 * placeholders for PDF preview / share (wire these to your PDF/share
 * integration of choice — kept as callbacks so this component stays
 * decoupled from that implementation, e.g. expo-print + expo-sharing).
 * ------------------------------------------------------------------
 */
import { View, StyleSheet } from 'react-native';
import Button from '../ui/Button';

export default function InvoiceActions({ isPaid, onTogglePaid, onPreviewPdf, onShare }) {
  return (
    <View style={styles.row}>
      <Button variant={isPaid ? 'outline' : 'green'} onPress={onTogglePaid} style={styles.flex}>
        {isPaid ? 'Mark unpaid' : 'Mark as paid'}
      </Button>
      <Button variant="dark" onPress={onPreviewPdf} style={styles.flex}>
        Preview PDF
      </Button>
      <Button variant="primary" onPress={onShare} style={styles.flex}>
        Share
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginTop: 16 },
  flex: { flex: 1 },
});
