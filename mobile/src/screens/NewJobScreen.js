import React, { useState, useRef } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import ScreenHeader from '../components/layout/ScreenHeader';
import Button from '../components/ui/Button';
import FieldLabel from '../components/ui/FieldLabel';
import useToast from '../hooks/useToast';
import * as jobService from '../services/jobService';
import { colors } from '../theme/colors';

export default function NewJobScreen() {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const debounceTimer = useRef(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const [suggestions, setSuggestions] = useState([]);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', when: '', address: '', suburb: '', postcode: '',
    labour: '180', notes: ''
  });
  
  // Arrays for dynamic fields
  const [services, setServices] = useState(['General Handyman']);
  const [materials, setMaterials] = useState([]);
  const [extraFields, setExtraFields] = useState([]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleCreateJob = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        name: form.name || 'New Customer',
        when: form.when || 'Not scheduled yet',
        address: [form.address, form.suburb, form.postcode].filter(Boolean).join(', '),
        labour: Number(form.labour) || 0,
        services: services.filter(Boolean),
        extraFields: extraFields.filter(f => f.label && f.value),
        materials,
        status: 'confirmed',
        needsDetails: false
      };
      await jobService.createJob(payload);
      showToast('Job created successfully');
      navigation.navigate('Dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create job');
    } finally {
      setSaving(false);
    }
  };

const onDateChange = (event, selectedDate) => {
  try {
    console.log("Event type:", event.type);
    console.log("Selected Date object:", selectedDate);
    
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      updateForm('when', selectedDate.toString());
    }
  } catch (err) {
    console.log("CRASH CAUGHT IN DATE PICKER:", err.message);
  }
};
  const searchPlaces = (text) => {
    updateForm('address', text);
    if (text.length < 4) { setSuggestions([]); return; }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&countrycodes=au&format=json&limit=4`, { headers: { 'User-Agent': 'GetHandymanApp/1.0' } });
        setSuggestions(await response.json());
      } catch (e) { }
    }, 800);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="NEW JOB" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        <View style={styles.customerStrip}>
          <View style={styles.avatar}><Text style={{ color: '#fff', fontSize: 18 }}>👤</Text></View>
          <View style={{ flex: 1 }}>
            <TextInput style={styles.nameInput} placeholder="Customer name" placeholderTextColor={colors.gray} value={form.name} onChangeText={(val) => updateForm('name', val)} />
          </View>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.icon}>📞</Text>
          <View style={{ flex: 1 }}><FieldLabel>Phone</FieldLabel><TextInput style={styles.input} value={form.phone} onChangeText={v => updateForm('phone', v)} keyboardType="phone-pad" /></View>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.icon}>📅</Text>
          <View style={{ flex: 1 }}><FieldLabel>Date & Time</FieldLabel>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
              <View style={[styles.input, { justifyContent: 'center', height: 42 }]}><Text style={{ color: form.when ? colors.charcoal : colors.gray, fontSize: 13 }}>{form.when || "Tap to select date"}</Text></View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.icon}>📍</Text>
          <View style={{ flex: 1, zIndex: 10 }}>
            <FieldLabel>Street Address</FieldLabel>
            <TextInput style={styles.input} value={form.address} onChangeText={searchPlaces} placeholder="Search Australian address..." />
            {suggestions.length > 0 && (
              <View style={styles.dropdown}>
                {suggestions.map((item, index) => (
                  <TouchableOpacity key={index} style={styles.dropdownItem} onPress={() => { updateForm('address', item.display_name); setSuggestions([]); }}>
                    <Text style={styles.dropdownText} numberOfLines={2}>{item.display_name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={[styles.detailsCard, { zIndex: -1 }]}>
          <Text style={styles.cardTitle}>ADD JOB DETAILS</Text>
          
          <FieldLabel>Services</FieldLabel>
          {services.map((srv, idx) => (
            <View key={idx} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <TextInput style={[styles.input, { flex: 1, marginTop: 0 }]} value={srv} onChangeText={v => { const s = [...services]; s[idx] = v; setServices(s); }} placeholder="e.g. Plumbing Repair" />
              <TouchableOpacity onPress={() => setServices(services.filter((_, i) => i !== idx))}><Text style={{ fontSize: 20, color: colors.red, padding: 8 }}>×</Text></TouchableOpacity>
            </View>
          ))}
          <Button variant="outline" style={{ paddingVertical: 8, marginBottom: 14 }} onPress={() => setServices([...services, ''])}>+ Add another service</Button>

          <FieldLabel>Labour Cost (A$)</FieldLabel>
          <TextInput style={[styles.input, { marginBottom: 14 }]} value={form.labour} onChangeText={v => updateForm('labour', v)} keyboardType="numeric" />
          
          <FieldLabel>Other Details / Fields</FieldLabel>
          {extraFields.map((f, idx) => (
            <View key={idx} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <TextInput style={[styles.input, { flex: 1, marginTop: 0 }]} value={f.label} onChangeText={v => { const e = [...extraFields]; e[idx].label = v; setExtraFields(e); }} placeholder="Label" />
              <TextInput style={[styles.input, { flex: 1, marginTop: 0 }]} value={f.value} onChangeText={v => { const e = [...extraFields]; e[idx].value = v; setExtraFields(e); }} placeholder="Value" />
              <TouchableOpacity onPress={() => setExtraFields(extraFields.filter((_, i) => i !== idx))}><Text style={{ fontSize: 20, color: colors.red, padding: 8 }}>×</Text></TouchableOpacity>
            </View>
          ))}
          <Button variant="outline" style={{ paddingVertical: 8, marginBottom: 14 }} onPress={() => setExtraFields([...extraFields, {label: '', value: ''}])}>+ Add other field</Button>

          <Button variant="primary" style={{ marginTop: 12 }} onPress={handleCreateJob} disabled={saving}>{saving ? 'Saving...' : 'Create job'}</Button>
        </View>
      </ScrollView>

      {/* SAFELY rendered date picker */}
      {showDatePicker && (
        <DateTimePicker value={date || new Date()} mode="datetime" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onDateChange} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  customerStrip: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.charcoal, alignItems: 'center', justifyContent: 'center' },
  nameInput: { fontWeight: '800', fontSize: 16, color: colors.charcoal, padding: 0 },
  fieldRow: { flexDirection: 'row', gap: 12, paddingVertical: 6, alignItems: 'flex-start', zIndex: 10 },
  icon: { width: 34, textAlign: 'center', fontSize: 17, marginTop: 18 },
  input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, backgroundColor: '#fff', marginTop: 4 },
  dropdown: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, marginTop: 4, maxHeight: 150 },
  dropdownItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: colors.grayLight },
  dropdownText: { fontSize: 12, color: colors.charcoal },
  detailsCard: { backgroundColor: colors.orangeTint, borderRadius: 10, padding: 14, marginTop: 20 },
  cardTitle: { fontWeight: '800', fontSize: 12.5, color: colors.orangeDeep, marginBottom: 10 },
});