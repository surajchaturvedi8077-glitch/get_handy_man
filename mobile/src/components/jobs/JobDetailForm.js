import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FieldLabel from '../ui/FieldLabel';
import Button from '../ui/Button';
import MaterialsEditor from './MaterialsEditor';
import { colors } from '../../theme/colors';

export default function JobDetailForm({ job, onSave }) {
  const initialServices = job.services && job.services.length > 0 ? job.services : (job.service ? [job.service] : ['']);

  const [services, setServices] = useState(initialServices);
  const [when, setWhen] = useState(job.when || '');
  const [exactTime, setExactTime] = useState(job.exactTime || '');
  const [scheduledDate, setScheduledDate] = useState(job.scheduledDate || null);
  const [address, setAddress] = useState(job.address || '');
  const [labour, setLabour] = useState(String(job.labour || 0));
  const [notes, setNotes] = useState(job.notes || '');
  const [materials, setMaterials] = useState(job.materials || []);
  const [saving, setSaving] = useState(false);

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [tempDate, setTempDate] = useState(new Date());
  const [dateObj, setDateObj] = useState(job.scheduledDate ? new Date(job.scheduledDate) : new Date());

  const formatSafeDate = (d) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
  };

  const openPicker = () => {
    setPickerMode(Platform.OS === 'ios' ? 'datetime' : 'date');
    setShowPicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowPicker(false);

    if (event.type === 'set' && selectedDate) {
      if (Platform.OS === 'android' && pickerMode === 'date') {
        setTempDate(selectedDate);
        setPickerMode('time');
        setTimeout(() => setShowPicker(true), 50); 
      } else {
        let finalDate = selectedDate;
        if (Platform.OS === 'android' && pickerMode === 'time') {
          finalDate = new Date(tempDate);
          finalDate.setHours(selectedDate.getHours());
          finalDate.setMinutes(selectedDate.getMinutes());
        }
        setDateObj(finalDate);
        setWhen(formatSafeDate(finalDate));
        
        let hrs = finalDate.getHours();
        const mins = finalDate.getMinutes().toString().padStart(2, '0');
        const ampm = hrs >= 12 ? 'PM' : 'AM';
        hrs = hrs % 12 || 12;
        setExactTime(`${hrs}:${mins} ${ampm}`);

        setScheduledDate(finalDate.toISOString());
      }
    }
  };

  async function handleSave() {
    setSaving(true);
    try {
      const validServices = services.filter(Boolean);
      await onSave({ 
        services: validServices, 
        service: validServices.length > 0 ? validServices[0] : 'General Handyman', // FIXED: Prevents missing field DB error
        when, 
        exactTime,
        scheduledDate,
        address, 
        labour: Number(labour) || 0, 
        notes, 
        materials 
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <View>
      <FieldLabel>Services</FieldLabel>
      {services.map((srv, idx) => (
        <View key={idx} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          <TextInput style={[styles.input, { flex: 1, marginTop: 0 }]} value={srv} onChangeText={v => { const s = [...services]; s[idx] = v; setServices(s); }} placeholder="e.g. Plumbing Repair" />
          <TouchableOpacity onPress={() => setServices(services.filter((_, i) => i !== idx))}><Text style={{ fontSize: 20, color: colors.red, padding: 8 }}>×</Text></TouchableOpacity>
        </View>
      ))}
      <Button variant="outline" style={{ paddingVertical: 8, marginBottom: 14 }} onPress={() => setServices([...services, ''])}>+ Add another service</Button>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <FieldLabel>Schedule (Date)</FieldLabel>
          <TouchableOpacity onPress={openPicker} activeOpacity={0.7}>
            <View style={[styles.input, { justifyContent: 'center', height: 42 }]}>
              <Text style={{ color: when ? colors.charcoal : colors.gray, fontSize: 13 }}>{when || "Tap to select date"}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          <FieldLabel>Exact Time</FieldLabel>
          <TextInput value={exactTime} onChangeText={setExactTime} placeholder="e.g. 10:30 AM" style={styles.input} />
        </View>
      </View>

      <FieldLabel>Address</FieldLabel>
      <TextInput value={address} onChangeText={setAddress} style={styles.input} />

      <FieldLabel>Labour Cost (A$)</FieldLabel>
      <TextInput value={labour} onChangeText={setLabour} keyboardType="numeric" style={styles.input} />

      <FieldLabel>Notes</FieldLabel>
      <TextInput value={notes} onChangeText={setNotes} multiline style={[styles.input, styles.notesInput]} />

      <FieldLabel style={{ marginTop: 4 }}>Materials</FieldLabel>
      <MaterialsEditor materials={materials} onChange={setMaterials} />

      <Button variant="primary" onPress={handleSave} disabled={saving} style={{ marginTop: 16 }}>
        {saving ? 'Saving…' : 'Save job details'}
      </Button>

      {showPicker && (
        <DateTimePicker 
          value={pickerMode === 'time' ? tempDate : dateObj} 
          mode={pickerMode} 
          display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
          onChange={onDateChange} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, fontSize: 13, marginBottom: 14, color: colors.charcoal },
  notesInput: { minHeight: 70, textAlignVertical: 'top' },
});