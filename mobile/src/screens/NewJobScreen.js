import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import ScreenHeader from '../components/layout/ScreenHeader';
import Button from '../components/ui/Button';
import FieldLabel from '../components/ui/FieldLabel';
import useToast from '../hooks/useToast';
import * as jobService from '../services/jobService';
import { colors } from '../theme/colors';

export default function NewJobScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const debounceTimer = useRef(null);

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [tempDate, setTempDate] = useState(new Date());
  const [dateObj, setDateObj] = useState(new Date());

  const [suggestions, setSuggestions] = useState([]);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', when: '', exactTime: '', scheduledDate: null, address: '', suburb: '', postcode: '', lat: null, lng: null,
    labour: '180', notes: ''
  });
  
  const [services, setServices] = useState(['General Handyman']);
  const [materials, setMaterials] = useState([]);
  const [extraFields, setExtraFields] = useState([]);

  // Prefill if navigating from customer screen
  useEffect(() => {
    if (params?.customer) {
      setForm(prev => ({
        ...prev,
        name: params.customer.name || '',
        phone: params.customer.phone || '',
        email: params.customer.email || '',
        address: params.customer.address || '',
        suburb: params.customer.suburb || '',
        postcode: params.customer.postcode || '',
      }));
    }
  }, [params?.customer]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleCreateJob = async () => {
    setSaving(true);
    try {
      const safeAddress = [form.address, form.suburb, form.postcode].filter(Boolean).join(', ') || 'Address not set';
      const validServices = services.filter(Boolean);
      
      const payload = {
        ...form,
        name: form.name || 'New Customer',
        when: form.when || 'Not scheduled yet',
        exactTime: form.exactTime,
        scheduledDate: form.scheduledDate || new Date().toISOString(),
        address: safeAddress,
        lat: form.lat,
        lng: form.lng,
        labour: Number(form.labour) || 0,
        services: validServices,
        service: validServices.length > 0 ? validServices[0] : 'General Handyman',
        extraFields: extraFields.filter(f => f.label && f.value),
        materials,
        status: 'confirmed',
        needsDetails: false
      };
      
      await jobService.createJob(payload);
      showToast('Job created successfully');
      navigation.navigate('Jobs', { screen: 'JobsList' }); 
    } catch (err) {
      const errMsg = err.response?.data?.errors ? err.response.data.errors.join('\n') : (err.response?.data?.message || 'Failed to create job');
      Alert.alert("Cannot Create Job", errMsg);
    } finally {
      setSaving(false);
    }
  };

  const openPicker = () => { setPickerMode(Platform.OS === 'ios' ? 'datetime' : 'date'); setShowPicker(true); };

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
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        updateForm('when', `${days[finalDate.getDay()]}, ${finalDate.getDate()} ${months[finalDate.getMonth()]}`);
        let hrs = finalDate.getHours();
        const mins = finalDate.getMinutes().toString().padStart(2, '0');
        updateForm('exactTime', `${hrs % 12 || 12}:${mins} ${hrs >= 12 ? 'PM' : 'AM'}`);
        updateForm('scheduledDate', finalDate.toISOString());
      }
    }
  };

  const searchPlaces = async (text) => {
    updateForm('address', text);
    if (text.length < 3) { setSuggestions([]); return; }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY;
        if (!key) return;
        const res = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&components=country:au&key=${key}`);
        const data = await res.json();
        setSuggestions(data.predictions || []);
      } catch (e) { }
    }, 500);
  };

  const handleSelectPlace = async (placeId, description) => {
    updateForm('address', description);
    setSuggestions([]);
    try {
      const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY;
      const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_components,geometry&key=${key}`);
      const data = await res.json();
      if (data.result) {
        updateForm('lat', data.result.geometry.location.lat);
        updateForm('lng', data.result.geometry.location.lng);
        const postcodeObj = data.result.address_components.find(c => c.types.includes('postal_code'));
        if (postcodeObj) updateForm('postcode', postcodeObj.long_name);
      }
    } catch (e) { }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="NEW JOB" onBack={() => navigation.navigate('Dashboard')} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        <View style={styles.customerStrip}>
          <View style={styles.avatar}><Text style={{ color: '#fff', fontSize: 18 }}>👤</Text></View>
          <View style={{ flex: 1 }}>
            <TextInput style={styles.nameInput} placeholder="Customer name" placeholderTextColor={colors.gray} value={form.name} onChangeText={(val) => updateForm('name', val)} />
          </View>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.icon}>📞</Text>
          <View style={{ flex: 1 }}>
            <FieldLabel>Phone & Email</FieldLabel>
            <TextInput style={styles.input} value={form.phone} onChangeText={v => updateForm('phone', v)} keyboardType="phone-pad" placeholder="Phone Number" />
            <TextInput style={[styles.input, { marginTop: 8 }]} value={form.email} onChangeText={v => updateForm('email', v)} keyboardType="email-address" autoCapitalize="none" placeholder="Email Address" />
          </View>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.icon}>📅</Text>
          <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <FieldLabel>Date</FieldLabel>
              <TouchableOpacity onPress={openPicker} activeOpacity={0.7}>
                <View style={[styles.input, { justifyContent: 'center', height: 42 }]}><Text style={{ color: form.when ? colors.charcoal : colors.gray, fontSize: 13 }}>{form.when || "Select"}</Text></View>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <FieldLabel>Exact Time</FieldLabel>
              <TextInput style={styles.input} value={form.exactTime} onChangeText={v => updateForm('exactTime', v)} placeholder="e.g. 10:30 AM" />
            </View>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.icon}>📍</Text>
          <View style={{ flex: 1, zIndex: 10 }}>
            <FieldLabel>Street Address</FieldLabel>
            <TextInput style={styles.input} value={form.address} onChangeText={searchPlaces} placeholder="Search Australian address..." />
            {suggestions.length > 0 && (
              <View style={styles.dropdown}>
                {suggestions.map((item) => (
                  <TouchableOpacity key={item.place_id} style={styles.dropdownItem} onPress={() => handleSelectPlace(item.place_id, item.description)}>
                    <Text style={styles.dropdownText} numberOfLines={2}>{item.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.rowSplit}>
          <View style={{ flex: 1, marginLeft: 46 }}>
            <FieldLabel>Suburb</FieldLabel>
            <TextInput style={styles.input} value={form.suburb} onChangeText={v => updateForm('suburb', v)} />
          </View>
          <View style={{ flex: 1 }}>
            <FieldLabel>Postcode</FieldLabel>
            <TextInput style={styles.input} value={form.postcode} onChangeText={v => updateForm('postcode', v)} keyboardType="numeric" />
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

      {showPicker && (
        <DateTimePicker value={pickerMode === 'time' ? tempDate : dateObj} mode={pickerMode} display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onDateChange} />
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
  rowSplit: { flexDirection: 'row', gap: 12, paddingVertical: 6 },
  icon: { width: 34, textAlign: 'center', fontSize: 17, marginTop: 18 },
  input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, backgroundColor: '#fff', marginTop: 4, color: colors.charcoal },
  dropdown: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, marginTop: 4, maxHeight: 150 },
  dropdownItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: colors.grayLight },
  dropdownText: { fontSize: 12, color: colors.charcoal },
  detailsCard: { backgroundColor: colors.orangeTint, borderRadius: 10, padding: 14, marginTop: 20 },
  cardTitle: { fontWeight: '800', fontSize: 12.5, color: colors.orangeDeep, marginBottom: 10 },
});