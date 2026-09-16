/**
 * SettingsScreen.js
 * ------------------------------------------------------------------
 * Business settings screen: branding (name/ABN/email/logo) and the
 * GST default toggle/rate. Loads via useSettings(), saves through
 * services/settingsService.js (via update()/uploadLogo()).
 * ------------------------------------------------------------------
 */
import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import ScreenHeader from '../components/layout/ScreenHeader';
import BusinessDetailsForm from '../components/settings/BusinessDetailsForm';
import LogoUploader from '../components/settings/LogoUploader';
import GstSettingsToggle from '../components/settings/GstSettingsToggle';
import Button from '../components/ui/Button';
import LoadingState from '../components/ui/LoadingState';
import useSettings from '../hooks/useSettings';
import useToast from '../hooks/useToast';
import * as settingsService from '../services/settingsService';

export default function SettingsScreen() {
  const { settings, update, refresh } = useSettings();
  const { showToast } = useToast();
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) setDraft(settings);
  }, [settings]);

  function patch(fields) {
    setDraft((prev) => ({ ...prev, ...fields }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await update(draft);
      showToast('Settings saved');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(asset) {
    await settingsService.uploadLogo(asset);
    await refresh();
    showToast('Logo updated');
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="SETTINGS" />
      {!draft ? (
        <LoadingState />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <LogoUploader logoUrl={settingsService.resolveMediaUrl(draft.logoUrl)} onUpload={handleLogoUpload} />
          <View style={styles.divider} />
          <BusinessDetailsForm settings={draft} onChange={patch} />
          <View style={styles.divider} />
          <GstSettingsToggle
            gstEnabled={draft.gstEnabled}
            gstRate={draft.gstRate}
            onToggle={() => patch({ gstEnabled: !draft.gstEnabled })}
            onRateChange={(gstRate) => patch({ gstRate })}
          />
          <Button variant="primary" onPress={handleSave} disabled={saving} style={{ marginTop: 20 }}>
            {saving ? 'Saving…' : 'Save settings'}
          </Button>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  divider: { borderTopWidth: 1, borderTopColor: '#E5E7EB', marginVertical: 16 },
});
