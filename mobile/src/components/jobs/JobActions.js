/**
 * JobActions.js
 * ------------------------------------------------------------------
 * Bottom actions on a confirmed/complete job: "Mark complete"
 * (generates the invoice) and a "Delete job" flow gated behind a
 * confirmation step so a stray tap can't remove a job.
 * ------------------------------------------------------------------
 */
import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../ui/Button';
import { colors } from '../../theme/colors';

export default function JobActions({ job, onComplete, onDelete }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (confirmingDelete) {
    return (
      <View style={styles.confirmBox}>
        <Text style={styles.confirmText}>Delete this job? This can't be undone.</Text>
        <View style={styles.row}>
          <Button variant="outline" onPress={() => setConfirmingDelete(false)} style={styles.flex}>
            Cancel
          </Button>
          <Button variant="dark" onPress={onDelete} style={[styles.flex, { backgroundColor: colors.red }]}>
            Delete
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {job.status !== 'complete' && (
        <Button variant="green" onPress={onComplete} style={styles.flex}>
          Mark complete
        </Button>
      )}
      <Button variant="outline" onPress={() => setConfirmingDelete(true)} style={styles.flex}>
        Delete job
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  confirmBox: { backgroundColor: colors.redTint, borderRadius: 10, padding: 14, marginTop: 16 },
  confirmText: { fontSize: 12.5, color: colors.red, fontWeight: '700', marginBottom: 10 },
  row: { flexDirection: 'row', gap: 8, marginTop: 16 },
  flex: { flex: 1 },
});
