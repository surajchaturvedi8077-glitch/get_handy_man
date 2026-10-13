import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../components/layout/ScreenHeader';
import Button from '../components/ui/Button';
import FieldLabel from '../components/ui/FieldLabel';
import Toggle from '../components/ui/Toggle';
import useSettings from '../hooks/useSettings';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { scheduleDailyMorningBriefing } from '../services/notificationService';
import { colors } from '../theme/colors';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { settings, update } = useSettings();
  const { logout } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    businessName: '', abn: '', bizPhone: '', bizEmail: '', website: '', paymentTerms: 'Due on receipt', 
    bankName: '', bsb: '', account: '', accountName: '', payId: '', quoteMessage: '',
    briefingEnabled: true, briefingTime: '07:30', gstRate: '10', gstEnabled: true
  });

  useEffect(() => {
    if (settings) {
      setForm(prev => ({
        ...prev, ...settings,
        gstRate: String(settings.gstRate || '10'),
        briefingTime: settings.briefingTime || '07:30',
        briefingEnabled: settings.briefingEnabled !== false
      }));
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      const payload = { ...form, gstRate: Number(form.gstRate) || 0 };
      await update(payload);
      
      // Update the Native OS Morning Alarm immediately
      await scheduleDailyMorningBriefing(form.briefingEnabled, form.briefingTime);
      
      showToast("Settings Saved!");
      navigation.goBack();
    } catch (error) {
      showToast("Error saving settings.");
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="SETTINGS" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BUSINESS DETAILS (For PDFs)</Text>
            <FieldLabel>Business Name</FieldLabel>
            <TextInput style={styles.input} value={form.businessName} onChangeText={v => setForm({...form, businessName: v})} />
            <FieldLabel>ABN</FieldLabel>
            <TextInput style={styles.input} value={form.abn} onChangeText={v => setForm({...form, abn: v})} />
            <FieldLabel>Contact Phone</FieldLabel>
            <TextInput style={styles.input} value={form.bizPhone} onChangeText={v => setForm({...form, bizPhone: v})} />
            <FieldLabel>Contact Email</FieldLabel>
            <TextInput style={styles.input} value={form.bizEmail} onChangeText={v => setForm({...form, bizEmail: v})} autoCapitalize="none" />
            <FieldLabel>Website URL</FieldLabel>
            <TextInput style={styles.input} value={form.website} onChangeText={v => setForm({...form, website: v})} autoCapitalize="none" />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BANKING & PAYMENTS</Text>
            <FieldLabel>Bank Name</FieldLabel>
            <TextInput style={styles.input} value={form.bankName} onChangeText={v => setForm({...form, bankName: v})} />
            <FieldLabel>Account Name</FieldLabel>
            <TextInput style={styles.input} value={form.accountName} onChangeText={v => setForm({...form, accountName: v})} />
            <View style={{flexDirection: 'row', gap: 10}}>
              <View style={{flex: 1}}><FieldLabel>BSB</FieldLabel><TextInput style={styles.input} value={form.bsb} onChangeText={v => setForm({...form, bsb: v})} /></View>
              <View style={{flex: 1}}><FieldLabel>Account Number</FieldLabel><TextInput style={styles.input} value={form.account} onChangeText={v => setForm({...form, account: v})} /></View>
            </View>
            <FieldLabel>PayID (Optional)</FieldLabel>
            <TextInput style={styles.input} value={form.payId} onChangeText={v => setForm({...form, payId: v})} />
            <FieldLabel>Default Payment Terms</FieldLabel>
            <TextInput style={styles.input} value={form.paymentTerms} onChangeText={v => setForm({...form, paymentTerms: v})} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NOTIFICATIONS & GST</Text>
            
            <View style={styles.rowBetween}>
              <View><Text style={styles.rowTitle}>Morning Briefing Alerts</Text><Text style={styles.rowSub}>Daily push notification summary</Text></View>
              <Toggle on={form.briefingEnabled} onToggle={v => setForm({...form, briefingEnabled: v})} />
            </View>
            {form.briefingEnabled && (
              <View style={{marginTop: 10, marginBottom: 16}}>
                <FieldLabel>Briefing Time (24hr format)</FieldLabel>
                <TextInput style={styles.input} value={form.briefingTime} onChangeText={v => setForm({...form, briefingTime: v})} placeholder="07:30" />
              </View>
            )}

            <View style={styles.rowBetween}>
              <View><Text style={styles.rowTitle}>Charge GST</Text><Text style={styles.rowSub}>Applied to online invoices</Text></View>
              <Toggle on={form.gstEnabled} onToggle={v => setForm({...form, gstEnabled: v})} />
            </View>
            {form.gstEnabled && (
              <View style={{marginTop: 10}}>
                <FieldLabel>GST Rate (%)</FieldLabel>
                <TextInput style={styles.input} value={form.gstRate} onChangeText={v => setForm({...form, gstRate: v})} keyboardType="numeric" />
              </View>
            )}
          </View>

          <Button variant="primary" style={{ marginTop: 20 }} onPress={handleSave}>💾 Save Settings</Button>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.offwhite },
  content: { padding: 16, paddingBottom: 60 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.grayLight },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: colors.orange, marginBottom: 14, letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, backgroundColor: '#fff', marginBottom: 12, color: colors.charcoal },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  rowTitle: { fontWeight: '700', fontSize: 13, color: colors.charcoal },
  rowSub: { fontSize: 11, color: colors.gray, marginTop: 2 },
  logoutBtn: { marginTop: 30, paddingVertical: 16, alignItems: 'center' },
  logoutText: { color: colors.red, fontWeight: '700', fontSize: 14 }
});