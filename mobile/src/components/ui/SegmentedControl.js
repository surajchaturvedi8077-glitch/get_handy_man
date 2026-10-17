import React from 'react';
import { View, Pressable, Text, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { colors } from '../../theme/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SegmentedControl({ options, value, onChange, dark = false }) {
  const handleSelect = (val) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onChange(val);
  };

  return (
    <View style={[styles.wrap, { backgroundColor: dark ? colors.charcoal2 : '#E2E8F0' }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => handleSelect(opt.value)}
            style={[
              styles.segment,
              active && {
                backgroundColor: dark ? colors.blue : '#fff',
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 3,
                elevation: 2,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? (dark ? '#fff' : colors.blue) : dark ? '#CBD5E1' : colors.gray },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', borderRadius: 10, padding: 3 },
  segment: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  label: { fontSize: 11, fontWeight: '700' },
});