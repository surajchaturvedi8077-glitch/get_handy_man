/**
 * Button.js
 * ------------------------------------------------------------------
 * The one button component every screen uses. `variant` picks the
 * color treatment: 'primary' (orange), 'dark', 'green', 'outline'.
 * ------------------------------------------------------------------
 */
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const VARIANTS = {
  primary: { background: colors.orange, text: '#fff', border: 'transparent' },
  dark: { background: colors.charcoal, text: '#fff', border: 'transparent' },
  green: { background: colors.green, text: '#fff', border: 'transparent' },
  outline: { background: '#fff', text: colors.charcoal, border: colors.charcoal },
};

export default function Button({ variant = 'primary', children, onPress, disabled, style }) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        { backgroundColor: v.background, borderColor: v.border, opacity: disabled ? 0.6 : 1 },
        style,
      ]}
    >
      <Text style={[styles.text, { color: v.text }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    borderWidth: 1.5,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontWeight: '700', fontSize: 13 },
});
