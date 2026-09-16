/**
 * ErrorState.js
 * ------------------------------------------------------------------
 * Small centered error message, shown when a data hook's `error` is set.
 * ------------------------------------------------------------------
 */
import { Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function ErrorState({ children }) {
  return <Text style={styles.text}>{children}</Text>;
}

const styles = StyleSheet.create({
  text: { color: colors.red, fontSize: 12.5, textAlign: 'center', paddingVertical: 16 },
});
