/**
 * JobDetailForm.js
 * ------------------------------------------------------------------
 * Shown while a job "needs details": service, schedule, address,
 * labour, notes, and the materials list, all saved together in one
 * "Save job details" submit (see useJob().saveDetails ->
 * services/jobService.js).
 * ------------------------------------------------------------------
 */
import { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import FieldLabel from '../ui/FieldLabel';
import Button from '../ui/Button';
import MaterialsEditor from './MaterialsEditor';
import { colors } from '../../theme/colors';

export default function JobDetailForm({ job, onSave }) {
  const [service, setService] = useState(job.service || '');
  const [when, setWhen] = useState(job.when || '');
  const [address, setAddress] = useState(job.address || '');
  const [labour, setLabour] = useState(String(job.labour || 0));
  const [notes, setNotes] = useState(job.notes || '');
  const [materials, setMaterials] = useState(job.materials || []);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ service, when, address, labour: Number(labour) || 0, notes, materials });
    } finally {
      setSaving(false);
    }
  }

  return (
    <View>
      <FieldLabel>Service</FieldLabel>
      <TextInput value={service} onChangeText={setService} style={styles.input} />

      <FieldLabel>Schedule</FieldLabel>
      <TextInput value={when} onChangeText={setWhen} placeholder="e.g. Fri 4 Sep · 9:00 AM" style={styles.input} />

      <FieldLabel>Address</FieldLabel>
      <TextInput value={address} onChangeText={setAddress} style={styles.input} />

      <FieldLabel>Labour</FieldLabel>
      <TextInput value={labour} onChangeText={setLabour} keyboardType="numeric" style={styles.input} />

      <FieldLabel>Notes</FieldLabel>
      <TextInput value={notes} onChangeText={setNotes} multiline style={[styles.input, styles.notesInput]} />

      <FieldLabel style={{ marginTop: 4 }}>Materials</FieldLabel>
      <MaterialsEditor materials={materials} onChange={setMaterials} />

      <Button variant="primary" onPress={handleSave} disabled={saving} style={{ marginTop: 16 }}>
        {saving ? 'Saving…' : 'Save job details'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.grayLight,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 14,
  },
  notesInput: { minHeight: 70, textAlignVertical: 'top' },
});
