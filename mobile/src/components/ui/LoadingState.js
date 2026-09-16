/**
 * LoadingState.js
 * ------------------------------------------------------------------
 * Small centered spinner + label shown while a screen's data is
 * loading. Used across every list/detail screen for consistency.
 * ------------------------------------------------------------------
 */
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function LoadingState({ label = 'Loading…' }) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.orange} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  text: { color: colors.gray, fontSize: 12.5 },
});
