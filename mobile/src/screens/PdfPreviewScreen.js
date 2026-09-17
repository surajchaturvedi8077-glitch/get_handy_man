import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import ScreenHeader from '../components/layout/ScreenHeader';
import { colors } from '../theme/colors';

export default function PdfPreviewScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { uri, title } = params;

  const handleShare = async () => {
    await Sharing.shareAsync(uri, { 
      UTI: '.pdf', 
      mimeType: 'application/pdf',
      dialogTitle: title || 'Document.pdf'
    });
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="PREVIEW DOCUMENT" />
      <WebView 
        source={{ uri }} 
        style={styles.webview} 
        originWhitelist={['*']}
        allowFileAccess={true}
      />
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareText}>Share PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  webview: { flex: 1 },
  footer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderColor: colors.grayLight, gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1.5, borderColor: colors.charcoal, alignItems: 'center' },
  cancelText: { fontWeight: '700', color: colors.charcoal },
  shareBtn: { flex: 2, paddingVertical: 12, borderRadius: 8, backgroundColor: colors.orange, alignItems: 'center' },
  shareText: { fontWeight: '700', color: '#fff' }
});