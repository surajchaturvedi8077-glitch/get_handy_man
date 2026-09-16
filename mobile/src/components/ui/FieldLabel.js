/**
 * FieldLabel.js
 * ------------------------------------------------------------------
 * A small uppercase section/field caption, e.g. "MATERIAL EXPENSES".
 * ------------------------------------------------------------------
 */
import { Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function FieldLabel({ children, style }) {
  return <Text style={[styles.label, style]}>{typeof children === 'string' ? children.toUpperCase() : children}</Text>;
}

const styles = StyleSheet.create({
  label: { fontSize: 10, fontWeight: '700', color: colors.gray, letterSpacing: 0.4, marginBottom: 4 },
});
