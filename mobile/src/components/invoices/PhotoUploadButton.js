import { Pressable, Image, Text, StyleSheet, Alert, Share } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';

const BASE_URL = 'https://gold-worm-334910.hostingersite.com';

export default function PhotoUploadButton({ photoUrl, onUpload }) {
  async function pickPhoto() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "We need camera roll permissions to upload receipts.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        // RESTORED: Using the exact enum that successfully opens the gallery
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.2, // Keeps compression to prevent Hostinger size limits
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        onUpload(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Could not open the photo gallery.");
    }
  }

  const sharePhoto = async (url) => {
    try {
      await Share.share({ message: `Receipt Attachment: ${url}`, url: url });
    } catch (error) {
      Alert.alert("Error", "Could not share the image.");
    }
  };

  if (photoUrl) {
    const fullUrl = photoUrl.startsWith('http') ? photoUrl : `${BASE_URL}${photoUrl}`;
    return (
      <Pressable onPress={() => sharePhoto(fullUrl)}>
        <Image source={{ uri: fullUrl }} style={styles.thumb} />
      </Pressable>
    );
  }

  return (
    <Pressable onPress={pickPhoto} style={styles.addBtn}>
      <Text style={styles.icon}>📷</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  thumb: { width: 30, height: 30, borderRadius: 6 },
  addBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.orangeTint, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 14 },
});