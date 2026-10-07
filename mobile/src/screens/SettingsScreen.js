import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import ScreenHeader from '../components/layout/ScreenHeader';
import LogoUploader from '../components/settings/LogoUploader';
import Button from '../components/ui/Button';
import Toggle from '../components/ui/Toggle';
import FieldLabel from '../components/ui/FieldLabel';
import LoadingState from '../components/ui/LoadingState';
import useSettings from '../hooks/useSettings';
import useToast from '../hooks/useToast';
import useAuth from '../hooks/useAuth';
import * as settingsService from '../services/settingsService';
import { apiClient } from '../services/apiClient';
import { scheduleDailyMorningBriefing, getSavedBriefingPref } from '../services/notificationService';
import { colors } from '../theme/colors';

function SettingInput({ label, value, onChange, placeholder, multiline = false, secureTextEntry = false }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <FieldLabel>{label}</FieldLabel>
      <TextInput
        style={[styles.input, multiline && { minHeight: 70, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
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
  const { logout } = useAuth();
  
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);

  // Morning Briefing Customization State
  const [briefingEnabled, setBriefingEnabled] = useState(true);
  const [briefingTime, setBriefingTime] = useState('07:30');
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (settings) {
      setDraft(settings);
      if (settings.briefingEnabled !== undefined) setBriefingEnabled(settings.briefingEnabled);
      if (settings.briefingTime) setBriefingTime(settings.briefingTime);
    }
    // Load phone fail-safe settings
    getSavedBriefingPref().then(pref => {
      if (pref) {
        if (pref.enabled !== undefined) setBriefingEnabled(pref.enabled);
        if (pref.timeStr) setBriefingTime(pref.timeStr);
      }
    });
  }, [settings]);

  function patch(fields) { setDraft(prev => ({ ...prev, ...fields })); }

  const formatDisplayTime = (time24) => {
    if (!time24 || !time24.includes(':')) return '7:30 AM';
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    const minStr = String(m).padStart(2, '0');
    return `${hour12}:${minStr} ${ampm}`;
  };

  const onTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (event.type === 'set' && selectedDate) {
      const h = String(selectedDate.getHours()).padStart(2, '0');
      const m = String(selectedDate.getMinutes()).padStart(2, '0');
      const formatted = `${h}:${m}`;
      setBriefingTime(formatted);
      patch({ briefingTime: formatted });
    }
  };

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...draft,
        briefingEnabled,
        briefingTime,
      };
      await update(payload);
      // Immediately apply the customized alarm
      await scheduleDailyMorningBriefing(briefingEnabled, briefingTime);
      showToast('Settings saved successfully');
    } catch (err) {
      Alert.alert('Error', 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  }

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) return Alert.alert("Error", "Please enter both passwords.");
    setChangingPwd(true);
    try {
      await apiClient.put('/api/auth/password', { oldPassword, newPassword });
      showToast("✅ Password Updated Successfully!");
      setOldPassword('');
      setNewPassword('');
    } catch (e) {
      Alert.alert("Error", e.response?.data?.message || "Failed to change password. Is your current password correct?");
    } finally {
      setChangingPwd(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: async () => await logout() }
    ]);
  };

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
          channelId: 'alerts-v2',
        },
        trigger: null,
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
      Alert.alert('Backend Error', 'Ensure your Node.js server is running and the /test-briefing route is saved.');
    }
  }

  if (!draft) return <View style={styles.screen}><ScreenHeader title="SETTINGS" /><LoadingState /></View>;

  const [tHour, tMin] = briefingTime.split(':').map(Number);
  const pickerDate = new Date();
  pickerDate.setHours(tHour || 7, tMin || 30, 0, 0);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="SETTINGS" />
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Morning Briefing Settings */}
        <FieldLabel style={styles.sectionHeader}>Daily Morning Briefing</FieldLabel>
        <View style={styles.card}>
          <ToggleRow
            title="Enable Morning Briefing"
            sub="Rings your phone every morning with today's jobs"
            value={briefingEnabled}
            onToggle={() => {
              const next = !briefingEnabled;
              setBriefingEnabled(next);
              patch({ briefingEnabled: next });
            }}
          />
          {briefingEnabled && (
            <View style={{ marginTop: 12 }}>
              <FieldLabel>Briefing Time</FieldLabel>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
                style={[styles.input, { justifyContent: 'center', height: 42, marginTop: 4 }]}
              >
                <Text style={{ color: colors.charcoal, fontSize: 13, fontWeight: '700' }}>
                  ⏰ {formatDisplayTime(briefingTime)} (Tap to change)
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

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

        <FieldLabel style={styles.sectionHeader}>Security</FieldLabel>
        <View style={styles.card}>
          <SettingInput label="Current Password" value={oldPassword} onChange={setOldPassword} secureTextEntry placeholder="••••••••" />
          <SettingInput label="New Password" value={newPassword} onChange={setNewPassword} secureTextEntry placeholder="••••••••" />
          <Button variant="outline" onPress={handleChangePassword} disabled={changingPwd} style={{ marginTop: 6 }}>
            {changingPwd ? 'Updating...' : 'Update Password'}
          </Button>
        </View>

        <FieldLabel style={styles.sectionHeader}>Troubleshooting</FieldLabel>
        <View style={[styles.card, { marginBottom: 30 }]}>
          <Button variant="outline" onPress={forceTestNotifications} style={{ marginBottom: 12 }}>
            🔔 Test & Enable Notifications
          </Button>
          <Button variant="outline" onPress={fireBackendBriefing}>
            🚀 Send Morning Briefing Now
          </Button>
        </View>

        <Button variant="primary" onPress={handleSave} disabled={saving} style={{ marginBottom: 12 }}>
          {saving ? 'Saving…' : 'Save all settings'}
        </Button>

        <Button variant="outline" onPress={handleLogout} style={{ borderColor: colors.red, borderWidth: 1.5, marginBottom: 40 }}>
          <Text style={{ color: colors.red, fontWeight: '700' }}>Log out</Text>
        </Button>

      </ScrollView>

      {showTimePicker && (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}
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