import React, { useState } from 'react';
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

  // Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  // Location Search State
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', email: '', when: '', address: '', 
    service: 'General Handyman', labour: '180', notes: ''
  });

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  // --- 1. Fix Database Error ---
  const handleCreateJob = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name || 'New Customer',
        phone: form.phone,
        email: form.email,
        when: form.when || 'Not scheduled yet',
        address: form.address || 'Address not set',
        service: form.service,
        labour: Number(form.labour) || 0,
        notes: form.notes,
        status: 'confirmed', // FIXED: Schema only allows 'accepted', 'confirmed', or 'complete'
        needsDetails: false, 
        materials: [] 
      };
      
      await jobService.createJob(payload);
      showToast('Job created manually');
      navigation.navigate('Dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create job');
    } finally {
      setSaving(false);
    }
  };

  // --- 2. Calendar Logic ---
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      // Format like prototype: "Fri, 4 Sep 10:30 AM"
      const formatted = selectedDate.toLocaleString('en-US', {
        weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'
      });
      updateForm('when', formatted);
    }
  };

  // --- 3. Location Search API Logic (Australia Only) ---
  const searchPlaces = async (text) => {
    updateForm('address', text);
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    try {
      // Free OpenStreetMap API restricted to Australia
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&countrycodes=au&format=json&limit=4`);
      const data = await response.json();
      setSuggestions(data);
    } catch (e) {
      console.error('Location search failed', e);
    } finally {
      setSearching(false);
    }
  };

  const selectLocation = (item) => {
    updateForm('address', item.display_name);
    setSuggestions([]); // Close dropdown
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="NEW JOB" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        {/* Customer Strip */}
        <View style={styles.customerStrip}>
          <View style={styles.avatar}><Text style={{ color: '#fff', fontSize: 18 }}>👤</Text></View>
          <View style={{ flex: 1 }}>
            <TextInput 
              style={styles.nameInput} 
              placeholder="Customer name" 
              placeholderTextColor={colors.gray}
              value={form.name} 
              onChangeText={(val) => updateForm('name', val)} 
            />
            <View style={styles.chip}><Text style={styles.chipText}>New</Text></View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.fieldRow}>
          <Text style={styles.icon}>📞</Text>
          <View style={{ flex: 1 }}>
            <FieldLabel>Phone number</FieldLabel>
            <TextInput style={styles.input} value={form.phone} onChangeText={v => updateForm('phone', v)} keyboardType="phone-pad" />
          </View>
        </View>

        {/* Calendar Field */}
        <View style={styles.fieldRow}>
          <Text style={styles.icon}>📅</Text>
          <View style={{ flex: 1 }}>
            <FieldLabel>Date & Time</FieldLabel>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
              <View style={[styles.input, { justifyContent: 'center', height: 42 }]}>
                <Text style={{ color: form.when ? colors.charcoal : colors.gray, fontSize: 13 }}>
                  {form.when || "Tap to select date"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Location Search Field */}
        <View style={styles.fieldRow}>
          <Text style={styles.icon}>📍</Text>
          <View style={{ flex: 1, zIndex: 10 }}>
            <FieldLabel>Location</FieldLabel>
            <TextInput 
              style={styles.input} 
              value={form.address} 
              onChangeText={searchPlaces} 
              placeholder="Search Australian address..." 
            />
            
            {/* Search Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <View style={styles.dropdown}>
                {suggestions.map((item, index) => (
                  <TouchableOpacity 
                    key={item.place_id || index} 
                    style={styles.dropdownItem} 
                    onPress={() => selectLocation(item)}
                  >
                    <Text style={styles.dropdownText} numberOfLines={2}>
                      {item.display_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Details Card */}
        <View style={[styles.detailsCard, { zIndex: -1 }]}>
          <Text style={styles.cardTitle}>ADD JOB DETAILS</Text>
          
          <FieldLabel>Service Type</FieldLabel>
          <TextInput style={[styles.input, styles.cardInput]} value={form.service} onChangeText={v => updateForm('service', v)} />

          <FieldLabel>Labour Cost (A$)</FieldLabel>
          <TextInput style={[styles.input, styles.cardInput]} value={form.labour} onChangeText={v => updateForm('labour', v)} keyboardType="numeric" />

          <FieldLabel>Other Details / Notes</FieldLabel>
          <TextInput style={[styles.input, styles.cardInput, { minHeight: 60, textAlignVertical: 'top' }]} value={form.notes} onChangeText={v => updateForm('notes', v)} multiline />

          <Button variant="primary" style={{ marginTop: 12 }} onPress={handleCreateJob} disabled={saving}>
            {saving ? 'Saving...' : 'Create job'}
          </Button>
        </View>

      </ScrollView>

      {/* Native OS Date Picker popup */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  customerStrip: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.charcoal, alignItems: 'center', justifyContent: 'center' },
  nameInput: { fontWeight: '800', fontSize: 16, color: colors.charcoal, padding: 0, marginBottom: 4 },
  chip: { backgroundColor: colors.orangeTint, paddingVertical: 3, paddingHorizontal: 9, borderRadius: 12, alignSelf: 'flex-start' },
  chipText: { color: colors.orangeDeep, fontSize: 9.5, fontWeight: '700', textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: colors.grayLight, marginVertical: 14 },
  fieldRow: { flexDirection: 'row', gap: 12, paddingVertical: 6, alignItems: 'flex-start', zIndex: 10 },
  icon: { width: 34, textAlign: 'center', fontSize: 17, marginTop: 18 },
  input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, backgroundColor: '#fff', marginTop: 4 },
  dropdown: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, marginTop: 4, maxHeight: 150 },
  dropdownItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: colors.grayLight },
  dropdownText: { fontSize: 12, color: colors.charcoal },
  detailsCard: { backgroundColor: colors.orangeTint, borderRadius: 10, padding: 14, marginTop: 20 },
  cardTitle: { fontWeight: '800', fontSize: 12.5, color: colors.orangeDeep, marginBottom: 10 },
  cardInput: { borderColor: colors.grayLight, marginBottom: 12 }
});