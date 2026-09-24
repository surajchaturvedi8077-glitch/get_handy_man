import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, TextInput, StyleSheet, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import ScreenHeader from '../components/layout/ScreenHeader';
import LogoUploader from '../components/settings/LogoUploader';
import Button from '../components/ui/Button';
import Toggle from '../components/ui/Toggle';
import FieldLabel from '../components/ui/FieldLabel';
import LoadingState from '../components/ui/LoadingState';
import useSettings from '../hooks/useSettings';
import useToast from '../hooks/useToast';
import * as settingsService from '../services/settingsService';
import { colors } from '../theme/colors';

function SettingInput({ label, value, onChange, placeholder, multiline = false }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <FieldLabel>{label}</FieldLabel>
      <TextInput
        style={[styles.input, multiline && { minHeight: 70, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline={multiline}
        placeholderTextColor={colors.gray}
      />
    </View>
  );
}

function ToggleRow({ title, sub, value, onToggle }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderColor: colors.grayLight }}>
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={{ fontWeight: '700', fontSize: 12.5, color: colors.charcoal }}>{title}</Text>
        <Text style={{ fontSize: 10.5, color: colors.gray, marginTop: 2 }}>{sub}</Text>
      </View>
      <Toggle on={value} onToggle={onToggle} />
    </View>
  );
}

export default function SettingsScreen() {
  const { settings, update, refresh } = useSettings();
  const { showToast } = useToast();
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (settings) setDraft(settings); }, [settings]);

  function patch(fields) { setDraft(prev => ({ ...prev, ...fields })); }

  async function handleSave() {
    setSaving(true);
    try {
      await update(draft);
      showToast('Settings saved successfully');
    } finally {
      setSaving(false);
    }
  }

  // FIXED: Added a manual trigger to force the OS permission prompt and fire a test alert
  async function forceTestNotifications() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'You must enable notifications for this app inside your phone settings.');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Alert 🔔",
          body: "Push notifications and lock screen alerts are working perfectly!",
          sound: true,
          channelId: 'alerts-v2', // Uses the High Priority channel
        },
        trigger: null, // Fires immediately
      });
      showToast('Test alert sent!');
    } catch (error) {
      Alert.alert('Error', 'Could not fire notification.');
    }
  }

  async function fireBackendBriefing() {
    try {
      showToast('Requesting briefing from server...');
      await settingsService.triggerMorningBriefing();
    } catch (e) {
      Alert.alert('Error', 'Could not trigger briefing from backend.');
    }
  }

  if (!draft) return <View style={styles.screen}><ScreenHeader title="SETTINGS" /><LoadingState /></View>;

  return (
    <View style={styles.screen}>
      <ScreenHeader title="SETTINGS" />
      <ScrollView contentContainerStyle={styles.content}>
        
        <FieldLabel style={styles.sectionHeader}>Tax & Invoicing</FieldLabel>
        <View style={styles.card}>
          <ToggleRow title="GST on invoices" sub="Applied to online-payment invoices only" value={draft.gstEnabled} onToggle={() => patch({ gstEnabled: !draft.gstEnabled })} />
          {draft.gstEnabled && <SettingInput label="GST Rate (%)" value={String(draft.gstRate)} onChange={v => patch({ gstRate: Number(v) || 0 })} />}
          <SettingInput label="Invoice Number Prefix" value={draft.invoicePrefix} onChange={v => patch({ invoicePrefix: v })} />
          <SettingInput label="Default Payment Terms" value={draft.paymentTerms} onChange={v => patch({ paymentTerms: v })} />
        </View>

        <FieldLabel style={styles.sectionHeader}>Business Profile</FieldLabel>
        <View style={styles.card}>
          <LogoUploader logoUrl={settingsService.resolveMediaUrl(draft.logoUrl)} onUpload={async (asset) => { await settingsService.uploadLogo(asset); refresh(); showToast('Logo updated'); }} />
          <View style={{ height: 16 }} />
          <SettingInput label="Business Name" value={draft.businessName} onChange={v => patch({ businessName: v })} />
          <SettingInput label="ABN" value={draft.abn} onChange={v => patch({ abn: v })} />
          <SettingInput label="City, State (Shown on invoices)" value={draft.bizCityState} onChange={v => patch({ bizCityState: v })} />
          <SettingInput label="Website" value={draft.website} onChange={v => patch({ website: v })} />
          <SettingInput label="Business Address" value={draft.bizAddress} onChange={v => patch({ bizAddress: v })} />
          <SettingInput label="Phone" value={draft.bizPhone} onChange={v => patch({ bizPhone: v })} />
          <SettingInput label="Email" value={draft.bizEmail} onChange={v => patch({ bizEmail: v })} />
        </View>

        <FieldLabel style={styles.sectionHeader}>Bank & PayID Transfer Details</FieldLabel>
        <View style={styles.card}>
          <SettingInput label="Bank Name" value={draft.bankName} onChange={v => patch({ bankName: v })} />
          <SettingInput label="BSB" value={draft.bsb} onChange={v => patch({ bsb: v })} />
          <SettingInput label="Account Number" value={draft.account} onChange={v => patch({ account: v })} />
          <SettingInput label="Account Name" value={draft.accountName} onChange={v => patch({ accountName: v })} />
          <SettingInput label="PayID (Email / Phone / ABN)" value={draft.payId} onChange={v => patch({ payId: v })} />
        </View>

        <FieldLabel style={styles.sectionHeader}>Quote Template</FieldLabel>
        <View style={styles.card}>
          <SettingInput label="Default Intro Message" value={draft.quoteMessage} onChange={v => patch({ quoteMessage: v })} multiline />
        </View>

        <FieldLabel style={styles.sectionHeader}>Troubleshooting</FieldLabel>
        <View style={[styles.card, { marginBottom: 30 }]}>
          <Button variant="outline" onPress={forceTestNotifications}>
            🔔 Test & Enable Notifications
          </Button>
        </View>
        

        <Button variant="primary" onPress={handleSave} disabled={saving} style={{ marginBottom: 40 }}>
          {saving ? 'Saving…' : 'Save all settings'}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.offwhite },
  content: { padding: 16 },
  sectionHeader: { marginBottom: 6, marginTop: 10, color: colors.gray },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.grayLight, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, backgroundColor: '#fff', marginTop: 4, color: colors.charcoal }
});