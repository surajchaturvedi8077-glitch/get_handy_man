import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import PhotoUploadButton from './PhotoUploadButton';
import { colors } from '../../theme/colors';

export default function CostItemRow({ item, onChange, onRemove, onUploadPhoto }) {
  return (
    <View style={styles.row}>
      <TextInput
        value={item.name}
        onChangeText={(v) => onChange({ ...item, name: v })}
        style={[styles.input, { flex: 1 }]}
      />
      <TextInput
        value={String(item.cost)}
        onChangeText={(v) => onChange({ ...item, cost: v })}
        keyboardType="numeric"
        style={[styles.input, { width: 56 }]}
      />
      <PhotoUploadButton photoUrl={item.photoUrl} onUpload={onUploadPhoto} />
      <Pressable onPress={onRemove} hitSlop={8}>
        <Text style={styles.remove}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.grayLight,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 9,
    fontSize: 12,
  },
  remove: { color: colors.red, fontWeight: '700', fontSize: 16 },
});