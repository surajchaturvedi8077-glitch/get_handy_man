/**
 * EnquiryActions.js
 * ------------------------------------------------------------------
 * A generic Reject / Accept button pair. Used on a "quoted" enquiry
 * (reject vs. accept-and-create-job). Deliberately dumb — no status
 * branching here, the caller decides when to render it.
 * ------------------------------------------------------------------
 */
import { View, StyleSheet } from 'react-native';
import Button from '../ui/Button';

export default function EnquiryActions({ onReject, onAccept, acceptLabel = 'Accept' }) {
  return (
    <View style={styles.row}>
      <Button variant="outline" onPress={onReject} style={styles.flex}>
        Reject
      </Button>
      <Button variant="green" onPress={onAccept} style={styles.flex}>
        {acceptLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
});
