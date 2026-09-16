/**
 * PhotoUploadButton.js
 * ------------------------------------------------------------------
 * Shows the receipt photo thumbnail if one's attached, or a camera
 * icon button to pick one from the phone's gallery. Hands the picked
 * asset up via onUpload — CostItemRow passes it to
 * services/invoiceService.uploadCostItemPhoto().
 * ------------------------------------------------------------------
 */
import { Pressable, Image, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';

export default function PhotoUploadButton({ photoUrl, onUpload }) {
  async function pickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) onUpload(result.assets[0]);
  }

  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} style={styles.thumb} />;
  }

  return (
    <Pressable onPress={pickPhoto} style={styles.addBtn}>
      <Text style={styles.icon}>📷</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  thumb: { width: 30, height: 30, borderRadius: 6 },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 14 },
});
