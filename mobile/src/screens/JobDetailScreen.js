import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ScreenHeader from '../components/layout/ScreenHeader';
import Button from '../components/ui/Button';
import LoadingState from '../components/ui/LoadingState';
import useJob from '../hooks/useJob';
import useToast from '../hooks/useToast';
import { money } from '../utils/money';
import { colors } from '../theme/colors';

export default function JobDetailScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { job, loading, saveDetails, complete } = useJob(params.id);
  
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState('0');

  if (loading || !job) return <View style={styles.screen}><LoadingState /></View>;

  const handleSavePrice = async () => {
    const newPrice = Number(priceInput);
    if (!isNaN(newPrice) && newPrice >= 0) {
      await saveDetails({ labour: newPrice });
      showToast('Price updated');
    }
    setEditingPrice(false);
  };

  const handleComplete = async () => {
    const { invoice } = await complete();
    showToast('Job marked complete');
    // For prototype flow, we go back to dashboard
    navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader 
        title="JOB DETAILS" 
        rightAction={<Text style={{ color: '#fff', fontSize: 18 }}>⋮</Text>} 
      />
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Customer Header Strip */}
        <View style={styles.customerStrip}>
          <View style={styles.avatar}><Text style={{ color: '#fff', fontSize: 18 }}>👤</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.customerName}>{job.name}</Text>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{job.status}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.actionIcon} onPress={() => showToast('Calling customer...')}><Text>📞</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon} onPress={() => showToast('Emailing customer...')}><Text>✉️</Text></TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.fieldRow}>
          <Text style={styles.icon}>📅</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Date & time</Text>
            <Text style={styles.value}>{job.when}</Text>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.icon}>📍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{job.address}</Text>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.icon}>📝</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.value}>{job.notes || 'No notes provided.'}</Text>
          </View>
        </View>

        {/* Editable Price Widget */}
        <View style={styles.priceCard}>
          {editingPrice ? (
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <TextInput
                style={styles.priceInput}
                value={priceInput}
                onChangeText={setPriceInput}
                keyboardType="numeric"
                autoFocus
              />
              <Button variant="primary" style={{ paddingVertical: 8, paddingHorizontal: 16 }} onPress={handleSavePrice}>Save</Button>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={styles.labelOrange}>Price</Text>
                <Text style={styles.priceText}>{money(job.labour)}</Text>
              </View>
              <TouchableOpacity style={styles.editBtn} onPress={() => { setPriceInput(String(job.labour)); setEditingPrice(true); }}>
                <Text style={{ fontSize: 14 }}>✏️</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.buttonRow}>
          <Button variant="outline" style={{ flex: 1 }} onPress={() => showToast('Calling customer...')}>Call</Button>
          <Button variant="green" style={{ flex: 1 }} onPress={handleComplete}>Mark complete</Button>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  customerStrip: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.charcoal, alignItems: 'center', justifyContent: 'center' },
  customerName: { fontWeight: '800', fontSize: 14, marginBottom: 4 },
  chip: { backgroundColor: colors.greenTint, paddingVertical: 3, paddingHorizontal: 9, borderRadius: 12, alignSelf: 'flex-start' },
  chipText: { color: colors.green, fontSize: 9.5, fontWeight: '700', textTransform: 'lowercase' },
  actionIcon: { width: 34, height: 34, borderRadius: 8, backgroundColor: colors.orangeTint, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: colors.grayLight, marginVertical: 14 },
  fieldRow: { flexDirection: 'row', gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.grayLight, alignItems: 'flex-start' },
  icon: { width: 34, textAlign: 'center', fontSize: 17, marginTop: 2 },
  label: { fontSize: 10, fontWeight: '700', color: colors.gray, textTransform: 'uppercase', marginBottom: 2 },
  labelOrange: { fontSize: 10, fontWeight: '700', color: colors.orangeDeep, textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: 13, color: colors.charcoal },
  priceCard: { backgroundColor: colors.orangeTint, borderRadius: 10, padding: 12, marginTop: 12 },
  priceText: { fontSize: 18, fontWeight: '800', color: colors.charcoal },
  editBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  priceInput: { flex: 1, borderWidth: 1.5, borderColor: colors.orange, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#fff', fontSize: 14, fontWeight: '700' },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 18 }
});