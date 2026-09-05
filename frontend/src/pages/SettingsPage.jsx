/**
 * SettingsPage.jsx
 * ------------------------------------------------------------------
 * Business settings screen: branding (name/ABN/email/logo) and the
 * GST default toggle/rate. Loads via useSettings(), saves via its
 * update()/logo-upload — each section commits independently.
 * ------------------------------------------------------------------
 */
import { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell.jsx';
import ScreenHeader from '../components/layout/ScreenHeader.jsx';
import BusinessDetailsForm from '../components/settings/BusinessDetailsForm.jsx';
import LogoUploader from '../components/settings/LogoUploader.jsx';
import GstSettingsToggle from '../components/settings/GstSettingsToggle.jsx';
import Button from '../components/ui/Button.jsx';
import useSettings from '../hooks/useSettings.js';
import useToast from '../hooks/useToast.js';
import * as settingsApi from '../api/settingsApi';

export default function SettingsPage() {
  const { settings, update, refresh } = useSettings();
  const { showToast } = useToast();
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) setDraft(settings);
  }, [settings]);

  if (!draft) return <AppShell activeTab="dashboard"><div style={{ padding: 16 }}>Loading…</div></AppShell>;

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

  async function handleLogoUpload(file) {
    await settingsApi.uploadLogo(file);
    await refresh();
    showToast('Logo updated');
  }

  return (
    <AppShell activeTab="dashboard">
      <ScreenHeader title="SETTINGS" onBack={false} />
      <div style={{ padding: 16 }}>
        <LogoUploader logoUrl={draft.logoUrl} onUpload={handleLogoUpload} />
        <hr style={{ border: 'none', borderTop: '1px solid var(--gray-light)', margin: '16px 0' }} />
        <BusinessDetailsForm settings={draft} onChange={patch} />
        <hr style={{ border: 'none', borderTop: '1px solid var(--gray-light)', margin: '4px 0 16px' }} />
        <GstSettingsToggle
          gstEnabled={draft.gstEnabled}
          gstRate={draft.gstRate}
          onToggle={() => patch({ gstEnabled: !draft.gstEnabled })}
          onRateChange={(gstRate) => patch({ gstRate })}
        />
        <Button variant="primary" style={{ width: '100%', marginTop: 20 }} disabled={saving} onClick={handleSave}>
          {saving ? 'Saving…' : 'Save settings'}
        </Button>
      </div>
    </AppShell>
  );
}
