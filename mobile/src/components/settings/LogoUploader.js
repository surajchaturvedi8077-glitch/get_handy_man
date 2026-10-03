import { View, Text, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import FieldLabel from '../ui/FieldLabel';
import Button from '../ui/Button';
import { colors } from '../../theme/colors';

export default function LogoUploader({ logoUrl, onUpload }) {
  async function pickImage() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "We need camera roll permissions to upload the logo.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        // RESTORED: Using the exact enum that successfully opens the gallery
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.2, 
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        onUpload(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Could not open the photo gallery.");
    }
  }

  return (
    <View>
      <FieldLabel>Business logo</FieldLabel>
      <View style={styles.row}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={styles.logo} />
        ) : (
          <Text style={styles.hint}>No logo uploaded</Text>
        )}
        <Button variant="outline" onPress={pickImage} style={styles.btn}>
          {logoUrl ? 'Change logo' : 'Upload logo'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  logo: { height: 44, width: 90, resizeMode: 'contain' },
  hint: { fontSize: 12, color: colors.gray },
  btn: { paddingHorizontal: 12, paddingVertical: 8 },
});