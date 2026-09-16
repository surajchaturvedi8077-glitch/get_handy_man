/**
 * BusinessDetailsForm.js
 * ------------------------------------------------------------------
 * Business name / ABN / contact email shown on invoice & quote PDFs.
 * Controlled: {settings, onChange} where onChange(patch) merges into
 * the parent's draft state (SettingsScreen decides when to save).
 * ------------------------------------------------------------------
 */
import { View, TextInput, StyleSheet } from 'react-native';
import FieldLabel from '../ui/FieldLabel';
import { colors } from '../../theme/colors';

export default function BusinessDetailsForm({ settings, onChange }) {
  return (
    <View>
      <FieldLabel>Business name</FieldLabel>
      <TextInput
        value={settings.businessName}
        onChangeText={(v) => onChange({ businessName: v })}
        style={styles.input}
      />
      <FieldLabel>ABN</FieldLabel>
      <TextInput value={settings.abn} onChangeText={(v) => onChange({ abn: v })} style={styles.input} />
      <FieldLabel>Business email</FieldLabel>
      <TextInput
        value={settings.bizEmail}
        onChangeText={(v) => onChange({ bizEmail: v })}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.grayLight,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 12,
  },
});
