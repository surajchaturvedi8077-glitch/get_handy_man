import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/colors';

const VARIANTS = {
  primary: { background: colors.blue, text: '#fff', border: 'transparent' },
  dark: { background: colors.charcoal, text: '#fff', border: 'transparent' },
  green: { background: colors.green, text: '#fff', border: 'transparent' },
  outline: { background: '#fff', text: colors.charcoal, border: colors.grayLight },
};

export default function Button({ variant = 'primary', children, onPress, disabled, style }) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.base,
          { backgroundColor: v.background, borderColor: v.border, opacity: disabled ? 0.6 : 1 },
          style,
        ]}
      >
        <Text style={[styles.text, { color: v.text }]}>{children}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    borderWidth: 1.5,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  text: { fontWeight: '700', fontSize: 13 },
});