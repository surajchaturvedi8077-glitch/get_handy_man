/**
 * EmptyState.js
 * ------------------------------------------------------------------
 * Small centered message shown when a list has no items, e.g.
 * "No jobs here." Used by EnquiryList, JobList, InvoiceList.
 * ------------------------------------------------------------------
 */
import { Text, StyleSheet } from 'react-native';

export default function EmptyState({ children }) {
  return <Text style={styles.text}>{children}</Text>;
}

const styles = StyleSheet.create({
  text: { textAlign: 'center', color: '#9CA3AF', fontSize: 12.5, paddingVertical: 30 },
});
