/**
 * Toast.js
 * ------------------------------------------------------------------
 * The floating confirmation banner ("Job deleted", "Quote sent"...).
 * Rendered once by ToastContext; shows/hides based on whether
 * `message` is set. Uses pointerEvents="none" so it never blocks taps.
 * ------------------------------------------------------------------
 */
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: colors.charcoalDeep,
    borderRadius: 10,
    padding: 14,
  },
  text: { color: '#fff', fontSize: 12.5, fontWeight: '600', textAlign: 'center' },
});
