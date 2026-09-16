/**
 * Chip.js
 * ------------------------------------------------------------------
 * A small status pill, e.g. "New", "Confirmed", "Paid". `tone` picks
 * the color: 'green' | 'orange' | 'blue' | 'red'.
 * ------------------------------------------------------------------
 */
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const TONES = {
  green: { bg: colors.greenTint, fg: colors.green },
  orange: { bg: colors.orangeTint, fg: colors.orangeDeep },
  blue: { bg: colors.blueTint, fg: colors.blue },
  red: { bg: colors.redTint, fg: colors.red },
};

export default function Chip({ tone = 'orange', children }) {
  const t = TONES[tone];
  return (
    <View style={[styles.chip, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, alignSelf: 'flex-start' },
  text: { fontSize: 9.5, fontWeight: '700' },
});
